export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock?: number;
  rating?: number;
  reviewsCount?: number;
  color?: string;
  sizes?: string[];
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Japan Green Outer Jacket',
    description: 'Minimalist military-inspired utility jacket tailored with durable water-repellent Japanese cotton twill and matte horn buttons.',
    price: 3499,
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    stock: 28,
    rating: 4.9,
    reviewsCount: 148,
    color: '#2e4a3d',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 2,
    name: 'Black To Basic Heavyweight Tee',
    description: 'Relaxed drop-shoulder heavyweight 280 GSM combed organic cotton tee with reinforced ribbed collar that never sags.',
    price: 1299,
    category: 'T-Shirts',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    stock: 65,
    rating: 4.8,
    reviewsCount: 230,
    color: '#1a1a1a',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 3,
    name: 'Soft Minimalist Sage Hoodie',
    description: 'Cloud-soft 450 GSM brushed French terry cotton hoodie featuring double-layer hood, hidden phone pouch, and seamless cuffs.',
    price: 2799,
    category: 'Hoodies',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    stock: 42,
    rating: 4.9,
    reviewsCount: 185,
    color: '#8fae9b',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 4,
    name: 'White Off Canvas Workwear Jacket',
    description: 'Architectural cropped zip jacket crafted with off-white structured canvas, antique silver hardware, and interior utility pockets.',
    price: 4299,
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    stock: 19,
    rating: 4.8,
    reviewsCount: 92,
    color: '#f4f3ee',
    sizes: ['M', 'L', 'XL']
  },
  {
    id: 5,
    name: 'One Set Tailored Modern Suit',
    description: 'Two-piece deconstructed blazer and relaxed pleat trousers crafted with breathable wool-blend fabric for effortless contemporary elegance.',
    price: 7999,
    category: 'Suits & Formal',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    stock: 14,
    rating: 4.9,
    reviewsCount: 78,
    color: '#374151',
    sizes: ['38R', '40R', '42R', '44R']
  },
  {
    id: 6,
    name: 'Dinamy Mocha Earth Overshirt',
    description: 'Relaxed button-up shirt in rich mocha brown, spun with slub-textured linen and cotton blend. Perfect for lightweight layering.',
    price: 2199,
    category: 'T-Shirts',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    stock: 35,
    rating: 4.7,
    reviewsCount: 114,
    color: '#6b4423',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 7,
    name: 'Blush Pastel Corduroy Overshirt',
    description: 'Soft 12-wale needlecord overshirt in dusty rose, garment-washed for a lived-in drape and featuring dual chest flap pockets.',
    price: 2899,
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    stock: 22,
    rating: 4.7,
    reviewsCount: 64,
    color: '#d8b4b4',
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    id: 8,
    name: 'White Off Minimalist Crewneck Tee',
    description: 'Ultra-refined staple t-shirt made with 100% Supima long-staple cotton for unmatched drape, softness, and breathability.',
    price: 1199,
    category: 'T-Shirts',
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
    stock: 80,
    rating: 4.9,
    reviewsCount: 310,
    color: '#ffffff',
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 9,
    name: 'Aura Studio Wireless Headphones',
    description: 'Custom acoustic architecture with 40mm dynamic drivers, spatial audio tracking, and 40-hour battery life with memory foam earcups.',
    price: 18999,
    category: 'Tech & Lifestyle',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    stock: 24,
    rating: 4.9,
    reviewsCount: 142,
    color: '#111827',
    sizes: ['One Size']
  },
  {
    id: 10,
    name: 'Chronos Minimalist Chronograph Watch',
    description: 'Precision Swiss quartz movement with sapphire crystal glass, 316L brushed stainless steel case, and interchangeable Italian leather straps.',
    price: 12499,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    stock: 18,
    rating: 4.8,
    reviewsCount: 96,
    color: '#475569',
    sizes: ['40mm']
  },
  {
    id: 11,
    name: 'Terra 75% Mechanical Keyboard',
    description: 'Solid CNC anodized aluminum chassis, hot-swappable tactile Gateron Brown switches, per-key RGB backlighting, and PBT keycaps.',
    price: 5999,
    category: 'Tech & Lifestyle',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    stock: 15,
    rating: 4.9,
    reviewsCount: 210,
    color: '#0f172a',
    sizes: ['ANSI 75%']
  },
  {
    id: 12,
    name: 'Vanguard Weatherproof Commuter 24L',
    description: 'Aerodynamic weatherproof ballistic nylon pack with padded 16-inch laptop compartment and magnetic Fidlock hardware.',
    price: 3999,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    stock: 30,
    rating: 4.8,
    reviewsCount: 88,
    color: '#1e293b',
    sizes: ['24 Litres']
  }
];
