import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/mean-multi-level';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      // Update level if missing
      if (existingAdmin.level !== 0) {
        existingAdmin.level = 0;
        await existingAdmin.save();
        console.log('Admin level updated to 0');
      }
      console.log('Admin already exists');
      await mongoose.connection.close();
      return;
    }

    const admin = new User({
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      level: 0,
      balance: 1000000
    });

    await admin.save();

    console.log('Admin created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('Seeding error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();
