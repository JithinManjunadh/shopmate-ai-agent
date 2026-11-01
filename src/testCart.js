const {addToCart, getCart, removeFromCart} = require("./tools/cartTools");
const {calculateBill} = require("./tools/billingTools");


console.log(addToCart("TECH001", 2));
console.log(addToCart("TECH001", 3));
console.log(addToCart("TECH001", 20));
console.log(addToCart("INVALID", 1));
console.log(addToCart("TECH002", -1));
console.log(addToCart("TECH002", 1));


// console.log(removeFromCart("TECH001"));
console.log(getCart());
console.log(removeFromCart("TECH999"));
console.log("-----------------");
console.log(calculateBill());