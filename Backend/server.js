import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import Course from './models/Course.js';
import { courseCatalog } from './config/courseCatalog.js';
import feedbackRoutes from './routes/Feedbackroutes.js';

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.use('/api', feedbackRoutes);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: 'Something went wrong while processing the request.' });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Add your MongoDB Atlas connection string to Backend/.env.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all(courseCatalog.map((course) => Course.updateOne(
    { courseCode: course.courseCode },
    { $set: course },
    { upsert: true }
  )));

  app.listen(port, () => console.log(`Feedback API listening on http://localhost:${port}`));
}

start().catch((error) => {
  console.error(`Unable to start the API: ${error.message}`);
  process.exitCode = 1;
});