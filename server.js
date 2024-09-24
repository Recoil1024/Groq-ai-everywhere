import dotenv from "dotenv-safe";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Groq from "groq-sdk";

const app = express().use(cors()).use(bodyParser.json());
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

class Conversation {
    constructor() {
        this.chatHistory = [{"role": "system", "content": "You are a helpful assistant and if asked for any coding qustion you just reply with perfect result with providing any comments or explanation in code until asked for and write code such that it passes palgiarism checking by any ai as much as you can."}];
    }

    async sendMessage(msg) {
        this.chatHistory.push({"role": "user", "content": msg});
        const response = await groq.chat.completions.create({
            model: "llama-3.1-70b-versatile",
            messages: this.chatHistory,
            max_tokens: 8000,
            temperature: 1.2
        });
        const assistantMessage = response.choices[0].message.content;
        this.chatHistory.push({"role": "assistant", "content": assistantMessage});
        return assistantMessage;
    }
}

const conversation = new Conversation();

app.post("/", async (req, res) => {
    try {
        const reply = await conversation.sendMessage(req.body.message);
        console.log(`----------\n${reply}\n----------`);
        res.json({ reply });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

async function start() {
    app.listen(3000, () => {
        console.log(`Server running on http://localhost:3000`);
    });
}

start();

