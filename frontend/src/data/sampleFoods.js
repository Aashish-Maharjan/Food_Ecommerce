// Sample food data for the application
export const sampleFoods = [
  // SNACKS CATEGORy
  

  {
    _id: '6',
    name: 'Samosa',
    description: 'Crispy pastry filled with spiced potatoes and peas, served with mint chutney and tamarind sauce.',
    price: 25,
    discountedPrice: 20,
    discount: 5,
    category: 'snacks',
    image: '/src/assets/samosa.webp',
    rating: 4.7,
    numReviews: 112,
    prepTime: 10,
    spiceLevel: 'medium',
    stock: 55,
    featured: true,
    tags: ['crispy', 'traditional', 'spicy']
  },
  {
    _id: '7',
    name: 'Pakoda',
    description: 'Assorted vegetable fritters made with chickpea flour and aromatic spices, perfect with tea.',
    price: 25,
    discountedPrice: 20,
    discount: 5,
    category: 'snacks',
    image: '/src/assets/pakauda.avif',
    rating: 4.3,
    numReviews: 73,
    prepTime: 12,
    spiceLevel: 'mild',
    stock: 39,
    featured: false,
    tags: ['fritters', 'vegetarian', 'tea-time']
  },
  
  // SWEETS CATEGORY
  {
    _id: '9',
    name: 'Lalmohan',
    description: 'Soft, spongy milk solids soaked in rose-flavored sugar syrup, a classic Indian sweet.',
    price: 30,
    discountedPrice: 25,
    discount: 5,
    category: 'sweets',
    image: '/src/assets/lalmohan.webp',
    rating: 4.9,
    numReviews: 189,
    prepTime: 5,
    spiceLevel: 'mild',
    stock: 78,
    featured: true,
    tags: ['traditional', 'syrup', 'milk']
  },
  {
    _id: '10',
    name: 'Rasbhari',
    description: 'Soft cottage cheese balls soaked in light sugar syrup, originating from Bengal.',
    price: 40,
    discountedPrice: 30,
    discount: 10,
    category: 'sweets',
    image: '/src/assets/rasbhari.webp',
    rating: 4.7,
    numReviews: 145,
    prepTime: 5,
    spiceLevel: 'mild',
    stock: 65,
    featured: false,
    tags: ['bengali', 'cottage-cheese', 'syrup']
  },
  {
    _id: '11',
    name: 'Jerry',
    description: 'Crispy, spiral-shaped sweet made from flour batter, deep-fried and soaked in sugar syrup.',
    price: 20,
    discountedPrice: 15,
    discount: 5,
    category: 'sweets',
    image: '/src/assets/jerry.webp',
    rating: 4.6,
    numReviews: 98,
    prepTime: 6,
    spiceLevel: 'mild',
    stock: 82,
    featured: false,
    tags: ['crispy', 'spiral', 'syrup']
  },
  {
    _id: '13',
    name: 'Barfi',
    description: 'Traditional milk-based sweet fudge available in various flavors like coconut, pistachio, and cardamom.',
    price: 30,
    discountedPrice: 25,
    discount: 5,
    category: 'sweets',
    image: '/src/assets/barfi.jpeg',
    rating: 4.5,
    numReviews: 89,
    prepTime: 8,
    spiceLevel: 'mild',
    stock: 58,
    featured: false,
    tags: ['fudge', 'milk', 'traditional']
  },
  {
    _id: '14',
    name: 'Laddu',
    description: 'Round sweet balls made from various ingredients like gram flour, semolina, or coconut.',
    price: 15000,
    discountedPrice: 0,
    discount: 0,
    category: 'sweets',
    image: '/src/assets/laddu.gif',
    rating: 4.4,
    numReviews: 76,
    prepTime: 7,
    spiceLevel: 'mild',
    stock: 71,
    featured: false,
    tags: ['round', 'traditional', 'festive']
  },
  {
    _id: '15',
    name: 'Halwa',
    description: 'Dense, sweet confection made from various ingredients like carrots, semolina, or nuts.',
    price: 15000,
    discountedPrice: 15000,
    discount: 0,
    category: 'sweets',
    image: '/src/assets/halwa.webp',
    rating: 4.6,
    numReviews: 103,
    prepTime: 20,
    spiceLevel: 'mild',
    stock: 52,
    featured: false,
    tags: ['dense', 'confection', 'traditional']
  },
];

// Categories (only Snacks and Sweets)
export const categories = [
  { value: 'snacks', label: 'Snacks', icon: '🍽️' },
  { value: 'sweets', label: 'Sweets', icon: '🍬' }
];

// Spice levels
export const spiceLevels = [
  { value: 'mild', label: 'Mild', icon: '🌶️' },
  { value: 'medium', label: 'Medium', icon: '🌶️🌶️' },
  { value: 'hot', label: 'Hot', icon: '🌶️🌶️🌶️' }
];

// Price ranges
export const priceRanges = [
  { value: '0-100', label: 'Under Rs. 100', min: 0, max: 100 },
  { value: '100-200', label: 'Rs. 100 - Rs. 200', min: 100, max: 200 },
  { value: '200-300', label: 'Rs. 200 - Rs. 300', min: 200, max: 300 },
  { value: '300+', label: 'Above Rs. 300', min: 300, max: 9999 }
];

// Sort options
export const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'discount', label: 'Highest Discount' }
];

// View modes
export const viewModes = [
  { value: 'grid', label: 'Grid View', icon: '⊞' },
  { value: 'list', label: 'List View', icon: '☰' }
];
