import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDownRight, ArrowUpRight, BookOpen, CalendarDays, Check, ChevronDown,
  ClipboardList, Clock3, LayoutDashboard, MessageSquareText, Pencil, Plus,
  Search, Send, Star, Trash2, TriangleAlert, X
} from 'lucide-react';
import { api } from './api.js';

function Navbar() {
  return (
    <header className="topbar">
      <Link to="/" className="brand" aria-label="CoursePulse home">
        <span className="brand-mark"><MessageSquareText size={19} strokeWidth={2.5} /></span>
        <span>course<span className="brand-accent">pulse</span></span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <LayoutDashboard size={17} /> Dashboard
        </NavLink>
        <NavLink to="/add-feedback" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <Plus size={18} /> Add Feedback
        </NavLink>
      </nav>
      <div className="admin-profile" aria-label="Administrator">
        <span className="profile-avatar">A</span>
        <span className="profile-name">Admin</span>
        <ChevronDown size={15} />
      </div>
    </header>
  );
}

function Rating({ value, large = false }) {
  return (
    <span className={`rating${large ? ' rating-large' : ''}`} aria-label={`${Number(value).toFixed(1)} out of 5 stars`}>
      <Star size={large ? 18 : 15} fill="currentColor" strokeWidth={1.5} />
      <strong>{Number(value).toFixed(1)}</strong>
      <span className="rating-max">/ 5</span>
    </span>
  );
}

function StatCard({ label, value, detail, icon: Icon, trend, accent }) {
  return (
    <article className={`stat-card ${accent}`}>
      <div className="stat-topline"><span>{label}</span><span className="stat-icon"><Icon size={18} /></span></div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{trend && <ArrowUpRight size={14} />}{detail}</div>
    </article>
  );
}

function FeedbackDashboard() {
  const [feedback, setFeedback] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const [feedbackRows, courseRows] = await Promise.all([api.getFeedback(), api.getCourses()]);
      setFeedback(feedbackRows);
      setCourses(courseRows);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  async function deleteFeedback(id) {
    if (!window.confirm('Delete this feedback response? This cannot be undone.')) return;
    try {
      await api.deleteFeedback(id);
      setFeedback((rows) => rows.filter((row) => row._id !== id));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  const average = feedback.length
    ? feedback.reduce((total, item) => total + item.rating, 0) / feedback.length
    : 0;
  const filteredFeedback = feedback.filter((item) => {
    const haystack = `${item.course?.courseCode} ${item.course?.name} ${item.comments}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <main className="page-shell">
      <section className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> FEEDBACK MANAGEMENT</div>
          <h1>Feedback overview</h1>
          <p className="page-subtitle">A clear read on how learners feel about your courses.</p>
        </div>
        <Link to="/add-feedback" className="primary-button"><Plus size={17} /> Add feedback</Link>
      </section>

      {error && <div className="alert error-alert" role="alert"><TriangleAlert size={18} />{error}<button onClick={loadDashboard} className="alert-action">Retry</button></div>}

      <section className="stats-grid" aria-label="Feedback statistics">
        <StatCard label="Feedback responses" value={feedback.length.toLocaleString()} detail="All submitted responses" icon={MessageSquareText} accent="stat-mint" />
        <StatCard label="Courses covered" value={courses.length.toLocaleString()} detail="In the course catalog" icon={BookOpen} accent="stat-lilac" />
        <StatCard label="Average rating" value={feedback.length ? average.toFixed(1) : '—'} detail={feedback.length ? 'Across all responses' : 'Waiting for first feedback'} icon={Star} trend={feedback.length > 0} accent="stat-peach" />
      </section>

      <section className="feedback-section">
        <div className="section-heading">
          <div>
            <h2>Course feedback</h2>
            <p>Review and manage learner responses</p>
          </div>
          <label className="search-box">
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses or comments" aria-label="Search courses or comments" />
            {search && <button aria-label="Clear search" onClick={() => setSearch('')}><X size={15} /></button>}
          </label>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>COURSE</th><th>DURATION</th><th>OVERALL RATING</th><th>FEEDBACK COMMENTS</th><th>SUBMITTED</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="table-state"><span className="spinner" /> Loading feedback…</td></tr>
              ) : filteredFeedback.length === 0 ? (
                <tr><td colSpan="6" className="table-state empty-state"><span className="empty-icon"><ClipboardList size={23} /></span><strong>{feedback.length ? 'No matching feedback' : 'No feedback yet'}</strong><span>{feedback.length ? 'Try a different search.' : 'New responses will appear here.'}</span></td></tr>
              ) : filteredFeedback.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="course-cell"><span className="course-monogram">{item.course?.name?.slice(0, 1) || '?'}</span><span><strong>{item.course?.name || 'Course unavailable'}</strong><small>{item.course?.courseCode || 'No course ID'}</small></span></div>
                  </td>
                  <td><span className="duration"><Clock3 size={14} />{item.course?.duration || '—'}</span></td>
                  <td><Rating value={item.rating} /></td>
                  <td><span className="comment-preview" title={item.comments}>{item.comments}</span></td>
                  <td><span className="date-cell"><CalendarDays size={14} />{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></td>
                  <td><div className="row-actions">
                    <Link to={`/add-feedback?edit=${item._id}`} className="icon-button" aria-label={`Edit feedback for ${item.course?.name}`} title="Edit feedback"><Pencil size={16} /></Link>
                    <button className="icon-button delete-action" onClick={() => deleteFeedback(item._id)} aria-label={`Delete feedback for ${item.course?.name}`} title="Delete feedback"><Trash2 size={16} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>Showing <strong>{filteredFeedback.length}</strong> of <strong>{feedback.length}</strong> responses</span><span className="live-status"><span /> Connected to course feedback</span></div>
      </section>
      <footer className="page-footer"><span>COURSEPULSE <span>·</span> ADMIN</span><span>Thoughtful courses start with listening.</span></footer>
    </main>
  );
}

function FeedbackForm() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [comments, setComments] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadForm() {
      try {
        const courseRows = await api.getCourses();
        setCourses(courseRows);
        if (editId) {
          const feedbackRows = await api.getFeedback();
          const entry = feedbackRows.find((item) => item._id === editId);
          if (!entry) throw new Error('This feedback could not be found. It may have been deleted.');
          setCourseId(entry.course?._id || '');
          setComments(entry.comments);
          setRating(entry.rating);
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [editId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!courseId) return setError('Select a course to continue.');
    if (!rating) return setError('Choose an overall rating from 1 to 5 stars.');
    setSaving(true);
    try {
      const data = { courseId, comments, rating };
      if (editId) await api.updateFeedback(editId, data);
      else await api.createFeedback(data);
      navigate('/', { state: { saved: true } });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  const selectedRating = hoveredRating || rating;

  return (
    <main className="page-shell form-page">
      <div className="form-backline"><Link to="/" className="back-link"><ArrowDownRight size={15} /> Back to dashboard</Link><span>FEEDBACK MANAGEMENT</span></div>
      <section className="form-layout">
        <div className="form-intro">
          <span className="form-illustration"><MessageSquareText size={27} /></span>
          <div className="eyebrow"><span className="eyebrow-dot" /> LISTEN & IMPROVE</div>
          <h1>{editId ? 'Edit feedback' : 'Add feedback'}</h1>
          <p>Capture a learner’s perspective and help make every course a little better.</p>
          <div className="form-aside-note"><span className="note-line" /><span>Every response helps shape what comes next.</span></div>
        </div>
        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="form-card-heading"><div><h2>{editId ? 'Update response' : 'New response'}</h2><p>Fields marked <span>*</span> are required</p></div><span className="step-count">01 <span>/ 01</span></span></div>
          {error && <div className="alert error-alert form-alert" role="alert"><TriangleAlert size={17} />{error}</div>}
          {loading ? <div className="form-loading"><span className="spinner" /> Loading form…</div> : (
            <>
              <label className="field-label" htmlFor="course">Course name <span>*</span></label>
              <div className="select-wrap"><BookOpen size={17} /><select id="course" value={courseId} onChange={(event) => setCourseId(event.target.value)} required><option value="">Select a course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.name}</option>)}</select><ChevronDown size={16} /></div>
              <label className="field-label comments-label" htmlFor="comments">Feedback comments <span>*</span></label>
              <div className="textarea-wrap"><textarea id="comments" value={comments} onChange={(event) => setComments(event.target.value)} placeholder="What stood out? What could be better?" maxLength={2000} required rows={5} /><span>{comments.length} / 2,000</span></div>
              <fieldset className="rating-fieldset">
                <legend>Feedback rating <span>*</span></legend>
                <div className="star-picker" onMouseLeave={() => setHoveredRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" className={`star-button${star <= selectedRating ? ' selected' : ''}`} onClick={() => setRating(star)} onMouseEnter={() => setHoveredRating(star)} aria-label={`Rate ${star} out of 5`} aria-pressed={rating === star}><Star size={28} fill={star <= selectedRating ? 'currentColor' : 'none'} /></button>)}
                  <span className="rating-caption">{rating ? `${rating} out of 5` : 'Select a rating'}</span>
                </div>
              </fieldset>
              <div className="form-actions"><Link to="/" className="secondary-button">Cancel</Link><button className="primary-button" type="submit" disabled={saving || loading || courses.length === 0}>{saving ? 'Saving…' : editId ? <><Check size={17} /> Save changes</> : <><Send size={16} /> Submit feedback</>}</button></div>
            </>
          )}
        </form>
      </section>
      <footer className="page-footer"><span>COURSEPULSE <span>·</span> ADMIN</span><span>Thoughtful courses start with listening.</span></footer>
    </main>
  );
}

export default function App() {
  return <><Navbar /><Routes><Route path="/" element={<FeedbackDashboard />} /><Route path="/add-feedback" element={<FeedbackForm />} /><Route path="*" element={<FeedbackDashboard />} /></Routes></>;
}