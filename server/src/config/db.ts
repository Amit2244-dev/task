import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not found in .env');
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log(' MongoDB Connected');
  } catch (error) {
    console.error(' Database Connection Failed:', error);
    process.exit(1);
  }
};
