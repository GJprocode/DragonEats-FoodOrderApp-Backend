import mongoose, { Document, Schema } from 'mongoose';

interface IAdminPanelAction extends Document {
  restaurantId: string;
  actionType: string;
  status: string;
  contractType?: string;
  contractId?: string;
  adminEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminPanelActionSchema: Schema = new Schema({
  restaurantId: { type: String, required: true },
  actionType: { type: String, required: true },
  status: { type: String, required: true },
  contractType: { type: String },
  contractId: { type: String },
  adminEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AdminPanelAction = mongoose.model<IAdminPanelAction>('AdminPanelAction', AdminPanelActionSchema);

export default AdminPanelAction;
