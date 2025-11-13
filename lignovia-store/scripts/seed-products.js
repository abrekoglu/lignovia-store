import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

const sampleProducts = [
  {
    name: "Handcrafted Walnut Cutting Board",
    shortDescription: "Premium walnut cutting board with elegant grain pattern and natural finish.",
    description: "Crafted from premium American black walnut, this cutting board features a stunning natural grain pattern that develops character over time. The board is hand-sanded to a smooth finish and treated with food-safe mineral oil. Perfect for daily use while doubling as a beautiful serving platter. Each piece is unique, showcasing the natural variations in the wood grain.",
    slug: "handcrafted-walnut-cutting-board",
    category: null,
    price: 89.99,
    compareAtPrice: 119.99,
    currency: "TRY",
    inStock: true,
    stock: 15,
    lowStockThreshold: 5,
    sku: "LIG-WCB-001",
    mainImage: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
    images: [
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
      "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800",
      "https://images.unsplash.com/photo-1594736797933-d0b69fa0e75a?w=800",
    ],
    material: "American Black Walnut",
    finish: "Natural Oil Finish",
    dimensions: {
      width: 35,
      height: 25,
      depth: 3,
      unit: "cm",
    },
    weight: 1.2,
    weightUnit: "kg",
    tags: ["cutting-board", "walnut", "kitchen", "handcrafted"],
    status: "published",
    visibility: "public",
    brand: "LIGNOVIA",
    careInstructions: "Wash with mild soap and warm water. Dry immediately. Apply food-safe mineral oil monthly to maintain finish.",
    warranty: "1 year craftsmanship warranty",
  },
  {
    name: "Oak Wood Serving Tray",
    shortDescription: "Beautiful oak serving tray with handles, perfect for entertaining.",
    description: "This elegant oak serving tray combines functionality with timeless design. Made from sustainably sourced European oak, it features comfortable handles for easy carrying and a generous surface area for serving. The natural oak grain adds warmth to any table setting. Ideal for breakfast in bed, entertaining guests, or as a decorative piece when not in use.",
    slug: "oak-wood-serving-tray",
    category: null,
    price: 75.00,
    compareAtPrice: null,
    currency: "TRY",
    inStock: true,
    stock: 22,
    lowStockThreshold: 8,
    sku: "LIG-OST-002",
    mainImage: "https://images.unsplash.com/photo-1600320326696-5e13e7b5c8e0?w=800",
    images: [
      "https://images.unsplash.com/photo-1600320326696-5e13e7b5c8e0?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
    ],
    material: "European Oak",
    finish: "Matte Varnish",
    dimensions: {
      width: 45,
      height: 30,
      depth: 4,
      unit: "cm",
    },
    weight: 0.8,
    weightUnit: "kg",
    tags: ["serving-tray", "oak", "entertaining", "tableware"],
    status: "published",
    visibility: "public",
    brand: "LIGNOVIA",
    careInstructions: "Wipe clean with a damp cloth. Avoid soaking in water. Polish occasionally with wood conditioner.",
    warranty: "6 months craftsmanship warranty",
  },
  {
    name: "Birch Wood Coffee Table",
    shortDescription: "Modern minimalist coffee table made from premium birch wood.",
    description: "A stunning example of Scandinavian design principles, this coffee table showcases the natural beauty of birch wood. The clean lines and minimalist aesthetic make it perfect for contemporary living spaces. The table features a smooth, satin-finish surface that highlights the wood's natural grain. Its sturdy construction ensures stability while maintaining a lightweight feel.",
    slug: "birch-wood-coffee-table",
    category: null,
    price: 349.99,
    compareAtPrice: 449.99,
    currency: "TRY",
    inStock: true,
    stock: 8,
    lowStockThreshold: 3,
    sku: "LIG-BCT-003",
    mainImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800",
      "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800",
    ],
    material: "Scandinavian Birch",
    finish: "Satin Lacquer",
    dimensions: {
      width: 120,
      height: 45,
      depth: 60,
      unit: "cm",
    },
    weight: 18.5,
    weightUnit: "kg",
    tags: ["coffee-table", "birch", "furniture", "scandinavian"],
    status: "published",
    visibility: "public",
    brand: "LIGNOVIA",
    careInstructions: "Dust regularly with a soft cloth. Clean spills immediately. Use furniture polish suitable for lacquered surfaces.",
    warranty: "2 years craftsmanship warranty",
  },
  {
    name: "Cherry Wood Wine Rack",
    shortDescription: "Elegant 12-bottle wine rack in premium cherry wood.",
    description: "Store and display your wine collection in style with this beautifully crafted cherry wood wine rack. The warm, rich tones of cherry wood complement any wine collection while providing optimal storage conditions. The angled bottle slots ensure corks stay moist and prevent oxidation. Each shelf is carefully spaced to accommodate various bottle sizes.",
    slug: "cherry-wood-wine-rack",
    category: null,
    price: 159.99,
    compareAtPrice: null,
    currency: "TRY",
    inStock: true,
    stock: 12,
    lowStockThreshold: 4,
    sku: "LIG-CWR-004",
    mainImage: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
    images: [
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
      "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800",
      "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800",
    ],
    material: "Premium Cherry Wood",
    finish: "Natural Oil Wax",
    dimensions: {
      width: 60,
      height: 90,
      depth: 30,
      unit: "cm",
    },
    weight: 5.5,
    weightUnit: "kg",
    tags: ["wine-rack", "cherry", "storage", "wine"],
    status: "published",
    visibility: "public",
    brand: "LIGNOVIA",
    careInstructions: "Dust regularly. Keep in a dry location. Treat with wood conditioner every 3 months to maintain finish.",
    warranty: "1 year craftsmanship warranty",
  },
  {
    name: "Teak Wood Salad Bowl Set",
    shortDescription: "Set of 3 hand-turned teak salad bowls, naturally beautiful.",
    description: "This set of three hand-turned teak salad bowls brings natural elegance to your dining table. Each bowl is uniquely crafted from sustainably sourced teak wood, known for its natural resistance to moisture and beautiful golden-brown color. The bowls nest perfectly for storage and are finished with food-safe oil. Perfect for salads, fruit, or as decorative serving pieces.",
    slug: "teak-wood-salad-bowl-set",
    category: null,
    price: 65.00,
    compareAtPrice: 85.00,
    currency: "TRY",
    inStock: true,
    stock: 18,
    lowStockThreshold: 6,
    sku: "LIG-TSBS-005",
    mainImage: "https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?w=800",
    images: [
      "https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?w=800",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800",
    ],
    material: "Sustainably Sourced Teak",
    finish: "Food-Safe Oil",
    dimensions: {
      width: 28,
      height: 12,
      depth: 28,
      unit: "cm",
    },
    weight: 0.6,
    weightUnit: "kg",
    tags: ["salad-bowl", "teak", "set", "dining"],
    status: "published",
    visibility: "public",
    brand: "LIGNOVIA",
    careInstructions: "Hand wash with mild soap. Dry thoroughly. Apply food-safe mineral oil monthly to maintain the finish.",
    warranty: "6 months craftsmanship warranty",
  },
  {
    name: "Maple Wood Picture Frame Set",
    shortDescription: "Set of 4 premium maple wood picture frames in various sizes.",
    description: "Display your cherished memories in these beautifully crafted maple wood picture frames. The light, natural color of maple provides a neutral backdrop that complements any photo while adding warmth to your décor. Each frame features a precision-cut rabbet to securely hold glass and backing. The clean, modern design works with both contemporary and traditional interiors.",
    slug: "maple-wood-picture-frame-set",
    category: null,
    price: 45.99,
    compareAtPrice: null,
    currency: "TRY",
    inStock: true,
    stock: 25,
    lowStockThreshold: 10,
    sku: "LIG-MPFS-006",
    mainImage: "https://images.unsplash.com/photo-1606800433701-640b3c5d5e07?w=800",
    images: [
      "https://images.unsplash.com/photo-1606800433701-640b3c5d5e07?w=800",
      "https://images.unsplash.com/photo-1582515073490-39981397c445?w=800",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800",
    ],
    material: "Hard Maple",
    finish: "Clear Varnish",
    dimensions: {
      width: 20,
      height: 25,
      depth: 2,
      unit: "cm",
    },
    weight: 0.4,
    weightUnit: "kg",
    tags: ["picture-frame", "maple", "set", "decor"],
    status: "published",
    visibility: "public",
    brand: "LIGNOVIA",
    careInstructions: "Dust regularly with a soft cloth. Avoid direct sunlight to prevent fading. Clean glass with glass cleaner.",
    warranty: "6 months craftsmanship warranty",
  },
  {
    name: "Ash Wood Bookshelf",
    shortDescription: "5-tier ash wood bookshelf with adjustable shelves.",
    description: "Organize your library with this elegant 5-tier ash wood bookshelf. The light, neutral tones of ash wood blend seamlessly with any interior style while providing ample storage space. The adjustable shelves allow you to customize the spacing to accommodate books of various sizes. Sturdy construction ensures stability even when fully loaded with books.",
    slug: "ash-wood-bookshelf",
    category: null,
    price: 279.99,
    compareAtPrice: 349.99,
    currency: "TRY",
    inStock: true,
    stock: 6,
    lowStockThreshold: 2,
    sku: "LIG-AWB-007",
    mainImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      "https://images.unsplash.com/photo-1596904355768-34e97a9a10f7?w=800",
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800",
    ],
    material: "European Ash",
    finish: "Natural Wood Stain",
    dimensions: {
      width: 80,
      height: 180,
      depth: 30,
      unit: "cm",
    },
    weight: 22.0,
    weightUnit: "kg",
    tags: ["bookshelf", "ash", "furniture", "storage"],
    status: "published",
    visibility: "public",
    brand: "LIGNOVIA",
    careInstructions: "Dust regularly. Avoid placing in direct sunlight. Use furniture polish for wood to maintain luster.",
    warranty: "2 years craftsmanship warranty",
  },
  {
    name: "Pine Wood Bread Box",
    shortDescription: "Classic pine bread box with sliding lid and magnetic closure.",
    description: "Keep your bread fresh with this charming pine wood bread box. The natural pine aroma adds a subtle freshness while the sliding lid design provides easy access. The magnetic closure ensures a tight seal to maintain optimal humidity levels. The classic design fits perfectly in any kitchen, adding rustic charm while serving a practical purpose.",
    slug: "pine-wood-bread-box",
    category: null,
    price: 55.00,
    compareAtPrice: null,
    currency: "TRY",
    inStock: true,
    stock: 20,
    lowStockThreshold: 7,
    sku: "LIG-PBB-008",
    mainImage: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800",
    images: [
      "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800",
      "https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?w=800",
      "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800",
    ],
    material: "Natural Pine",
    finish: "Food-Safe Finish",
    dimensions: {
      width: 32,
      height: 20,
      depth: 22,
      unit: "cm",
    },
    weight: 1.0,
    weightUnit: "kg",
    tags: ["bread-box", "pine", "kitchen", "storage"],
    status: "published",
    visibility: "public",
    brand: "LIGNOVIA",
    careInstructions: "Wipe clean with a damp cloth. Keep interior dry. Apply food-safe mineral oil every 2 months.",
    warranty: "6 months craftsmanship warranty",
  },
  {
    name: "Mahogany Wood Candle Holder Set",
    shortDescription: "Set of 3 elegant mahogany candle holders in various heights.",
    description: "Create ambient lighting with this sophisticated set of three mahogany candle holders. The rich, deep tones of mahogany add elegance and warmth to any room. Each holder is hand-turned to unique proportions, creating visual interest when grouped together. The wide base ensures stability while the recessed candle area provides safety. Perfect for dinner parties, romantic evenings, or everyday ambiance.",
    slug: "mahogany-wood-candle-holder-set",
    category: null,
    price: 42.99,
    compareAtPrice: 55.00,
    currency: "TRY",
    inStock: true,
    stock: 14,
    lowStockThreshold: 5,
    sku: "LIG-MCHS-009",
    mainImage: "https://images.unsplash.com/photo-1608389165302-3b9c529b7b8d?w=800",
    images: [
      "https://images.unsplash.com/photo-1608389165302-3b9c529b7b8d?w=800",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
      "https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?w=800",
    ],
    material: "Genuine Mahogany",
    finish: "Polished Wax Finish",
    dimensions: {
      width: 8,
      height: 15,
      depth: 8,
      unit: "cm",
    },
    weight: 0.3,
    weightUnit: "kg",
    tags: ["candle-holder", "mahogany", "set", "decor"],
    status: "published",
    visibility: "public",
    brand: "LIGNOVIA",
    careInstructions: "Wipe with a soft cloth to remove candle wax residue. Polish occasionally with furniture wax to maintain shine.",
    warranty: "6 months craftsmanship warranty",
  },
  {
    name: "Cedar Wood Storage Chest",
    shortDescription: "Large cedar storage chest with hinged lid and natural moth-repellent properties.",
    description: "This spacious cedar storage chest combines functionality with natural moth-repellent properties. The aromatic cedar wood naturally repels moths and other pests while keeping your stored items fresh and protected. The hinged lid opens smoothly on concealed hinges, and the interior provides ample space for blankets, linens, or seasonal clothing. The natural cedar aroma adds a pleasant scent to any room.",
    slug: "cedar-wood-storage-chest",
    category: null,
    price: 199.99,
    compareAtPrice: 249.99,
    currency: "TRY",
    inStock: true,
    stock: 9,
    lowStockThreshold: 3,
    sku: "LIG-CSC-010",
    mainImage: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800",
    images: [
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    ],
    material: "Aromatic Cedar",
    finish: "Natural Cedar Oil",
    dimensions: {
      width: 90,
      height: 50,
      depth: 50,
      unit: "cm",
    },
    weight: 15.0,
    weightUnit: "kg",
    tags: ["storage-chest", "cedar", "storage", "furniture"],
    status: "published",
    visibility: "public",
    brand: "LIGNOVIA",
    careInstructions: "Wipe clean with a dry cloth. The natural cedar oil will continue to release its aroma over time. No additional treatment needed.",
    warranty: "2 years craftsmanship warranty",
  },
];

async function seedProducts() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Clear existing products (optional - comment out if you want to keep existing data)
    // await Product.deleteMany({});
    // console.log("Cleared existing products");

    // Insert products
    const insertedProducts = [];
    for (const productData of sampleProducts) {
      try {
        // Check if product with this slug already exists
        const existing = await Product.findOne({ slug: productData.slug });
        if (existing) {
          console.log(`Product with slug "${productData.slug}" already exists, skipping...`);
          continue;
        }

        const product = await Product.create(productData);
        insertedProducts.push(product);
        console.log(`✓ Created product: ${product.name} (${product.slug})`);
      } catch (error) {
        console.error(`Error creating product "${productData.name}":`, error.message);
      }
    }

    console.log(`\n✓ Successfully seeded ${insertedProducts.length} products`);
    return insertedProducts;
  } catch (error) {
    console.error("Error seeding products:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedProducts()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export default seedProducts;


