// C:\Users\gertf\Desktop\FoodApp\backend\src\models\admin.ts
import mongoose, { Schema, Document } from "mongoose";

interface Admin extends Document {
  email: string;
  auth0Id: string;
  city: string;
  country: string;
  name: string;
  address: string;
  permissions: string[];
  role: string;
}

const AdminSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  auth0Id: { type: String, required: true },
  city: { type: String },
  country: { type: String },
  name: { type: String },
  address: { type: String },
  permissions: [{ type: String }],
  role: { type: String, required: true, default: "admin" },
});

export default mongoose.model<Admin>("Admin", AdminSchema);
