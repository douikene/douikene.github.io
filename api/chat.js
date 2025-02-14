const express = require('express');
const { Configuration, OpenAIApi } = require('openai');

const router = express.Router();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.post('/chat', async (req, res) => {
    try {
        const { message, cvData } = req.body;

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an AI assistant helping answer questions about Djamal Eddine Ouikene's CV. 
                    Here is the CV data: ${JSON.stringify(cvData)}. 
                    Please provide concise, accurate answers based only on the information in the CV.`
                },
                {
                    role: "user",
                    content: message
                }
            ],
        });

        res.json({ response: completion.data.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

module.exports = router; 