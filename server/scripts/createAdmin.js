const mongoose = require('mongoose');
require('dotenv').config();

async function dropUsernameIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // List all indexes on users collection
    const indexes = await db.collection('users').indexes();
    console.log('Current indexes:', indexes);

    // Drop the username index if it exists
    try {
      await db.collection('users').dropIndex('username_1');
      console.log('Dropped username_1 index successfully');
    } catch (err) {
      console.log('username_1 index does not exist or already dropped');
    }

    // Create admin user
    const User = require('../models/User');
    
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created:', admin.email);
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropUsernameIndex();
