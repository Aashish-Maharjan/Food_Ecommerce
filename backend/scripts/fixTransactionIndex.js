const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fixTransactionIndex = async () => {
  try {
    // Connect to MongoDB using the same method as the server
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodEcommerceDB';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB:', mongoUri);

    // Get the Transaction collection
    const db = mongoose.connection.db;
    const collection = db.collection('transactions');

    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    // Drop the unique index on product_id if it exists
    try {
      await collection.dropIndex('product_id_1');
      console.log('✅ Dropped unique index on product_id');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index product_id_1 does not exist (already dropped or never created)');
      } else {
        throw error;
      }
    }

    // Create a non-unique index on product_id for better query performance
    await collection.createIndex({ product_id: 1 }, { unique: false });
    console.log('✅ Created non-unique index on product_id');

    // Ensure transaction_uuid has a unique index
    try {
      await collection.createIndex({ transaction_uuid: 1 }, { unique: true });
      console.log('✅ Ensured unique index on transaction_uuid');
    } catch (error) {
      if (error.code === 85) {
        console.log('ℹ️  Unique index on transaction_uuid already exists');
      } else {
        throw error;
      }
    }

    // List indexes again to confirm
    const newIndexes = await collection.indexes();
    console.log('\nUpdated indexes:', newIndexes);

    console.log('\n✅ Index fix completed successfully!');
    console.log('\n⚠️  IMPORTANT: Restart your backend server for changes to take effect.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    console.error('Error details:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// Run the fix
fixTransactionIndex();

