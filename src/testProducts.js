const {getAllProducts, getOneProduct, checkStock, searchProducts} = require("./tools/productTools");

const allProducts = getAllProducts();
const oneProduct = getOneProduct("Wireless Mouse");
const productStock = checkStock("Wireless Mouse");
const productSearch = searchProducts({maxPrice: 200});

// console.log(allProducts);
console.log("-----");
console.log(oneProduct);

console.log("-----");
console.log(productStock);

console.log("-----");
console.log(searchProducts({ category: "Mouse" }));