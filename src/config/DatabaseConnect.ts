import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string, );
    console.log(`MongoDB Connected: ${conn.connection.host} - Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${(error as Error).message}`);
    process.exit(1);
  }
};