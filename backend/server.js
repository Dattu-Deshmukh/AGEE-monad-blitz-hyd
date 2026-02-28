import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI conditionally
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here") {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.post('/api/evaluate', async (req, res) => {
    try {
        const { rule } = req.body;

        if (!rule) {
            return res.status(400).json({ error: "Rule is required" });
        }

        let result;

        if (openai) {
            const prompt = `You are the decision engine for the Anti-Gravity Execution Engine (AGEE) on the Monad blockchain.
      The user has a conditional rule: "${rule}".
      Evaluate this rule logically. If it is an obviously met condition or general assertion, output EXECUTE. If it contains words like 'wait', 'stop', 'pause', output WAIT.
      You MUST output a JSON object with exactly this structure:
      {
        "action": "EXECUTE" or "WAIT",
        "confidence_score": <number between 0 and 1>,
        "reasoning": "<brief explanation of why>"
      }
      Only output valid JSON.`;

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini", // or gpt-3.5-turbo
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            });

            result = JSON.parse(response.choices[0].message.content);
        } else {
            // Mocked AI inference for hackathon ease-of-use without keys
            console.log("Using Mock AI (No API Key provided)");
            await sleep(1500); // Simulate network latency

            const isWait = rule.toLowerCase().includes("wait") || rule.toLowerCase().includes("stop");
            result = {
                action: isWait ? "WAIT" : "EXECUTE",
                confidence_score: isWait ? 0.88 : 0.98,
                reasoning: "Condition dynamically evaluated based on local mock engine logic."
            };
        }

        res.json(result);
    } catch (error) {
        console.error("AI Evaluation Error:", error);
        res.status(500).json({ error: "Failed to evaluate rule" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`AGEE AI Engine running on http://localhost:${PORT}`);
    if (!openai) {
        console.warn("⚠️ Running in Mock Mode. Please add OPENAI_API_KEY in .env");
    }
});
