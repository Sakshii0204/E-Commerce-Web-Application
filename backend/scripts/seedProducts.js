import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { Product } from '../src/models/Product.js';

const seedProducts = [
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    category: 'Electronics',
    brand: 'Sony',
    price: 349.99,
    stock: 24,
    description: 'Industry-leading noise canceling headphones with two processors, 8 microphones, and remarkable high-resolution audio fidelity.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Apple Watch Ultra 2 Titanium',
    category: 'Electronics',
    brand: 'Apple',
    price: 799.0,
    stock: 12,
    description: 'The most rugged and capable Apple Watch. Designed for outdoor adventure and endurance training with a lightweight titanium case.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Minimalist Leather Backpack',
    category: 'Accessories',
    brand: 'Nova Atelier',
    price: 129.5,
    stock: 18,
    description: 'Handcrafted from full-grain vegetable-tanned leather. Includes padded 15-inch laptop compartment and weather-resistant zippers.',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Nike Air Max 270 React',
    category: 'Footwear',
    brand: 'Nike',
    price: 159.99,
    stock: 35,
    description: 'The Air Max 270 delivers unrivaled, all-day comfort. The sleek, running-inspired design roots you to Nike heritage.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Oversized Organic Cotton Hoodie',
    category: 'Fashion',
    brand: 'Nova Studio',
    price: 84.0,
    stock: 40,
    description: 'Cut from ultra-heavyweight 480gsm organic cotton French terry. Designed with drop shoulders and double-layered hood.',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Ray-Ban Classic Aviator Sunglasses',
    category: 'Accessories',
    brand: 'Ray-Ban',
    price: 178.0,
    stock: 15,
    description: 'Originally designed for U.S. aviators in 1937. Timeless style meets 100% UV protection and crystal clear polarized optics.',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Mechanical Wireless Keyboard RGB',
    category: 'Electronics',
    brand: 'Nova Tech',
    price: 119.0,
    stock: 4, // Low stock demo
    description: 'Compact 75% mechanical layout with hot-swappable tactile switches, per-key RGB backlighting, and triple connection mode.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Adidas Ultraboost Light Running Shoes',
    category: 'Footwear',
    brand: 'Adidas',
    price: 189.95,
    stock: 22,
    description: 'Experience epic energy with the lightest Ultraboost ever made. Built with BOOST material that offers 30% lighter compound.',
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Tailored Slim-Fit Wool Blazer',
    category: 'Fashion',
    brand: 'Nova Studio',
    price: 245.0,
    stock: 5, // Low stock demo
    description: 'Expertly tailored from breathable Merino wool blend. Structured shoulders and modern slim silhouette for work or evening events.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Smart Ceramic Coffee Mug 2',
    category: 'Electronics',
    brand: 'Nova Tech',
    price: 139.99,
    stock: 2, // Low stock demo
    description: 'Keeps your drink perfectly hot. Set your precise drinking temperature with your smartphone and enjoy every sip hot.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Classic Chronograph Wristwatch',
    category: 'Accessories',
    brand: 'Fossil',
    price: 165.0,
    stock: 19,
    description: 'Sophisticated analog quartz movement with 3 sub-dials, scratch-resistant mineral crystal, and interchangeable leather strap.',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Vintage Suede Chelsea Boots',
    category: 'Footwear',
    brand: 'Nova Studio',
    price: 175.0,
    stock: 14,
    description: 'Crafted in Portugal from buttery water-repellent suede. Features elastic side gussets and durable crepe sole.',
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Pro Wireless Gaming Mouse',
    category: 'Electronics',
    brand: 'Logitech',
    price: 89.99,
    stock: 0, // Out of stock demo
    description: 'Ultra-lightweight esports gaming mouse with 25K HERO sensor and sub-1ms LIGHTSPEED wireless connectivity.',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Linen Casual Summer Shirt',
    category: 'Fashion',
    brand: 'Nova Studio',
    price: 59.5,
    stock: 28,
    description: 'Relaxed fit shirt made with 100% European flax linen. Perfect for warm climates, featuring chest pocket and camp collar.',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Sony Alpha A7 IV Mirrorless Camera',
    category: 'Electronics',
    brand: 'Sony',
    price: 1299.0,
    stock: 7,
    description: '33MP full-frame Exmor R CMOS sensor with 4K 60p 10-bit video recording and real-time Eye AF for creators.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Running Hydration Vest Pack',
    category: 'Fitness',
    brand: 'Nike',
    price: 95.0,
    stock: 16,
    description: 'Ergonomic breathable trail running vest with twin 500ml soft flasks and pole attachment loops.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Stainless Steel Insulated Water Bottle',
    category: 'Fitness',
    brand: 'Nova Tech',
    price: 34.99,
    stock: 50,
    description: 'Double-wall vacuum insulation keeps cold beverages ice cold for 24 hours or steaming hot for 12 hours.',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Polarized Sport Sunglasses',
    category: 'Accessories',
    brand: 'Nike',
    price: 110.0,
    stock: 0, // Out of stock demo
    description: 'Wraparound sports sunglasses designed for cycling and marathon running with anti-fog ventilation channels.',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
];

async function runSeed() {
  try {
    console.log('[SEED] Connecting to MongoDB:', env.MONGODB_URI);
    await mongoose.connect(env.MONGODB_URI);

    let seededCount = 0;
    for (const item of seedProducts) {
      await Product.findOneAndUpdate(
        { name: item.name },
        { $set: item },
        { upsert: true, new: true, runValidators: true }
      );
      seededCount++;
    }

    console.log(`[SEED] Successfully seeded/upserted ${seededCount} products into database.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[SEED ERROR]', error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

runSeed();
