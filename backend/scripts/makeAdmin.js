const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const makeAdmin = async () => {
  try {
    // Connect to MongoDB (same as server.js)
    const mongoUri = 'mongodb://127.0.0.1:27017/foodEcommerceDB';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get email from command line argument or prompt
    const email = process.argv[2];

    if (!email) {
      console.log('\n❌ Please provide an email address');
      console.log('Usage: node scripts/makeAdmin.js your-email@gmail.com\n');
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`\n❌ User with email "${email}" not found in database`);
      console.log('Please check the email address and try again.\n');
      process.exit(1);
    }

    // Check if already admin
    if (user.role === 'admin') {
      console.log(`\n✅ User "${email}" is already an admin!\n`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Update user to admin
    user.role = 'admin';
    await user.save();

    console.log(`\n✅ Successfully made "${email}" an admin!`);
    console.log(`   User: ${user.firstName} ${user.lastName}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Role: ${user.role}\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

makeAdmin();

