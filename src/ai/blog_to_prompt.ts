import { config } from "dotenv";
config()

import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

async function blogToPromptGeneration({ blog_content }: {
    blog_content: string;
}) {
    console.log("Generating prompt...");
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Revised instruction for more image-friendly output
        const prompt = `Extract key visual elements from this blog and generate a descriptive prompt (under 10 words) suitable for creating an image: ${blog_content}`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error generating prompt:", error);
        throw error;
    }
}

export {
    blogToPromptGeneration,
};
