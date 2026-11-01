const products = [
    {
        id: "TECH001",
        name: "Wireless Mouse",
        category: "Mouse",
        price: 800,
        gstRate: 18,
        stock: 12,
        brand: "TechNova",
        compatibility: ["Windows", "macOs", "Linux"],
        features: ["Wireless", "USB receiver", "Adjustable"]

    },
    {
        id: "TECH002",
        name: "Mechanical Keyboard",
        category: "Keyboard",
        price: 2200,
        gstRate: 18,
        stock: 8,
        brand: "KeyPro",
        compatibility: ["Windows", "macOS", "Linux"],
        features: ["Mechanical keys", "RGB lighting", "Wired USB"]
    },
    {
        id: "TECH003",
        name: "USB-C Hub",
        category: "Connectivity",
        price: 1500,
        gstRate: 18,
        stock: 6,
        brand: "ConnectX",
        compatibility: ["USB-C laptops"],
        features: ["3 USB-A ports", "HDMI", "USB-C data"]
    }

];

module.exports = products;