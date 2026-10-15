import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  duration: { type: String, required: true, trim: true }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);