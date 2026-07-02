import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const SYSTEM_PROMPT = "You are Ronin, ConnectHub's social assistant. Keep replies short (2-4 sentences), friendly, and practical.";

async function askGroq(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function askGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nUser: ${prompt}`);
  return result.response.text();
}

router.post("/ronin", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: "prompt is required" });

  try {
    const reply = await askGroq(prompt);
    return res.json({ reply, provider: "groq" });
  } catch (groqErr) {
    console.warn("Groq failed, falling back to Gemini:", groqErr.message);
  }

  try {
    const reply = await askGemini(prompt);
    return res.json({ reply, provider: "gemini" });
  } catch (geminiErr) {
    console.error("Gemini also failed:", geminiErr.message);
    return res.status(500).json({ message: "Ronin is unavailable right now — both providers failed." });
  }
});

export default router;