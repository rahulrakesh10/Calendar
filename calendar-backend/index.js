const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const app = express();

// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app'] // Replace with your actual Vercel domain
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Daily usage tracking
const dailyUsage = new Map();
const MAX_DAILY_REQUESTS = 3; // Limit to 3 requests per day

// Reset daily usage at midnight
const resetDailyUsage = () => {
    dailyUsage.clear();
    console.log('Daily usage reset');
};

// Schedule daily reset at midnight
const scheduleDailyReset = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    
    setTimeout(() => {
        resetDailyUsage();
        scheduleDailyReset(); // Schedule next reset
    }, timeUntilMidnight);
};

scheduleDailyReset();

// Configure multer for file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Gemini
console.log('GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

app.get('/', (req, res) => {
  res.send('Calendar AI Backend is running!');
});

app.get('/api/usage', (req, res) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const today = new Date().toDateString();
    const userKey = `${clientIP}-${today}`;
    const currentUsage = dailyUsage.get(userKey) || 0;
    
    res.json({
        used: currentUsage,
        limit: MAX_DAILY_REQUESTS,
        remaining: Math.max(0, MAX_DAILY_REQUESTS - currentUsage),
        resetTime: 'midnight'
    });
});

app.post('/api/extract-events', upload.single('file'), async (req, res) => {
    // Get client IP for usage tracking
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const today = new Date().toDateString();
    const userKey = `${clientIP}-${today}`;
    
    // Check daily usage limit
    const currentUsage = dailyUsage.get(userKey) || 0;
    if (currentUsage >= MAX_DAILY_REQUESTS) {
        return res.status(429).json({ 
            error: `Daily limit exceeded. You can only make ${MAX_DAILY_REQUESTS} requests per day.`,
            limit: MAX_DAILY_REQUESTS,
            used: currentUsage,
            resetTime: 'midnight'
        });
    }
    
    // Increment usage counter
    dailyUsage.set(userKey, currentUsage + 1);
    console.log(`User ${clientIP} made request ${currentUsage + 1}/${MAX_DAILY_REQUESTS} today`);
    
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

        let responseText;
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            responseText = await response.text();
            console.log("Gemini response:", responseText);
        } catch (apiError) {
            if (apiError.message.includes('429') || apiError.message.includes('RATE_LIMIT_EXCEEDED')) {
                return res.status(429).json({ 
                    error: 'API rate limit exceeded. Please wait a moment and try again.',
                    retryAfter: 60
                });
            }
            throw apiError;
        }

        const jsonString = responseText.replace(/```json|```/g, '').trim();

        if (!jsonString) {
            return res.status(500).json({ error: "Gemini returned an empty response." });
        }

        try {
            const parsed = JSON.parse(jsonString);
            res.json(parsed);
        } catch (e) {
            console.error("Failed to parse JSON from Gemini:", jsonString);
            res.status(500).json({ error: "Failed to parse AI response." });
        }

    } catch (error) {
        console.error('Error processing request:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to extract events.', details: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});