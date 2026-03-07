const mongoose = require('mongoose');
const User = require('../models/User.model');
const Leave = require('../models/Leave.model');
require('dotenv').config({ path: '../.env' }); // adjusted path if needed, we'll run from backend root later

const employees = [
  { name: 'John Cook', email: 'john@test.com', dept: 'Development' },
  { name: 'Cameron Hayes', email: 'cameron@test.com', dept: 'Marketing' },
  { name: 'Lily Reed', email: 'lily@test.com', dept: 'Design' },
  { name: 'Riley Morris', email: 'riley@test.com', dept: 'Sales' },
  { name: 'Alexander Moore', email: 'alexander@test.com', dept: 'Engineering' },
  { name: 'Addison Watson', email: 'addison@test.com', dept: 'HR' },
  { name: 'Avery Nelson', email: 'avery@test.com', dept: 'Support' },
  { name: 'David Wright', email: 'david@test.com', dept: 'Operations' },
  { name: 'Samuel Young', email: 'samuel@test.com', dept: 'Management' }
];

const leaveData = [
  { type: 'Earned Leave', status: 'Approved', daysOffsetStart: 1, daysOffsetEnd: 4, reason: 'Vacation' },
  { type: 'Sick Leave', status: 'Pending', daysOffsetStart: 2, daysOffsetEnd: 4, reason: 'Health Issue' },
  { type: 'Casual Leave', status: 'Approved', daysOffsetStart: -5, daysOffsetEnd: -4, reason: 'Family Emergency' },
  { type: 'Earned Leave', status: 'Rejected', daysOffsetStart: -10, daysOffsetEnd: -5, reason: 'Study' },
  { type: 'Casual Leave', status: 'Pending', daysOffsetStart: 5, daysOffsetEnd: 7, reason: 'Personal Trip' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/leave_management');
    console.log('Connected to MongoDB');

    // Make sure we have the employer
    let hr = await User.findOne({ email: 'employer@test.com' });
    if (!hr) {
      hr = await User.create({
        name: 'Admin Manager',
        email: 'employer@test.com',
        password: 'password123',
        role: 'employer'
      });
    }

    // Create realistic employees
    const createdEmps = [];
    for (const emp of employees) {
      let user = await User.findOne({ email: emp.email });
      if (!user) {
        user = await User.create({
          name: emp.name,
          email: emp.email,
          password: 'password123',
          role: 'employee',
          department: emp.dept
        });
      }
      createdEmps.push(user);
    }

    // Generate Leaves randomly for them
    await Leave.deleteMany({}); // Clear old leaves for clean slate
    
    console.log('Generating leaves...');
    for (const emp of createdEmps) {
      // Pick 1-3 random leaves for each person
      const numLeaves = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numLeaves; i++) {
        const randomTemplate = leaveData[Math.floor(Math.random() * leaveData.length)];
        const start = new Date();
        start.setDate(start.getDate() + randomTemplate.daysOffsetStart);
        const end = new Date();
        end.setDate(end.getDate() + randomTemplate.daysOffsetEnd);

        await Leave.create({
          employee: emp._id,
          leaveType: randomTemplate.type,
          startDate: start,
          endDate: end,
          reason: randomTemplate.reason,
          status: randomTemplate.status,
          reviewedBy: randomTemplate.status !== 'Pending' ? hr._id : null
        });
      }
    }

    console.log('Seeding complete! Lots of data added.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
