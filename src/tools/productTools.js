const products = require("../data/products");

function getAllProducts(){
    return products;
}

function getOneProduct(productName){
    if(typeof productName !== "string" || productName.trim() === ""){
        return "Invalid product name";
    }
    const oneProduct = products.find(product=>
        productName.trim().toLowerCase() === product.name.toLowerCase()
    );
    if(!oneProduct){
        return "Product not found";
    }
    return oneProduct;
}

function searchProducts({category, maxPrice} = {}){

    if(category !== undefined && (typeof category !== "string" || category.trim()==="")){ //validation
        return "Invalid category";
    }
    if(maxPrice !== undefined && (typeof maxPrice !== "number" || !Number.isFinite(maxPrice) || maxPrice<0)){ //validation
        return "Invalid maximum price";
    }

    return products.filter(product=>{ 
        const matchesCategory = !category || product.category.toLowerCase() === category.trim().toLowerCase();
        
        const matchesPrice = 
        maxPrice === undefined || product.price<=maxPrice;

        return matchesCategory && matchesPrice;
    });
}

function checkStock(productName){

    if(typeof productName !== "string" || productName.trim() === ""){
        return "Invalid product name";
    }

    const product = products.find(product=>
        productName.trim().toLowerCase() === product.name.toLowerCase()
    );

    if(!product){
        return "Product not found";
    }

    return product.stock;
}


module.exports = {getAllProducts, getOneProduct, checkStock, searchProducts};