require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

const { searchProducts, getAllProducts, getOneProduct, checkStock} = require("./tools/productTools");
const { addToCart, getCart, removeFromCart } = require("./tools/cartTools");
const { calculateBill } = require("./tools/billingTools");

const availableTools = {
  searchProducts: (args) => searchProducts(args),

  getAllProducts: () => getAllProducts(),

  getOneProduct: (args) => getOneProduct(args.productName),

  checkStock: (args) => checkStock(args.productName),

  addToCart: (args) => addToCart(args.productId, args.quantity),

  getCart: () => getCart(),

  removeFromCart: (args) => removeFromCart(args.productId),

  calculateBill: () => calculateBill(),

}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const rl = readline.createInterface({ input, output });

// Describe the tool to Gemini.

//productTools
const searchProductsTool = {
  name: "searchProducts",

  description:
    "Search the ShopMate product catalogue by optional category and maximum price.",

  parameters: {
    type: "object",

    properties: {
      category: {
        type: "string",
        description: "Product category, such as Keyboard or Mouse",
      },

      maxPrice: {
        type: "number",
        description: "Maximum product price in rupees",
      },
    },

    required: [],
  },
};

const getAllProductsTool = {
  name: "getAllProducts",

  description:
    "Retrieve all products available in the ShopMate product catalogue.",
    
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
};

const getOneProductTool = {
  name: "getOneProduct",

  description:
    "Retrieve detailed information about a specific product using its name.",

  parameters: {
    type: "object",

    properties: {
      productName: {
        type: "string",
        description: "The name of the product to retrieve.",
      },
    },
    required: ["productName"],
  },
};

const checkStockTool = {
  name: "checkStock",

  description:
    "Check the available stock quantity of a specific product using its name.",

  parameters: {
    type: "object",

    properties: {
      productName: {
        type: "string",
        description: "The name of the product to check stock for.",
      },
    },
    required: ["productName"],
  },
};


//cartTools
const addToCartTool = {
  name: "addToCart",

  description: "Add a specified quantity of a product to the shopping cart using its product ID.",

  parameters: {
    type: "object",

    properties: {
      productId: {
        type: "string",
        description: "The ID of the product to add, such as TECH002",

      },
      quantity: {
        type: "number",
        description: "The number of units to add to the cart",

      },
    },
    required: ["productId", "quantity"],
  },
};

const getCartTool = {
  name: "getCart",

  description:
    "Retrieve the current contents of the user's shopping cart, including product details and quantities.",

  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
};

const removeFromCartTool = {
  name: "removeFromCart",

  description:
    "Remove a product from the user's shopping cart using its product ID.",

  parameters: {
    type: "object",
    properties: {

      productId: {
        type: "string",
        description: "The product ID to remove, such as TECH002",
      },

    },
    required: ["productId"],
  },
};

//billingTools
const calculateBillTool = {
  name: "calculateBill",
  description:
    "Calculate the current shopping cart bill, including item subtotals, GST, and grand total.",
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
};

async function main() {
  const history = [];

  while (true) {
    const userMessage = await rl.question("You: ");

    if (userMessage.toLowerCase() === "exit") {
      break;
    }

    history.push({
      role: "user",
      parts: [{ text: userMessage }],
    });
    
    let response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: history,
      config: {
        tools: [
          {
            functionDeclarations: [searchProductsTool, getAllProductsTool, getOneProductTool, checkStockTool, addToCartTool, getCartTool, removeFromCartTool, calculateBillTool]
          }
       ]
      }
    });

    console.log("Function calls in this response:", response.functionCalls?.length ?? 0);//

    let totalToolCalls = 0;
    const MAX_TOOL_CALLS = 7;
    let limitReached = false;

    while(response.functionCalls?.length > 0){

      history.push(response.candidates[0].content);

      // let functionCall = response.functionCalls[0];

      for(const functionCall of response.functionCalls){
        // console.log("Tool arguments:", functionCall.args);

        // console.log("ShopMate is using a tool:", functionCall.name);

        // const toolFunction = availableTools[functionCall.name];

        let result;

        if(totalToolCalls >= MAX_TOOL_CALLS){
          limitReached = true;
          
          result = {
            error: "Tool call limit reached for this request."
          };


        } else {
          totalToolCalls++;

          console.log("ShopMate is using a tool:", functionCall.name);

          const toolFunction = availableTools[functionCall.name];

          if (!toolFunction) {
            result = {
              error: `Unknown tool requested: ${functionCall.name}`
            }
          } else{
            try{
              result = toolFunction(functionCall.args);
            }
            catch(error){
              console.error("Tool execution failed:", error.message);
              result = {
                error: "The tool could not complete the request."
              };
            }          
          }
        }

        if (!limitReached && (functionCall.name === "addToCart" || functionCall.name === "removeFromCart" || functionCall.name === "getCart")) {
          console.log("Current cart:", getCart());
        }

        history.push({
          role:"user",
          parts:[{
            functionResponse: {
              name:functionCall.name,
              id:functionCall.id,
              response:{
                result
              }
            }
          }]
        });

      }

      if(limitReached){
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: [...history, 
            {
              role: "user",
              parts: [{text: "The tool-call limit for this request has been reached. Do not call or request any more tools. Using only the information already available in the conversation, explain what you successfully completed, what remains incomplete, and why. Do not invent results or claim that an unexecuted operation was completed."

              }]
            }
          ],
          config: {
            toolConfig: {
              functionCallingConfig: {
                mode: "NONE"
              }
            }
          }
        });
        break;
      }
      

      response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: history,
        config: {
          tools: [
            {
              functionDeclarations: [searchProductsTool, getAllProductsTool, getOneProductTool, checkStockTool, addToCartTool, getCartTool, removeFromCartTool, calculateBillTool]
            }
          ]
        }
      });

      // console.log("Tool result:", result);
    }


    const answer = response.text;

    console.log("ShopMate:", answer);

    history.push({
      role:"model",
      parts:[{
        text: answer
      }]
    });

    console.log("\nHistory length:", history.length);
  }

  rl.close();
}

main().catch((error) => {
  console.error("ShopMate error:", error.message);
  rl.close();
});
