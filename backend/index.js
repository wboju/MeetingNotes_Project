const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');
const app = express();

app.use(cors());
app.use(express.json());


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer ({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.txt', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if(allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only .txt and .pdf files are allowed!'));
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello from your backend!' });
});

app.get('/meetings', (req, res) => {
  const meetings = db.prepare('SELECT * FROM meetings').all();
  const parsed = meetings.map((m) => ({
    ...m,
    attendees: JSON.parse(m.attendees),
    action_items: m.action_items ? JSON.parse(m.action_items) : [],
  }));
  res.json(parsed);
});

app.post('/meetings/:id/upload', upload.single('transcript'), (req, res) => {
  const {id} = req.params;

  const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(id);
  if (!meeting) return res.status(404).json({error: 'Meeting not found'});

  const transcriptText = fs.readFileSync(req.file.path, 'utf-8');

  db.prepare('UPDATE meetings SET transcript = ? WHERE id = ?').run(transcriptText, id);

  res.json({message: 'Transcript uploaded successfully', transcript: transcriptText});
});


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

// QwenCloud integration: