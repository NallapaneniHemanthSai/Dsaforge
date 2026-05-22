const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Notes = require('../models/Notes');
const { ROLES } = require('../constants/roles');

const DEMO_STUDENT_PASSWORD = 'Demo@123';
const DEMO_ADMIN_PASSWORD = 'Admin@123';

const seedDemoAccounts = async () => {
  try {
    console.log('🌱 Seeding demo accounts...');

    // 1. Seed Demo Student
    const demoStudentEmail = 'demo@kluniversity.in';
    let demoStudent = await User.findOne({ email: demoStudentEmail });

    if (!demoStudent) {
      demoStudent = new User({
        name: 'Demo Student',
        username: 'demostudent',
        email: demoStudentEmail,
        password: DEMO_STUDENT_PASSWORD,
        isVerified: true,
        role: ROLES.USER,
        bio: 'Placement Prep Demo Account'
      });
      await demoStudent.save();
      console.log('✅ Created Demo Student');
    } else {
      let shouldSave = false;
      const passwordMatches = await demoStudent.comparePassword(DEMO_STUDENT_PASSWORD);
      if (!passwordMatches) {
        demoStudent.password = DEMO_STUDENT_PASSWORD;
        shouldSave = true;
      }
      if (!demoStudent.isVerified) {
        demoStudent.isVerified = true;
        shouldSave = true;
      }
      if (demoStudent.role !== ROLES.USER) {
        demoStudent.role = ROLES.USER;
        shouldSave = true;
      }
      if (shouldSave) await demoStudent.save();
      console.log('ℹ️ Demo Student already exists');
    }

    // Set up mock progress if empty or not existing
    let progress = await Progress.findOne({ userId: demoStudent._id });
    if (!progress) {
      progress = new Progress({
        userId: demoStudent._id,
        problems: [
          { problemId: 'two-sum', status: 'solved', bookmarked: true, solvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { problemId: 'valid-anagram', status: 'solved', bookmarked: false, solvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { problemId: 'binary-search', status: 'attempted', bookmarked: true, solvedAt: null }
        ]
      });
      await progress.save();
      console.log('✅ Created mock progress for Demo Student');
    }

    // Set up mock notes
    let notes = await Notes.findOne({ userId: demoStudent._id });
    if (!notes) {
      notes = new Notes({
        userId: demoStudent._id,
        content: '# Two Sum Notes\nUse a Hash Map to find the complement in `O(N)` time complexity and `O(N)` space complexity.\n\n# Binary Search Notes\nAlways check loop condition `low <= high` and update mid carefully.'
      });
      await notes.save();
      console.log('✅ Created mock notes for Demo Student');
    }

    // 2. Seed Demo Admin
    const demoAdminEmail = 'admin@kluniversity.in';
    let demoAdmin = await User.findOne({ email: demoAdminEmail });

    if (!demoAdmin) {
      demoAdmin = new User({
        name: 'System Admin',
        username: 'admin',
        email: demoAdminEmail,
        password: DEMO_ADMIN_PASSWORD,
        isVerified: true,
        role: ROLES.ADMIN,
        bio: 'DSAForge Platform Administrator'
      });
      await demoAdmin.save();
      console.log('✅ Created Demo Admin');
    } else {
      let shouldSave = false;
      const passwordMatches = await demoAdmin.comparePassword(DEMO_ADMIN_PASSWORD);
      if (!passwordMatches) {
        demoAdmin.password = DEMO_ADMIN_PASSWORD;
        shouldSave = true;
      }
      if (!demoAdmin.isVerified) {
        demoAdmin.isVerified = true;
        shouldSave = true;
      }
      if (demoAdmin.role !== ROLES.ADMIN) {
        demoAdmin.role = ROLES.ADMIN;
        shouldSave = true;
      }
      if (shouldSave) await demoAdmin.save();
      console.log('ℹ️ Demo Admin already exists');
    }

    console.log('🌱 Seeding demo accounts completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding demo accounts:', error.message);
  }
};

module.exports = seedDemoAccounts;
