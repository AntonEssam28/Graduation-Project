const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function fixData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const shelterId = new mongoose.Types.ObjectId('69e14e4c18ae0541bcf018f0');
    
    const db = mongoose.connection.db;
    const itemsCol = db.collection('storeitems');

    const result = await itemsCol.updateMany(
      { $or: [{ shelter: "" }, { shelter: null }, { shelter: { $exists: false } }] },
      { $set: { shelter: shelterId } }
    );

    console.log(`Successfully updated ${result.modifiedCount} store items.`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing data:', error);
    process.exit(1);
  }
}

fixData();
