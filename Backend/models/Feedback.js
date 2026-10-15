import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  comments: { type: String, required: true, trim: true, maxlength: 2000 },
  rating: { type: Number, required: true, min: 1, max: 5 }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);