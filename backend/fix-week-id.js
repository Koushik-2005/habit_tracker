import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fixWeekId() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const weeks = await mongoose.connection.db.collection('weeks').find({}).toArray();
    console.log('Current weeks:');
    weeks.forEach(w => console.log('  -', w.weekId, w.isCurrent ? '(current)' : ''));

    // Update the week ID from 2025-W53 to 2026-W01
    const result = await mongoose.connection.db.collection('weeks').updateOne(
      { weekId: '2025-W53' },
      { $set: { weekId: '2026-W01' } }
    );
    console.log('Updated', result.modifiedCount, 'document(s)');

    // Verify the update
    const updatedWeeks = await mongoose.connection.db.collection('weeks').find({}).toArray();
    console.log('\nUpdated weeks:');
    updatedWeeks.forEach(w => console.log('  -', w.weekId, w.isCurrent ? '(current)' : ''));

    await mongoose.disconnect();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixWeekId();
