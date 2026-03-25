#!/usr/bin/env node
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function main() {
  try {
    await connectDB();

    const email = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
    const password = process.env.ADMIN_PASS || 'Admin@123';

    let user = await User.findOne({ email });
    if (!user) {
      // create admin if not exists
      const hashed = await bcrypt.hash(password, 12);
      user = new User({ name: process.env.ADMIN_NAME || 'Admin', email, password: hashed, role: 'admin' });
      await user.save();
      console.log('Admin created with email:', email);
      process.exit(0);
    }

    // Update password for existing user
    const hashed = await bcrypt.hash(password, 12);
    user.password = hashed;
    user.role = 'admin'; // ensure role is admin
    await user.save();
    console.log('Admin password reset for:', email);
    process.exit(0);
  } catch (err) {
    console.error('Failed to reset admin password:', err.message || err);
    process.exit(1);
  }
}

main();
