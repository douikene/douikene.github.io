require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

// Validate environment variables
const requiredEnvVars = ['OPENAI_API_KEY', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://douikene.github.io'
        : 'http://localhost:4000',
    methods: ['POST'],
    allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' })); // Limit request size

// OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Add CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Serve static files with proper headers
app.use(express.static('public', {
    setHeaders: (res, path) => {
        res.set('Connection', 'keep-alive');
        res.set('Keep-Alive', 'timeout=5');
        if (path.endsWith('.json')) {
            res.set('Content-Type', 'application/json');
        }
    }
}));

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, cvData } = req.body;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an AI assistant helping answer questions about Djamal Eddine Ouikene's CV. 
                    Here is the CV data: ${JSON.stringify(cvData)}. 
                    Please provide concise, accurate answers based only on the information in the CV.
                    If asked about something not in the CV, politely indicate that information is not available.`
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 200
        });

        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

app.timeout = 10000; // 10 seconds

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 