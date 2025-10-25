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
    // Call Wolfram Alpha Full Results API with step-by-step podstate, output as JSON
    const apiUrl = `https://api.wolframalpha.com/v2/query?appid=${WOLFRAM_APP_ID}&input=${encodeURIComponent(question)}&podstate=Step-by-step+solution&output=json`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Look for the step-by-step pod and also the main result
    let steps = null;
    let answer = null;
    if (data.queryresult && data.queryresult.pods) {
      // Find step-by-step pod
      const stepPod = data.queryresult.pods.find(pod =>
        pod.title && pod.title.toLowerCase().includes("step-by-step")
      );
      if (stepPod && stepPod.subpods && stepPod.subpods.length > 0) {
        steps = stepPod.subpods.map(sub => sub.plaintext).filter(Boolean).join('\n\n');
      }
      // Find the main result pod (usually id=Result or primary)
      const answerPod = data.queryresult.pods.find(pod =>
        pod.id === "Result" || pod.primary
      );
      if (answerPod && answerPod.subpods && answerPod.subpods.length > 0) {
        answer = answerPod.subpods.map(sub => sub.plaintext).filter(Boolean).join('\n');
      }
    }
    res.json({ steps, answer });
  } catch (e) {
    res.status(500).json({ error: 'Error contacting Wolfram Alpha.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
