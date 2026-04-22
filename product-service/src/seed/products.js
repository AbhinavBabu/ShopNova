const Product = require("../models/Product");

const sampleProducts = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    description: "Premium over-ear headphones with 30-hour battery life and industry-leading noise cancellation technology.",
    price: 299.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    stock: 50,
    rating: 4.8,
  },
  {
    name: "Mechanical Gaming Keyboard",
    description: "RGB backlit mechanical keyboard with Cherry MX Red switches, perfect for gaming and typing.",
    price: 149.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop",
    stock: 75,
    rating: 4.6,
  },
  {
    name: "Ultra-Wide Curved Monitor",
    description: "34-inch ultra-wide curved display with 144Hz refresh rate and 1ms response time.",
    price: 699.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527443224154-c4a573d5b679?w=400&h=300&fit=crop",
    stock: 30,
    rating: 4.7,
  },
  {
    name: "Ergonomic Office Chair",
    description: "Fully adjustable ergonomic chair with lumbar support and breathable mesh back for all-day comfort.",
    price: 449.99,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=300&fit=crop",
    stock: 20,
    rating: 4.5,
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Double-walled insulated bottle keeps drinks cold for 24 hours and hot for 12 hours. 1L capacity.",
    price: 34.99,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop",
    stock: 200,
    rating: 4.4,
  },
  {
    name: "Smart Fitness Tracker",
    description: "Track your heart rate, sleep, steps, and workouts with 7-day battery life and IP68 waterproofing.",
    price: 89.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=300&fit=crop",
    stock: 120,
    rating: 4.3,
  },
  {
    name: "Minimalist Leather Wallet",
    description: "Slim RFID-blocking leather wallet with 8 card slots and cash compartment.",
    price: 49.99,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop",
    stock: 150,
    rating: 4.6,
  },
  {
    name: "Portable Bluetooth Speaker",
    description: "360° surround sound with 20-hour playtime, waterproof, and built-in microphone for calls.",
    price: 79.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop",
    stock: 90,
    rating: 4.5,
  },
];

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(sampleProducts);
      console.log("[product-service] Seeded 8 sample products");
    } else {
      console.log(`[product-service] ${count} products already exist, skipping seed`);
    }
  } catch (error) {
    console.error("[product-service] Seed error:", error.message);
  }
};

module.exports = seedProducts;
