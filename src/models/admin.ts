import mongoose, { Schema, Document } from "mongoose";
// add role: admins, also frontend types.ts for collections admins to be in sync with admin.ts model 
interface AdminAction extends Document {
  restaurantId: mongoose.Types.ObjectId;
  adminEmail: string;
  status: string;
  contractType: string;
  contractId: string;
  updatedAt: Date;
}

const AdminActionSchema: Schema = new Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  adminEmail: { type: String, required: true },
  status: { type: String, required: true },
  contractType: { type: String },
  contractId: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<AdminAction>("AdminAction", AdminActionSchema);
