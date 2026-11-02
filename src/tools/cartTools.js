const products = require("../data/products");

const cart = {};

function addToCart(productId, quantity){

    if(typeof productId !== "string" || productId.trim() === ""){
        return "Invalid product ID"
    }

    productId = productId.trim();

    const product = products.find(product => product.id === productId);

    if(!product){
        return "Product not found";
    }

    if(!Number.isInteger(quantity) || quantity <= 0){
        return "Quantity must be positive number";
    }

    const currentQuantity = cart[productId] || 0;
    const newQuantity = currentQuantity+quantity;

    if(newQuantity>product.stock){
        return `Only ${product.stock} units are available`;
    }

    cart[productId] = newQuantity;
    // console.log(cart);

    return `${product.name} added to cart. Quantity: ${newQuantity}`;
}

function getCart(){
    let items=[];

    for(let productId in cart){

        const product = products.find(product => product.id === productId);

        if(product){
            items.push({...product, quantity: cart[productId]});
        }

    }
    return items;
}

function removeFromCart(productId){

    if(typeof productId !== "string" || productId.trim() === ""){
        return "Invalid product ID"
    }

    productId = productId.trim();

    if(!cart[productId]){
        return "Product not found in cart";
    }

    delete cart[productId];
    
    return "Product removed from cart";
}
// console.log(addToCart(" TECH002 ", 1));
// console.log(removeFromCart(" TECH002 "));
module.exports = {addToCart, getCart, removeFromCart};