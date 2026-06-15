const User = require('../models/user');
const Doctor = require('../models/doctor');

const seedData = async () => {
  try {
    // Clean up old default seeded accounts if they exist
    const oldEmails = ['admin@doctor.com', 'jane@doctor.com', 'robert@doctor.com', 'ram@patient.com'];
    const usersToDelete = await User.find({ email: { $in: oldEmails } });
    const userIdsToDelete = usersToDelete.map(u => u._id);
    await Doctor.deleteMany({ user: { $in: userIdsToDelete } });
    await User.deleteMany({ email: { $in: oldEmails } });

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping seeder...');
      return;
    }

    console.log('Seeding database with default Indian accounts...');

    // 1. Seed Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@doctor.in',
      password: 'adminpassword',
      role: 'Admin',
      phoneNumber: '+91-9876543210',
      address: '100 Parliament Street, Connaught Place, New Delhi'
    });
    console.log('Admin user seeded: admin@doctor.in / adminpassword');

    // 2. Seed Doctor User 1 (Approved)
    const doctorUser = await User.create({
      name: 'Dr. Sunita Sharma',
      email: 'sunita@doctor.in',
      password: 'doctorpassword',
      role: 'Doctor',
      phoneNumber: '+91-9988776655',
      address: 'Suite 302, Cardio Block, Fortis Hospital'
    });

    await Doctor.create({
      user: doctorUser._id,
      specialization: 'Cardiology',
      experience: 15,
      fees: 800, // Rupees
      about: 'Dr. Sunita Sharma is a senior cardiologist with over 15 years of experience in diagnosing and treating cardiovascular disorders. She completed her MD and DM at AIIMS, New Delhi.',
      location: 'Fortis Hospital, Sector 62, Noida',
      isApproved: true,
      availability: [
        {
          date: '2026-06-16',
          slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']
        },
        {
          date: '2026-06-17',
          slots: ['10:00 AM', '11:00 AM', '01:00 PM', '04:00 PM']
        },
        {
          date: '2026-06-18',
          slots: ['09:00 AM', '10:00 AM', '03:00 PM', '04:00 PM']
        }
      ]
    });
    console.log('Doctor user seeded: sunita@doctor.in / doctorpassword (Approved)');

    // 3. Seed Doctor 2 User (Pending approval)
    const doctorUser2 = await User.create({
      name: 'Dr. Rajesh Patel',
      email: 'rajesh@doctor.in',
      password: 'doctorpassword',
      role: 'Doctor',
      phoneNumber: '+91-9123456789',
      address: 'Pediatric Wing, Apollo Hospitals, Ahmedabad'
    });

    await Doctor.create({
      user: doctorUser2._id,
      specialization: 'Pediatrics',
      experience: 8,
      fees: 500, // Rupees
      about: 'Dr. Rajesh Patel specializes in child healthcare and childhood development, focused on preventive medicine, routine checks, and wellness programs.',
      location: 'Apollo Hospitals, Satellite Road, Ahmedabad',
      isApproved: false, // Pending Approval
      availability: [
        {
          date: '2026-06-16',
          slots: ['09:00 AM', '10:00 AM', '11:00 AM']
        }
      ]
    });
    console.log('Doctor user 2 seeded: rajesh@doctor.in / doctorpassword (Pending approval)');

    // 4. Seed Patient User
    const patientUser = await User.create({
      name: 'Aarav Mehta',
      email: 'aarav@patient.in',
      password: 'patientpassword',
      role: 'Patient',
      phoneNumber: '+91-9812345678',
      address: '456 Heights Road, Bandra West, Mumbai'
    });
    console.log('Patient user seeded: aarav@patient.in / patientpassword');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

module.exports = seedData;
