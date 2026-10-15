import { Router } from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Feedback from '../models/Feedback.js';

const router = Router();

router.get('/courses', async (_request, response, next) => {
  try {
    const courses = await Course.find().sort({ courseCode: 1 }).lean();
    response.json(courses);
  } catch (error) {
    next(error);
  }
});

router.get('/feedback', async (_request, response, next) => {
  try {
    const feedback = await Feedback.find()
      .populate('course', 'courseCode name duration')
      .sort({ createdAt: -1 })
      .lean();
    response.json(feedback);
  } catch (error) {
    next(error);
  }
});

router.post('/feedback', async (request, response, next) => {
  try {
    const { courseId, comments, rating } = request.body;
    if (!mongoose.isValidObjectId(courseId)) {
      return response.status(400).json({ message: 'Choose a valid course.' });
    }
    if (typeof comments !== 'string' || !comments.trim() || comments.trim().length > 2000) {
      return response.status(400).json({ message: 'Comments are required and must be under 2,000 characters.' });
    }
    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return response.status(400).json({ message: 'Rating must be a whole number from 1 to 5.' });
    }

    const courseExists = await Course.exists({ _id: courseId });
    if (!courseExists) return response.status(404).json({ message: 'Course not found.' });

    const feedback = await Feedback.create({ course: courseId, comments: comments.trim(), rating: Number(rating) });
    await feedback.populate('course', 'courseCode name duration');
    response.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
});

router.patch('/feedback/:id', async (request, response, next) => {
  try {
    const { id } = request.params;
    const { courseId, comments, rating } = request.body;
    if (!mongoose.isValidObjectId(id)) return response.status(400).json({ message: 'Invalid feedback ID.' });
    if (!mongoose.isValidObjectId(courseId)) return response.status(400).json({ message: 'Choose a valid course.' });
    if (typeof comments !== 'string' || !comments.trim() || comments.trim().length > 2000) {
      return response.status(400).json({ message: 'Comments are required and must be under 2,000 characters.' });
    }
    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return response.status(400).json({ message: 'Rating must be a whole number from 1 to 5.' });
    }

    const courseExists = await Course.exists({ _id: courseId });
    if (!courseExists) return response.status(404).json({ message: 'Course not found.' });

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { course: courseId, comments: comments.trim(), rating: Number(rating) },
      { new: true, runValidators: true }
    ).populate('course', 'courseCode name duration');
    if (!feedback) return response.status(404).json({ message: 'Feedback not found.' });
    response.json(feedback);
  } catch (error) {
    next(error);
  }
});

router.delete('/feedback/:id', async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ message: 'Invalid feedback ID.' });
    }
    const deleted = await Feedback.findByIdAndDelete(request.params.id);
    if (!deleted) return response.status(404).json({ message: 'Feedback not found.' });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;