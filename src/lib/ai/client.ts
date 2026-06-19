import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required — see .env.example");
}

export const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const FLASH_MODEL = "gemini-2.0-flash";
