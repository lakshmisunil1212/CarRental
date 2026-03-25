#!/usr/bin/env node
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function main() {
  try {
    await connectDB();

    const name = process.env.ADMIN_NAME || 'Admin';
    const email = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
    const password = process.env.ADMIN_PASS || 'Admin@123';

    // Check for existing admin
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log('Admin account already exists:', existing.email);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = new User({ name: name.trim(), email, password: hashed, role: 'admin' });
    await user.save();

    console.log('Admin user created: %s', email);
    console.log('You can now log in via POST /api/auth/login');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin:', err.message || err);
    process.exit(1);
  }
}

main();
