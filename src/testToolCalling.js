require("dotenv").config();

const {GoogleGenAI} = require("@google/genai");

const { searchProducts } = require("./tools/productTools");

const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
});

// Describe the tool to Gemini.
const searchProductsTools = {
    name: "searchProducts",

    description: "Search the ShopMate product catalogue by optional category and maximum price.",

    parameters:{
        type: "object",

        properties:{
            category:{
                type: "string",
                description: "Product category, such as Keyboard or Mouse"
            },

            maxPrice:{
                type: "number",
                description: "Maximum product price in rupees"
            }
        },
        
        required: []
    }
};

async function main(){

    const userMessage = "Find keyboards priced at ₹2500 or less. Use the searchProducts tool.";

    const contents = [
        {
            role: "user",
            parts: [{ text: userMessage }]
        }
    ];
    // console.log("\n========== STAGE 1: INITIAL HISTORY ==========");
    // console.dir(contents, { depth: null });

    const config = {
        tools: [{ functionDeclarations: [searchProductsTools] }]
    }

    // 1. Ask Gemini what to do.
    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config
    });

    const functionCall = response.functionCalls?.[0]; //response.functionCalls is a shortcut provided by the Google GenAI SDK. You don't need to manually navigate through candidates, content, and parts to retrieve function calls.
    // console.log("\n========== STAGE 2: GEMINI RESPONSE ==========");
    // console.dir(response.candidates[0].content, { depth: null });

    // 2. Handle the requested tool.
    if(!functionCall){
        console.log("Gemini's answer:", response.text);
        return;
    }

    if (functionCall.name !== "searchProducts") {
        throw new Error(`Unsupported tool: ${functionCall.name}`);
    }

    // 3. Execute your real JavaScript function.
    const result = searchProducts(functionCall.args);

    console.log("Tool result:", result);

    // 4. Add Gemini's tool-call message to the conversation history.
    contents.push(response.candidates[0].content);

    // console.log("\n========== STAGE 3: HISTORY AFTER GEMINI REQUEST ==========");
    // console.dir(contents, { depth: null });

     // 5. Send the tool result back to Gemini.
    contents.push({
        role: "user",
        parts: [
            {
                functionResponse: {
                    name: functionCall.name,
                    id: functionCall.id,
                    response: { result }
                }
            }
        ]
    });
    // console.log("\n========== STAGE 4: HISTORY AFTER TOOL RESULT ==========");
    // console.dir(contents, { depth: null });

    // 6. Ask Gemini to generate the final answer.
    const finalResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config
    });

    console.log("\nShopMate:", finalResponse.text);
}

main().catch(error => {
  console.error("Gemini request failed:", error.message);
});