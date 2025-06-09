import mongoose, { Schema, Document } from 'mongoose';

   export interface IUser extends Document {
     idNumber?: string;
     name: string;
     email: string;
     password: string;
     role: 'Student' | 'Teacher' | 'Admin';
     createdAt: Date;
   }

   const userSchema = new Schema<IUser>({
     idNumber: {
       type: String,
       required: [function() { return this.role === 'Student'; }, 'ID number is required for students'],
       sparse: true,
       match: [/^\d{8}$/, 'ID number must be an 8-digit number'],
     },
     name: { type: String, required: true, trim: true },
     email: {
       type: String,
       required: true,
       unique: true,
       lowercase: true,
       trim: true,
     },
     password: { type: String, required: true, minlength: 6 },
     role: {
       type: String,
       enum: ['Student', 'Teacher', 'Admin'],
       required: true,
       default: 'Student',
     },
     createdAt: { type: Date, default: Date.now },
   });

   export default mongoose.model<IUser>('User', userSchema);