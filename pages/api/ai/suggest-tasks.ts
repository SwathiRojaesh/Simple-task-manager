import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { keyword } = req.body;
  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  // ✅ NEW, SMARTER PROMPT: This tells the AI how to handle different kinds of requests.
  const prompt = `
    You are a helpful assistant. A user has entered the keyword: "${keyword}".
    Your goal is to generate a list of 5 helpful, relevant, and actionable items based on this keyword.
    - If the keyword is a large project or goal (like "learn javascript"), break it down into smaller, concrete tasks.
    - If the keyword is a creative request (like "healthy snack ideas" or "food chart for the week"), generate a list of creative suggestions or examples that would be the *result* of the request.
    - The items in the list should be short and suitable for a to-do list.
    
    Return ONLY a valid JSON array of strings. Do not include any other text or markdown.
    Example for "learn javascript": ["Read about variables and data types", "Complete a tutorial on functions", "Build a simple calculator app"]
    Example for "food chart for the week": ["Monday: Oatmeal for breakfast, Salad for lunch, Chicken and veggies for dinner", "Tuesday: Yogurt with fruit for breakfast, Sandwich for lunch, Pasta for dinner", "Wednesday: Eggs for breakfast, Leftover pasta for lunch, Fish and rice for dinner"]
  `;

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      throw new Error(errorData.error?.message || "Invalid response from AI service");
    }

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text;
    if (!content) {
      throw new Error("AI returned an empty response.");
    }

    const tasks: string[] = JSON.parse(content);

    if (tasks.length === 0) {
      throw new Error("AI did not return any usable tasks.");
    }

    res.status(200).json(tasks.slice(0, 5));
  } catch (error) {
    console.error("AI suggestion API error:", error);
    res.status(500).json({ error: (error as Error).message || "Failed to get AI suggestions" });
  }
}