const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/', (req, res) => {
  res.send('Calendar AI Backend is running!');
});

app.post('/api/extract-events', upload.single('file'), async (req, res) => {
    let textToProcess = req.body.text;

    try {
        // If a file is uploaded, parse it and use its text content
        if (req.file) {
            if (req.file.mimetype === 'application/pdf') {
                const data = await pdfParse(req.file.buffer);
                textToProcess = data.text;
            } else {
                // For plain text files
                textToProcess = req.file.buffer.toString('utf8');
            }
        }

        if (!textToProcess) {
            return res.status(400).json({ error: 'No text or supported file provided.' });
        }

        const prompt = `
            Extract calendar events from the following text. Today is ${new Date().toISOString()}.
            Return a JSON object with a single key "events", which is an array of event objects.
            Each event object must have the following properties:
            - "title": (string) The short, primary name of the event.
            - "courseName": (string) The name or code of the course associated with the event (e.g., "COMP 101", "History of Art"). If no course is mentioned, return "General" for this field.
            - "date": (string) The exact date in YYYY-MM-DD format. Resolve relative dates like "tomorrow" or "next Friday".
            - "time": (string, optional) The specific time of the event in "HH:MM AM/PM" format. If no time is mentioned, return null for this field.
            - "desc": (string, optional) Any additional details or context about the event. If no description is found, return null.

            Always try to extract the course name or code for each event. If you cannot find a course name, use "General" as the courseName.

            If the text does not contain any discernible events, return an empty "events" array.
            Do not invent details. If a piece of information (like time or description) is not present for an event, its value should be null.

            Example:
            Text: "For Intro to Psychology (PSYC 101), the midterm is next Tuesday at 4pm. It covers chapters 1-5."
            Expected JSON:
            {
              "events": [
                {
                  "title": "Midterm",
                  "courseName": "Intro to Psychology (PSYC 101)",
                  "date": "2024-07-30",
                  "time": "04:00 PM",
                  "desc": "Covers chapters 1-5."
                }
              ]
            }

            Text to process: "${textToProcess}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = await response.text();
        
        // Clean the response to get valid JSON
        const jsonString = responseText.replace(/```json|```/g, '').trim();

        // Let's add more robust error handling for JSON parsing
        try {
            const parsed = JSON.parse(jsonString);
            res.json(parsed);
        } catch (e) {
            console.error("Failed to parse JSON from Gemini:", jsonString);
            res.status(500).json({ error: "Failed to parse AI response." });
        }

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Failed to extract events.' });
    }
});

// Get all events (user-specific, protected)
app.get('/api/events', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, date, time FROM events WHERE user_id = $1 ORDER BY date, time',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Add a new event (user-specific, protected)
app.post('/api/events', authMiddleware, async (req, res) => {
  const { title, description, date, time } = req.body;
  if (!title || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO events (user_id, title, description, date, time) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, description, date, time',
      [req.user.userId, title, description || '', date, time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add event' });
  }
});

// Update an event (user-specific, protected)
app.put('/api/events/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, description, date, time } = req.body;
  if (!title || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await pool.query(
      'UPDATE events SET title = $1, description = $2, date = $3, time = $4 WHERE id = $5 AND user_id = $6 RETURNING id, title, description, date, time',
      [title, description || '', date, time, id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete an event (user-specific, protected)
app.delete('/api/events/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

app.post('/api/register', async (req, res) => {
  console.log("Register endpoint hit", req.body);
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      [username, hash]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === '23505') { // unique_violation
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your_jwt_secret');
  res.json({ token });
});

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, 'your_jwt_secret');
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ secret: 'This is protected!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});