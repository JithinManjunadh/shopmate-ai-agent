const products = require("../data/products");

function getAllProducts(){
    return products;
}

function getOneProduct(productName){
    const oneProduct = products.find(product=>
        productName === product.name
    );
    return oneProduct;
}

function checkStock(productName){
    const product = products.find(product=>
        productName === product.name
    );
    if(!product){
        return "Product not found";
    }
    return product.stock;
}

function searchProducts({category, maxPrice} = {}){
    return products.filter(product=>{
        const matchesCategory = !category || product.category.toLowerCase() === category.toLowerCase();
        
        const matchesPrice = 
        maxPrice === undefined || product.price<=maxPrice;

        return matchesCategory && matchesPrice;
    });
}


module.exports = {getAllProducts, getOneProduct, checkStock, searchProducts};