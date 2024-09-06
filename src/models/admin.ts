import mongoose, { Schema, Document } from 'mongoose';

interface Admin extends Document {
  email: string;
  role: string; // Ensure role is added here
}

const AdminSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true, default: 'admin' }, // Ensure role is added here
});

export default mongoose.model<Admin>('Admin', AdminSchema);
