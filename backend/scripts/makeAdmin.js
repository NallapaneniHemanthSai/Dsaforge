const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

const makeAdmin = async (email) => {
  try {
    console.log(`🔌 Connecting to MongoDB...`);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to DB');

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`ℹ️ User ${email} is already an admin.`);
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();
    
    console.log(`✅ Successfully updated ${email} to admin role!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user role:', error.message);
    process.exit(1);
  }
};

// Get email from command line argument
const targetEmail = process.argv[2];

if (!targetEmail) {
  console.log('❌ Please provide an email address.');
  console.log('Usage: node makeAdmin.js <email>');
  process.exit(1);
}

makeAdmin(targetEmail);
