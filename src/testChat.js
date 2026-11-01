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
const searchProductsTools = {
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

const getAllProductsTools = {
  name: "getAllProducts",

  description:
    "Retrieve all products available in the ShopMate product catalogue.",
    
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
};

const getOneProductTools = {
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

const checkStockTools = {
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
const addToCartTools = {
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

const getCartTools = {
  name: "getCart",

  description:
    "Retrieve the current contents of the user's shopping cart, including product details and quantities.",

  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
};

const removeFromCartTools = {
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
const calculateBillTools = {
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
            functionDeclarations: [searchProductsTools, getAllProductsTools, getOneProductTools, checkStockTools, addToCartTools, getCartTools, removeFromCartTools, calculateBillTools]
          }
       ]
      }
    });

    while(response.functionCalls?.length > 0){

      history.push(response.candidates[0].content);

      let functionCall = response.functionCalls[0];
      console.log("Tool arguments:", functionCall.args);

      console.log("ShopMate is using a tool:", functionCall.name);

      const toolFunction = availableTools[functionCall.name];

      if (!toolFunction) {
        throw new Error(`Unknown tool requested: ${functionCall.name}`);
      }

      const result = toolFunction(functionCall.args);

      if (functionCall.name === "addToCart" || functionCall.name === "removeFromCart" || functionCall.name === "getCart") {
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

      response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: history,
        config: {
          tools: [
            {
              functionDeclarations: [searchProductsTools, getAllProductsTools, getOneProductTools, checkStockTools, addToCartTools, getCartTools, removeFromCartTools, calculateBillTools]
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

// Add 2 Mechanical Keyboards to my cart.
// Show my cart.
// Remove the Mechanical Keyboard from my cart.
// Show my cart.