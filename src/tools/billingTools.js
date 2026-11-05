const { getCart } = require("./cartTools");

function calculateBill(){
    const items = getCart();

    if(items.length === 0){
        return "Your cart is empty. Add products before calculating the bill."
    }

    const cartFinal = [];

    let totalCost=0;
    let totalGst=0;

    for(let item of items){
        const subTotal= item.quantity * item.price;
        const gst= subTotal*(item.gstRate/100);

        cartFinal.push({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            gstRate: item.gstRate,
            subTotal: subTotal,
            gstAmount: gst,
            total: subTotal + gst
        })
        

        totalGst += gst;
        totalCost += subTotal;
    }
    console.log("cart:" , cartFinal);
    console.log("---------------");

    return {
        items: cartFinal,
        subtotal: totalCost,
        totalGST: totalGst,
        grandTotal: totalCost + totalGst
    };
}
// console.log(calculateBill());

module.exports = {calculateBill};