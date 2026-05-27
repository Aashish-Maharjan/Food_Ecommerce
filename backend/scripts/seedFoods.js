const mongoose = require('mongoose');
const Food = require('../models/Food');
const connectDB = require('../config/db');

// Sample food data matching the Food model schema
const sampleFoods = [
  {
    name: 'Samosa',
    description: 'Crispy pastry filled with spiced potatoes and peas, served with mint chutney and tamarind sauce.',
    price: 15000,
    discount: 0, // 20% discount (5 off 25)
    category: 'Snacks',
    cuisine: 'Indian',
    image: '/src/assets/samosa.webp',
    rating: 4.7,
    numReviews: 112,
    prepTime: 10,
    spiceLevel: 'Medium',
    stock: 55,
    featured: true,
    availability: true
  },
  {
    name: 'Pakoda',
    description: 'Assorted vegetable fritters made with chickpea flour and aromatic spices, perfect with tea.',
    price: 25,
    discount: 20, // 20% discount (5 off 25)
    category: 'Snacks',
    cuisine: 'Indian',
    image: '/src/assets/pakauda.avif',
    rating: 4.3,
    numReviews: 73,
    prepTime: 12,
    spiceLevel: 'Mild',
    stock: 39,
    featured: false,
    availability: true
  },
  {
    name: 'Lalmohan',
    description: 'Soft, spongy milk solids soaked in rose-flavored sugar syrup, a classic Indian sweet.',
    price: 30,
    discount: 16.67, // ~17% discount (5 off 30)
    category: 'Desserts',
    cuisine: 'Indian',
    image: '/src/assets/lalmohan.webp',
    rating: 4.9,
    numReviews: 189,
    prepTime: 5,
    spiceLevel: 'Mild',
    stock: 78,
    featured: true,
    availability: true
  },
  {
    name: 'Rasbhari',
    description: 'Soft cottage cheese balls soaked in light sugar syrup, originating from Bengal.',
    price: 40,
    discount: 25, // 25% discount (10 off 40)
    category: 'Desserts',
    cuisine: 'Indian',
    image: '/src/assets/rasbhari.webp',
    rating: 4.7,
    numReviews: 145,
    prepTime: 5,
    spiceLevel: 'Mild',
    stock: 65,
    featured: false,
    availability: true
  },
  {
    name: 'Jerry',
    description: 'Crispy, spiral-shaped sweet made from flour batter, deep-fried and soaked in sugar syrup.',
    price: 20,
    discount: 25, // 25% discount (5 off 20)
    category: 'Desserts',
    cuisine: 'Indian',
    image: '/src/assets/jerry.webp',
    rating: 4.6,
    numReviews: 98,
    prepTime: 6,
    spiceLevel: 'Mild',
    stock: 82,
    featured: false,
    availability: true
  },
  {
    name: 'Barfi',
    description: 'Traditional milk-based sweet fudge available in various flavors like coconut, pistachio, and cardamom.',
    price: 30,
    discount: 16.67, // ~17% discount (5 off 30)
    category: 'Desserts',
    cuisine: 'Indian',
    image: '/src/assets/barfi.jpeg',
    rating: 4.5,
    numReviews: 89,
    prepTime: 8,
    spiceLevel: 'Mild',
    stock: 58,
    featured: false,
    availability: true
  },
  {
    name: 'Laddu',
    description: 'Round sweet balls made from various ingredients like gram flour, semolina, or coconut.',
    price: 15,
    discount: 33.33, // ~33% discount (5 off 15)
    category: 'Desserts',
    cuisine: 'Indian',
    image: '/src/assets/laddu.gif',
    rating: 4.4,
    numReviews: 76,
    prepTime: 7,
    spiceLevel: 'Mild',
    stock: 71,
    featured: false,
    availability: true
  },
  {
    name: 'Halwa',
    description: 'Dense, sweet confection made from various ingredients like carrots, semolina, or nuts.',
    price: 15000,
    discount: 0, // 20% discount (20 off 100)
    category: 'Desserts',
    cuisine: 'Indian',
    image: '/src/assets/halwa.webp',
    rating: 4.6,
    numReviews: 103,
    prepTime: 20,
    spiceLevel: 'Mild',
    stock: 52,
    featured: false,
    availability: true
  }
];

// Connect to MongoDB using the same connection as server

// Seed foods
const seedFoods = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing foods (optional - comment out if you want to keep existing data)
    // await Food.deleteMany({});
    // console.log('Cleared existing foods');

    // Check if foods already exist
    const existingFoods = await Food.find({});
    if (existingFoods.length > 0) {
      console.log(`Found ${existingFoods.length} existing foods in database.`);
      console.log('To reseed, delete existing foods first or modify this script.');
      process.exit(0);
    }

    // Insert sample foods
    const insertedFoods = await Food.insertMany(sampleFoods);
    console.log(`✅ Successfully seeded ${insertedFoods.length} foods into the database!`);
    console.log('\nSeeded foods:');
    insertedFoods.forEach((food, index) => {
      console.log(`${index + 1}. ${food.name} (ID: ${food._id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding foods:', error);
    process.exit(1);
  }
};

// Run the seed function
seedFoods();

