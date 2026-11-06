# 🛒 ShopMate AI — Intelligent Shopping Assistant

ShopMate AI is a terminal-based shopping assistant built with **Node.js, JavaScript, and Google's Gemini API**. It uses AI function calling to understand natural-language shopping requests, select appropriate tools, execute shopping operations, and provide responses based on the results.

Instead of manually navigating through multiple operations, users can interact with ShopMate using everyday language.

For example:

> Find all available products, check the stock of the wireless mouse, add two to my cart, show my cart, and calculate the final bill.

ShopMate interprets the request, determines which tools are required, executes them, and presents the results.

---

## ✨ Features

### Product Management
- Retrieve all available products.
- Search products by category.
- Filter products by maximum price.
- Retrieve detailed information about a specific product.
- Check available stock for individual products.

### Shopping Cart
- Add products to the cart using product IDs.
- Specify the quantity to add.
- View current cart contents.
- Remove products from the cart.
- Prevent adding quantities beyond available stock.

### Billing
- Calculate individual product subtotals.
- Calculate GST for each product.
- Calculate total GST.
- Generate the final bill, including the grand total.
- Handle empty-cart billing requests.

### AI Agent Capabilities
- Understand natural-language shopping requests.
- Select tools dynamically using Gemini function calling.
- Execute multiple tool calls in a single response.
- Continue the tool-calling cycle until Gemini generates a final response.
- Maintain conversation history during the terminal session.
- Handle invalid inputs, unknown tools, and execution errors.
- Enforce a configurable tool-call limit per user request.

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| JavaScript | Application logic and tool implementation |
| Node.js | Runtime environment |
| Google Gemini API | Natural-language understanding and agent reasoning |
| `@google/genai` | Official Google GenAI JavaScript SDK |
| `dotenv` | Environment variable management |
| `readline/promises` | Terminal-based user interaction |

The application uses a custom function-calling implementation rather than an agent framework. This makes the tool execution process, conversation history, and agent control flow easier to understand and customize.

---

## 🏗️ Project Architecture

The project separates product data, business logic, billing logic, and AI orchestration.

```text
shopmate-ai-agent/
│
├── src/
│   │
│   ├── data/
│   │   └── products.js
│   │
│   ├── tools/
│   │   ├── productTools.js
│   │   ├── cartTools.js
│   │   └── billingTools.js
│   │
│   ├── test-chat.js
│   └── test-gemini.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

### Folder and File Responsibilities

**`src/data/products.js`**

Contains the product catalogue used by the application.

Each product has information such as:
- Product ID
- Name
- Category
- Price
- GST rate
- Available stock
- Brand
- Compatibility
- Features

**`src/tools/productTools.js`**

Contains product-related business logic:
- `getAllProducts()`
- `getOneProduct(productName)`
- `searchProducts({ category, maxPrice })`
- `checkStock(productName)`

**`src/tools/cartTools.js`**

Contains shopping cart operations:
- `addToCart(productId, quantity)`
- `getCart()`
- `removeFromCart(productId)`

**`src/tools/billingTools.js`**

Contains the billing functionality:
- `calculateBill()`

It retrieves the current cart, calculates item subtotals and GST, and returns the final bill.

**`src/test-gemini.js`**

Used to verify connectivity with the Gemini API.

**`src/test-chat.js`**

The main application entry point. It handles:
- Terminal interaction.
- Gemini API requests.
- Function declarations.
- Tool selection and execution.
- Conversation history.
- Multi-tool execution.
- Error handling.
- Tool-call limits.
- Final AI responses.

---

## ⚙️ How ShopMate Works

ShopMate follows an AI tool-calling workflow.

The AI does not directly modify the shopping cart or execute business operations. Instead, Gemini decides which available function should be called, while the actual operations are performed by JavaScript functions in the application.

### 1. User Input

The user enters a natural-language request in the terminal.

Example:

```text
Find all products and check the stock of the wireless mouse.
```

The application sends the request and conversation history to Gemini.

### 2. Tool Declarations

The application provides Gemini with function declarations.

Each declaration describes:
- Function name.
- Function description.
- Expected parameters.
- Parameter types.
- Required parameters.

For example, the `checkStock` tool tells Gemini that it requires a product name as a string.

These declarations help Gemini understand which operations are available and when to use them.

### 3. Tool Selection

Gemini interprets the user's request and decides whether it needs to call one or more functions.

For example:

```text
User: Check the stock of the wireless mouse.
```

Gemini may return a function call resembling:

```js
{
  name: "checkStock",
  args: {
    productName: "Wireless Mouse"
  }
}
```

This is a function-call request, not the actual execution of the function.

### 4. Tool Execution

The application maintains an `availableTools` object that maps Gemini's function names to JavaScript implementations.

Example:

```js
const availableTools = {
  searchProducts: (args) => searchProducts(args),
  getAllProducts: () => getAllProducts(),
  getOneProduct: (args) => getOneProduct(args.productName),
  checkStock: (args) => checkStock(args.productName),
  addToCart: (args) => addToCart(args.productId, args.quantity),
  getCart: () => getCart(),
  removeFromCart: (args) => removeFromCart(args.productId),
  calculateBill: () => calculateBill()
};
```

When Gemini requests a function, the application looks it up in this object and executes the corresponding JavaScript function.

The application then sends the function result back to Gemini.

### 5. Multi-Tool Execution Loop

A single user request may require multiple operations.

For example:

```text
Find the wireless mouse, check its stock, and show my cart.
```

Gemini may request multiple function calls in one response or request additional tools after receiving previous results.

ShopMate handles this using two loops:

- A `for...of` loop processes every function call in the current Gemini response.
- A `while` loop continues the interaction while Gemini keeps requesting additional functions.

The application executes all function calls from the current response, adds their results to conversation history, and then sends the updated history back to Gemini.

This continues until Gemini provides a normal text response or the tool-call limit is reached.

### 6. Conversation History

ShopMate maintains a history array throughout the terminal session.

It stores:
- User messages.
- Gemini's responses.
- Gemini's function-call messages.
- Function execution results.
- Final assistant responses.

This allows Gemini to use previous messages and tool results when responding to follow-up requests.

The conversation history exists in application memory and is not persisted to a database.

### 7. Final Response

After the required operations are completed, Gemini receives the available information and generates a natural-language response.

For example:

```text
ShopMate: The Wireless Mouse is currently available with
12 units in stock.
```

---

## 🛡️ Validation and Error Handling

A reliable AI agent should not blindly trust the arguments generated by an LLM.

Even though Gemini receives function schemas describing the expected arguments, the application independently validates inputs before performing operations.

### Input Validation

**Product operations**
- Validate product names.
- Reject empty or invalid names.
- Handle products that do not exist.
- Validate optional search categories.
- Validate maximum price values.
- Reject negative and non-finite prices.

**Cart operations**
- Validate product IDs.
- Ensure the product exists.
- Validate that quantities are positive integers.
- Prevent cart quantities from exceeding available stock.
- Handle attempts to remove products that are not in the cart.

**Billing**
- Check whether the cart is empty before calculating a bill.
- Avoid generating a misleading zero-value bill for an empty cart.

### Tool Execution Error Handling

Tool execution is wrapped in `try...catch`.

This prevents an unexpected exception in a JavaScript function from immediately terminating the agent.

The application logs the actual error for debugging and returns a safer error result to Gemini.

### Unknown Tool Handling

The application checks whether the requested function exists in `availableTools`.

If the function name is unknown, it returns an error result rather than attempting to execute an undefined function.

This separates unknown-tool handling from unexpected execution errors.

---

## 🔁 Tool-Call Limit

ShopMate implements a configurable maximum number of tool calls per user request.

```js
const MAX_TOOL_CALLS = 10;
```

The counter resets whenever the user submits a new prompt.

This means:
- Each individual request can execute up to 10 tool calls.
- Multiple tool calls in one Gemini response are counted individually.
- Separate prompts in the same terminal session each receive their own limit.

### Why is this necessary?

An AI agent may repeatedly request tools or perform unnecessary operations. Without a limit, this can lead to excessive API usage, increased execution time, or repeated operations.

The limit provides a safeguard against excessive tool execution without restricting normal conversation across separate requests.

### What happens when the limit is reached?

ShopMate:
1. Stops executing additional tool calls.
2. Adds an error result for blocked calls to the conversation history.
3. Sends the existing history to Gemini for a final summary.
4. Explicitly disables function calling using `functionCallingConfig.mode: "NONE"`.
5. Instructs Gemini to explain what was completed, what remains incomplete, and why.

This ensures that ShopMate can provide a useful summary without claiming that an operation was completed when its tool was never executed.

---

## 🧾 Billing Logic

Each product contains a price and GST rate.

For every cart item:

**Subtotal**

```text
Subtotal = Quantity × Unit Price
```

**GST Amount**

```text
GST = Subtotal × (GST Rate / 100)
```

**Item Total**

```text
Item Total = Subtotal + GST
```

The final bill contains:
- Individual product details.
- Quantity.
- Unit price.
- GST rate.
- Item subtotal.
- GST amount.
- Item total.
- Overall subtotal.
- Total GST.
- Grand total.

### Example

Suppose the cart contains two Mechanical Keyboards.

| Detail | Value |
|---|---:|
| Product | Mechanical Keyboard |
| Unit price | ₹2,200 |
| Quantity | 2 |
| GST rate | 18% |
| Subtotal | ₹4,400 |
| GST | ₹792 |
| **Grand Total** | **₹5,192** |

---

## 🧪 Testing and Edge Cases

The application was manually tested through terminal interactions and direct tool testing.

The following scenarios were verified.

| Test Scenario | Expected Behavior | Result |
|---|---|---|
| Retrieve all products | Return the complete catalogue | Passed |
| Search by category | Return matching products | Passed |
| Search by maximum price | Return products within the price limit | Passed |
| Retrieve a product | Return product details | Passed |
| Check stock | Return available quantity | Passed |
| Add product to cart | Add the requested quantity | Passed |
| View cart | Display current cart contents | Passed |
| Remove product | Remove the product from the cart | Passed |
| Calculate bill | Calculate subtotal, GST, and grand total | Passed |
| Invalid product ID | Reject the operation | Passed |
| Invalid quantity | Reject zero, negative, or non-integer quantities | Passed |
| Insufficient stock | Reject quantities exceeding available stock | Passed |
| Empty cart billing | Return an empty-cart message | Passed |
| Multiple tool calls | Execute every function call in a response | Passed |
| Unknown tool | Return an error instead of crashing | Passed |
| Tool execution exception | Catch unexpected execution errors | Passed |
| Tool-call limit | Block additional tool executions and summarize progress | Passed |

### Selected Test Examples

**1. Product stock checking**

User:

```text
Check stock for a mouse and a keyboard.
```

Gemini requested multiple functions, and ShopMate executed the required operations.

Result:

```text
Wireless Mouse: 12 units
Mechanical Keyboard: 8 units
```

**2. Invalid product ID**

User:

```text
Add 2 products with ID INVALID001.
```

Result:

```text
Product not found
```

The cart remained unchanged.

**3. Insufficient stock**

User:

```text
Add 20 Wireless Mouse to my cart.
```

Result:

```text
Only 12 units are available.
```

No product was added automatically.

**4. Empty cart billing**

User:

```text
Calculate my bill.
```

Result:

```text
Your cart is empty. Add products before calculating the bill.
```

**5. Stock boundary**

User:

```text
Add 12 Wireless Mouse.
```

The operation succeeded.

When another unit was requested, ShopMate rejected it because the entire available stock was already in the cart.

**6. Multiple tool calls in one response**

User:

```text
Check stock for a mouse and a keyboard.
```

Gemini returned two function calls in the same response. ShopMate executed both instead of processing only the first one.

**7. Tool-call limit**

User:

```text
Find all products, show my cart, add wireless mouse and calculate my bill.
```

With a temporary limit of two calls, ShopMate executed the first two operations, blocked subsequent calls, and generated a summary explaining which operations were incomplete.

---

## 🚀 Getting Started

### Prerequisites

- Node.js installed.
- npm installed.
- A Google Gemini API key.

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
```

### 2. Navigate to the Project

```bash
cd shopmate-ai-agent
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder with your actual Gemini API key.

**Important:** Never commit your `.env` file or expose your API key publicly.

### 5. Run the Application

```bash
node src/test-chat.js
```

You can now interact with ShopMate directly through the terminal.

Type `exit` to end the session.

---

## 💬 Example Interactions

Try asking ShopMate:

```text
Show me all available products.
```

```text
Find products in the Mouse category.
```

```text
Find products under 2000 rupees.
```

```text
Show me the details of the Mechanical Keyboard.
```

```text
Check stock for the Wireless Mouse.
```

```text
Add two Mechanical Keyboards to my cart.
```

```text
Show my cart.
```

```text
Remove the Mechanical Keyboard from my cart.
```

```text
Calculate my bill.
```

You can also combine multiple operations into a single natural-language request.

---

## ⚠️ Current Limitations

ShopMate is an educational and experimental terminal-based AI agent.

Current implementation limitations:

- The product catalogue is stored locally in a JavaScript array.
- Shopping cart data is maintained in memory.
- Cart contents are not preserved after the application exits.
- No external inventory or payment system is connected.
- No database is currently used.
- No graphical user interface or web application is included.
- No user authentication or multi-user cart management is implemented.
- Tool-call limits are configured in the application and are not a substitute for full production-grade monitoring.

---

## 🎯 Learning Outcomes

Building ShopMate from scratch provided practical experience with:

- LLM integration using the Gemini API.
- AI agents and function calling.
- Tool declarations and JSON parameter schemas.
- Mapping model-requested functions to application logic.
- Multi-tool execution and agent loops.
- Maintaining conversation history.
- Handling function-call responses and tool results.
- Input validation and exception handling.
- Unknown-tool handling.
- Controlling agent execution with tool-call limits.
- Designing modular JavaScript applications.
- Separating AI reasoning from actual business logic.

One of the central design principles behind ShopMate is:

**The LLM decides which tool to use; the application validates and executes the operation.**

This separation keeps the business logic under application control while allowing natural-language interaction through an AI model.

---

## 📌 Future Improvements

Potential enhancements for future versions include:

- Persistent product and cart storage using a database.
- User accounts and individual shopping carts.
- Quantity adjustment functionality.
- A web-based shopping interface.
- Order management and checkout workflows.

---

## 👨‍💻 Author

**Jithin Manjunadh**

Built as a hands-on project to understand AI agents, LLM function calling, tool execution, and practical application development using JavaScript and Node.js.
