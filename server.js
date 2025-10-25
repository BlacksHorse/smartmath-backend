const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const WOLFRAM_APP_ID = 'J5KQYPGE3J';

app.post('/solve', async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'No question provided.' });
  }
  try {
    const apiUrl = `https://api.wolframalpha.com/v1/result?appid=${WOLFRAM_APP_ID}&i=${encodeURIComponent(question)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Wolfram Alpha error');
    const answer = await response.text();
    res.json({ result: answer });
  } catch (e) {
    res.status(500).json({ error: 'Error contacting Wolfram Alpha.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
