const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const listUsers = async () => {
  try {
    // Connect to MongoDB (same as server.js)
    const mongoUri = 'mongodb://127.0.0.1:27017/foodEcommerceDB';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find({}).select('email firstName lastName username role emailSubscribed');

    if (users.length === 0) {
      console.log('No users found in database.\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('📋 Users in database:\n');
    console.log('─'.repeat(80));
    console.log(`${'Email'.padEnd(30)} ${'Name'.padEnd(20)} ${'Username'.padEnd(15)} ${'Role'.padEnd(10)} Subscribed`);
    console.log('─'.repeat(80));

    users.forEach((user, index) => {
      const name = `${user.firstName} ${user.lastName}`.substring(0, 18);
      const email = user.email.substring(0, 28);
      const username = user.username.substring(0, 13);
      const role = user.role.padEnd(8);
      const subscribed = user.emailSubscribed ? '✅' : '❌';
      
      console.log(`${email.padEnd(30)} ${name.padEnd(20)} ${username.padEnd(15)} ${role} ${subscribed}`);
    });

    console.log('─'.repeat(80));
    console.log(`\nTotal users: ${users.length}`);
    console.log(`Admins: ${users.filter(u => u.role === 'admin').length}`);
    console.log(`Subscribed: ${users.filter(u => u.emailSubscribed).length}\n`);

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

listUsers();

