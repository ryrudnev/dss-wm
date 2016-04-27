import mongoose from 'mongoose';
import { genIdForSchema } from '../../services/counter';

const { Schema } = mongoose;

const PermissionSchema = new Schema({
  _id: Number,
  name: String,
});

PermissionSchema.pre('save', genIdForSchema('Permission'));

export default mongoose.model('Permission', PermissionSchema);
