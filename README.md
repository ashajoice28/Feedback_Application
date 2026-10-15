# Course Feedback Admin

A MERN feedback dashboard with course-level summaries and editable feedback responses.

## Requirements

- Node.js 18.18 or newer
- A MongoDB Atlas connection string

## Configure MongoDB Atlas

Create a database user and allow your development IP in Atlas Network Access. Add the connection string to `Backend/.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/course_feedback?retryWrites=true&w=majority
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

Keep the real connection string private. The API seeds a small sample course catalog the first time it connects.

## Run locally

From the project root:

```bash
npm install
npm install --prefix Backend
npm install --prefix Frontend
npm run dev
```

Open http://localhost:5173. The API runs at http://localhost:5000 and exposes `GET /api/health` for a connection check.

Feedback records reference courses in the seeded course catalog. Ratings are integers from 1 to 5; the dashboard reports the average across submitted feedback.