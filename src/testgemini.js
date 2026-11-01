require("dotenv").config();

const {GoogleGenAI} = require("@google/genai");

async function main(){
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "You are ShopMate, a helpful shopping assistant. Introduce yourself in one sentence."
    });

    console.log(response.text);
}

main().catch(error => {
  console.error("Gemini request failed:", error.message);
});