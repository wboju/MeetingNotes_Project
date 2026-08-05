require('dotenv').config();
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

async function analyzeTranscript(transcript) {
  const fetch = (await import('node-fetch')).default;
  
  const response = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen3.7-plus',
      messages: [
        {
          role: 'user',
          content: `You are an assistant that analyzes meeting transcripts.

Given the following transcript, return a JSON object with exactly two fields:
- "summary": a 2-3 sentence summary of the meeting
- "action_items": an array of strings, each being a clear action item from the meeting

Return only valid JSON, no markdown, no extra text.

Transcript:
${transcript}`
        }
      ],
      enable_thinking: false,
    }),
  });

  const data = await response.json();
  console.log('Qwen raw response:', JSON.stringify(data, null, 2));
  const text = data.choices[0].message.content;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

app.get('/', (req, res) => {
  res.json({ message: 'Hello from your backend!' });
});

app.get('/meetings', (req, res) => {
  const meetings = db.prepare('SELECT * FROM meetings').all();
  const parsed = meetings.map((m) => ({
    id: m.id,
    title: m.title,
    date: m.date,
    startTime: m.start_time,
    endTime: m.end_time,
    location: m.location,
    attendees: JSON.parse(m.attendees),
    transcript: m.transcript || null,
    summary: m.summary || null,
    action_items: m.action_items ? JSON.parse(m.action_items) : [],
  }));
  res.json(parsed);
});

app.post('/meetings/:id/upload', upload.single('transcript'), async(req, res) => {
  const {id} = req.params;

  const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(id);
  if (!meeting) return res.status(404).json({error: 'Meeting not found'});

  const transcriptText = fs.readFileSync(req.file.path, 'utf-8');

  db.prepare('UPDATE meetings SET transcript = ? WHERE id = ?').run(transcriptText, id);


  try {
    const {summary, action_items} = await analyzeTranscript(transcriptText);

    db.prepare('UPDATE meetings SET summary = ?, action_items = ? WHERE id = ?').run(summary, JSON.stringify(action_items), id);
    res.json({message: 'Transcript uploaded and analysed successfully', transcript: transcriptText, summary, action_items});
  } catch (err) {
    console.error('Qwen error message:', err.message);
    console.error('Qwen error full:', JSON.stringify(err, null, 2));
    res.json({
      message: 'Transcript uploaded but analysis failed',
      transcript: transcriptText,
      summary: null,
      action_items: [],
    });
  }
});



app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

// QwenCloud integration: