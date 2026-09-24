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
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 101,
    name: 'Aura Studio Wireless Noise-Cancelling Headphones',
    description: 'Custom acoustic architecture with 40mm dynamic drivers, spatial audio with dynamic head tracking, and up to 40 hours of battery life with ultra-soft memory foam earcups.',
    price: 349.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    stock: 24,
    rating: 4.9,
    reviewsCount: 142
  },
  {
    id: 102,
    name: 'Chronos Minimalist Chronograph Watch',
    description: 'Precision Swiss quartz movement with sapphire crystal glass, 316L brushed stainless steel case, and interchangeable Italian top-grain leather straps. Water-resistant up to 50m.',
    price: 219.00,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    stock: 18,
    rating: 4.8,
    reviewsCount: 96
  },
  {
    id: 103,
    name: 'Nordic Ceramic Drip Coffee Carafe & Brewer',
    description: 'Handcrafted stoneware matte-finish pour-over brewer with double-wall insulated carafe and reusable ultra-fine stainless steel mesh filter for rich artisanal brews.',
    price: 68.50,
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    stock: 35,
    rating: 4.7,
    reviewsCount: 68
  },
  {
    id: 104,
    name: 'Terra Ergonomic Mechanical Keyboard (Gateron Brown)',
    description: 'Compact 75% ANSI layout crafted with solid anodized aluminum chassis, hot-swappable tactile Gateron Brown switches, per-key RGB backlighting, and PBT dye-sub keycaps.',
    price: 159.00,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    stock: 12,
    rating: 4.9,
    reviewsCount: 210
  },
  {
    id: 105,
    name: 'Vanguard Water-Resistant Commuter Backpack 24L',
    description: 'Aerodynamic weatherproof ballistic nylon exterior with padded 16-inch laptop compartment, magnetic Fidlock buckles, hidden RFID security pockets, and breathable back airflow panel.',
    price: 135.00,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    stock: 40,
    rating: 4.8,
    reviewsCount: 88
  },
  {
    id: 106,
    name: 'Lumina Smart Ambient Desk Lamp & Qi Charger',
    description: 'Architectural aluminum LED luminaire featuring CRI 95+ eye-care diffused lighting, touch slider color temperature adjustment (2700K - 6500K), and integrated 15W wireless fast-charging base.',
    price: 89.99,
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    stock: 28,
    rating: 4.6,
    reviewsCount: 54
  },
  {
    id: 107,
    name: 'Apex Precision Wireless Optical Mouse (Ergo-Grip)',
    description: 'PixArt PAW3395 26,000 DPI sensor with sub-1ms wireless latency, Bluetooth 5.2 tri-mode connectivity, silent tactile Kailh switches, and ergonomic thumb rest for all-day productivity.',
    price: 79.50,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    stock: 50,
    rating: 4.7,
    reviewsCount: 119
  },
  {
    id: 108,
    name: 'Solstice Polarized Acetate Sunglasses',
    description: 'Hand-polished Italian Mazzucchelli acetate frames fitted with scratch-resistant category 3 polarized lenses providing 100% UV400 defense against harsh solar glare.',
    price: 120.00,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    stock: 22,
    rating: 4.8,
    reviewsCount: 75
  },
  {
    id: 109,
    name: 'Zenith Organic Bamboo Weighted Blanket (15 lbs)',
    description: 'Eco-certified 100% silky cooling bamboo viscose fabric filled with micro-glass beads inside 7-layer diamond quilted pockets, providing gentle therapeutic deep pressure stimulation.',
    price: 110.00,
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    stock: 15,
    rating: 4.9,
    reviewsCount: 160
  }
];
