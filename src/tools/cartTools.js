const products = require("../data/products");

const cart = {};

function addToCart(productId, quantity){
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
    if(!cart[productId]){
        return "Product not found in cart";
    }

    delete cart[productId];
    
    return "Product removed from cart";
}

module.exports = {addToCart, getCart, removeFromCart};