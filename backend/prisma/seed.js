const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Book Worm Database (UI-Accurate Master Catalogue) ---');

  // Clean existing tables in reverse dependency order
  await prisma.giftPointsTransaction.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.productRelation.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Seed Categories (Matching Left Sidebar from Book Worm UI exactly)
  const categoriesList = [
    { name: 'Romance', slug: 'romance', description: 'Romantic novels and love stories' },
    { name: 'Mystery', slug: 'mystery', description: 'Crime thrillers and investigative whodunits' },
    { name: 'Science Fiction', slug: 'science-fiction', description: 'Futuristic and cosmic adventures' },
    { name: 'Fantasy', slug: 'fantasy', description: 'Mythical realms, magic, and epic sagas' },
    { name: 'Historical', slug: 'historical', description: 'Historical fiction and period dramas' },
    { name: 'Biography', slug: 'biography', description: 'Life stories of inspiring personalities' },
    { name: 'Self-help', slug: 'self-help', description: 'Habits, productivity, and mindfulness' },
    { name: 'Memoir', slug: 'memoir', description: 'Personal reflections and autobiographies' },
    { name: 'Travel', slug: 'travel', description: 'Wanderlust journeys, cultures, and guides' },
    { name: 'Cooking', slug: 'cooking', description: 'Culinary arts, recipes, and gastronomy' },
    { name: "Children's", slug: 'childrens', description: 'Stories, fairy tales, and illustrated books' },
    { name: 'Young Adult', slug: 'young-adult', description: 'Coming-of-age fiction and teen adventures' },
    { name: 'Comics & Graphic Novels', slug: 'comics', description: 'Illustrated narratives and graphic epics' },
    { name: 'Poetry', slug: 'poetry', description: 'Lyrical verses and anthologies' },
    { name: 'Drama', slug: 'drama', description: 'Plays, theatrical scripts, and dramatic fiction' },
    { name: 'Science', slug: 'science', description: 'Physics, biology, astronomy, and cosmology' },
    { name: 'Philosophy', slug: 'philosophy', description: 'Classic and modern philosophical thought' },
    { name: 'Religion', slug: 'religion', description: 'Spiritual guides and religious philosophy' },
    { name: 'Language Learning', slug: 'language-learning', description: 'Grammar, linguistics, and fluency' }
  ];

  const categories = {};
  for (const cat of categoriesList) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }

  // 2. Seed Publishers / Brands
  const brandsList = [
    { name: 'Penguin Random House', slug: 'penguin-random-house', description: 'World premier trade book publisher' },
    { name: 'HarperCollins', slug: 'harpercollins', description: 'Leading global publisher of timeless literature' },
    { name: "O'Reilly Media", slug: 'oreilly-media', description: 'Pioneering technology and engineering books' },
    { name: 'Oxford University Press', slug: 'oxford-university-press', description: 'World-renowned academic press' }
  ];

  const brands = {};
  for (const b of brandsList) {
    const created = await prisma.brand.create({ data: b });
    brands[b.slug] = created;
  }

  // 3. Seed Demo Users
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const user1 = await prisma.user.create({
    data: {
      firstName: 'Alice',
      lastName: 'Sharma',
      email: 'customer1@bookstore.com',
      passwordHash,
      role: 'CUSTOMER',
      giftPointsBalance: 500,
      cart: { create: {} }
    }
  });

  const user2 = await prisma.user.create({
    data: {
      firstName: 'Bob',
      lastName: 'Verma',
      email: 'customer2@bookstore.com',
      passwordHash,
      role: 'CUSTOMER',
      giftPointsBalance: 300,
      cart: { create: {} }
    }
  });

  // Welcome gift point audit
  await prisma.giftPointsTransaction.create({
    data: {
      userId: user1.id,
      transactionType: 'CREDIT',
      points: 500,
      referenceId: 'WELCOME_BONUS'
    }
  });

  // 4. Seed Saved Addresses
  const address1 = await prisma.address.create({
    data: {
      userId: user1.id,
      recipientName: 'Alice Sharma',
      phoneNumber: '9876543210',
      street: '42 MG Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
      isDefault: true
    }
  });

  // 5. Seed Books (Matching ALL the books shown in the attached UI screenshots)
  const booksData = [
    // --- Section: Recommended for You ---
    {
      title: 'The Art of Focus',
      author: 'Arjun Patel',
      isbn: '978-0143450011',
      description: 'Practical guide to mastering focus & boosting productivity every day.',
      price: 399,
      format: 'Paperback',
      tagText: 'Non-fiction, Self Help',
      catSlug: 'self-help',
      brandSlug: 'penguin-random-house',
      rating: 4.8,
      deliveryDateText: 'Delivery by Mon, 21 Jul',
      deliveryDays: 2,
      coverBgColor: '#f8fafc',
      stockQuantity: 25
    },
    {
      title: 'The Art of Learning',
      author: 'Raj Patel',
      isbn: '978-0143450012',
      description: 'Master the mindset and methods for effective lifelong learning.',
      price: 259,
      format: 'Paperback',
      tagText: 'Non-fiction, Self Help',
      catSlug: 'self-help',
      brandSlug: 'harpercollins',
      rating: 4.7,
      deliveryDateText: 'Delivery by Mon, 21 Jul',
      deliveryDays: 2,
      coverBgColor: '#ef4444',
      stockQuantity: 30
    },
    {
      title: 'The Path to Success',
      author: 'James Wright',
      isbn: '978-0143450013',
      description: 'A practical guide to achieving goals with clarity and confidence.',
      price: 359,
      format: 'Paperback',
      tagText: 'Non-fiction, Self Help',
      catSlug: 'self-help',
      brandSlug: 'penguin-random-house',
      rating: 4.9,
      deliveryDateText: 'Delivery by Mon, 21 Jul',
      deliveryDays: 2,
      coverBgColor: '#0284c7',
      stockQuantity: 20
    },

    // --- Section: Bestsellers this Month ---
    {
      title: 'The Midnight Hour',
      author: 'James Adams',
      isbn: '978-0143450014',
      description: 'Haunting tale of a man’s journey & the shadows of a forgotten past.',
      price: 299,
      format: 'Paperback',
      tagText: 'Fiction, Thriller, Horror',
      catSlug: 'mystery',
      brandSlug: 'harpercollins',
      rating: 4.6,
      deliveryDateText: 'Delivery by Mon, 21 Jul',
      deliveryDays: 2,
      coverBgColor: '#0f172a',
      stockQuantity: 18
    },
    {
      title: 'Beneath the Stars',
      author: 'Jessica Martin',
      isbn: '978-0143450015',
      description: 'A heartwarming tale, where two souls discover who they need.',
      price: 499,
      format: 'Hard Cover',
      tagText: 'Fiction, Love, Drama',
      catSlug: 'romance',
      brandSlug: 'penguin-random-house',
      rating: 4.8,
      deliveryDateText: 'Delivery by Mon, 21 Jul',
      deliveryDays: 2,
      coverBgColor: '#7c3aed',
      stockQuantity: 22
    },
    {
      title: 'The Final Frontier',
      author: 'Laura Mitchell',
      isbn: '978-0143450016',
      description: 'A mission to space secrets to change humanity forever.',
      price: 359,
      format: 'Paperback',
      tagText: 'Fiction, Thriller',
      catSlug: 'science-fiction',
      brandSlug: 'oxford-university-press',
      rating: 4.7,
      deliveryDateText: 'Delivery by Mon, 21 Jul',
      deliveryDays: 2,
      coverBgColor: '#0369a1',
      stockQuantity: 15
    },

    // --- Section: New Launches ---
    {
      title: 'Joy of Minimalism',
      author: 'Daniel Reed',
      isbn: '978-0143450017',
      description: 'Declutter your life to uncover peace, clarity, and joy.',
      price: 149,
      format: 'Paperback',
      tagText: 'Non-fiction, Self Help',
      catSlug: 'self-help',
      brandSlug: 'penguin-random-house',
      rating: 4.9,
      deliveryDateText: 'Delivery by Mon, 21 Jul',
      deliveryDays: 2,
      coverBgColor: '#facc15',
      stockQuantity: 40
    },
    {
      title: 'The Vanishing House',
      author: 'Clara Nelson',
      isbn: '978-0143450018',
      description: 'A chilling mystery unfolds within a house that disappears.',
      price: 99,
      format: 'eBook',
      tagText: 'Fiction, Horror',
      catSlug: 'mystery',
      brandSlug: 'harpercollins',
      rating: 4.5,
      deliveryDateText: 'Delivery by Mon, 21 Jul',
      deliveryDays: 2,
      coverBgColor: '#1e293b',
      stockQuantity: 50
    },
    {
      title: 'The Lost Kitten',
      author: 'Emily Parker',
      isbn: '978-0143450019',
      description: 'A heartwarming tale of courage, friendship, and feline adventure.',
      price: 339,
      format: 'Hardcover',
      tagText: 'Fiction, Children',
      catSlug: 'childrens',
      brandSlug: 'penguin-random-house',
      rating: 4.9,
      deliveryDateText: 'Delivery by Mon, 21 Jul',
      deliveryDays: 2,
      coverBgColor: '#fb923c',
      stockQuantity: 35
    },

    // Additional popular catalogue books across genres
    {
      title: 'Clean Code: Handbook of Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      description: 'Even bad code can function. But if code isn’t clean, it brings organizations down.',
      price: 799,
      format: 'Paperback',
      tagText: 'Engineering, Technology',
      catSlug: 'science',
      brandSlug: 'oreilly-media',
      rating: 4.8,
      deliveryDateText: 'Delivery by Mon, 21 Jul',
      deliveryDays: 2,
      coverBgColor: '#2563eb',
      stockQuantity: 25
    },
    {
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      isbn: '978-1449373320',
      description: 'The definitive guide to distributed architectures and reliable storage.',
      price: 1299,
      format: 'Paperback',
      tagText: 'Architecture, Systems',
      catSlug: 'science',
      brandSlug: 'oreilly-media',
      rating: 4.9,
      deliveryDateText: 'Delivery by Mon, 21 Jul',
      deliveryDays: 2,
      coverBgColor: '#b91c1c',
      stockQuantity: 18
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      isbn: '978-0735211292',
      description: 'An easy and proven way to build good habits and break bad ones.',
      price: 499,
      format: 'Paperback',
      tagText: 'Non-fiction, Habits',
      catSlug: 'self-help',
      brandSlug: 'penguin-random-house',
      rating: 4.9,
      deliveryDateText: 'Delivery by Mon, 21 Jul',
      deliveryDays: 2,
      coverBgColor: '#059669',
      stockQuantity: 45
    },
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0451524935',
      description: 'The dystopian classic of totalitarian regime and forbidden love.',
      price: 299,
      format: 'Paperback',
      tagText: 'Fiction, Classics',
      catSlug: 'drama',
      brandSlug: 'oxford-university-press',
      rating: 4.7,
      deliveryDateText: 'Delivery by Mon, 21 Jul',
      deliveryDays: 2,
      coverBgColor: '#4b5563',
      stockQuantity: 30
    },
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0743273565',
      description: 'The golden age of jazz, mystery, and tragic longing in Long Island.',
      price: 249,
      format: 'Paperback',
      tagText: 'Romance, Classic',
      catSlug: 'romance',
      brandSlug: 'penguin-random-house',
      rating: 4.6,
      deliveryDateText: 'Delivery by Mon, 21 Jul',
      deliveryDays: 2,
      coverBgColor: '#1e1b4b',
      stockQuantity: 28
    },
    {
      title: 'Cosmos',
      author: 'Carl Sagan',
      isbn: '978-0345539434',
      description: 'The story of cosmic evolution, science, and human exploration.',
      price: 599,
      format: 'Hard Cover',
      tagText: 'Science, Astronomy',
      catSlug: 'science',
      brandSlug: 'penguin-random-house',
      rating: 4.9,
      deliveryDateText: 'Delivery by Mon, 21 Jul',
      deliveryDays: 2,
      coverBgColor: '#0f172a',
      stockQuantity: 20
    }
  ];

  const createdProducts = [];
  for (const b of booksData) {
    const category = categories[b.catSlug] || categories['self-help'];
    const brand = brands[b.brandSlug] || brands['penguin-random-house'];

    const prod = await prisma.product.create({
      data: {
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        description: b.description,
        price: b.price,
        format: b.format,
        tagText: b.tagText,
        deliveryDateText: b.deliveryDateText,
        deliveryDays: b.deliveryDays,
        coverBgColor: b.coverBgColor,
        rating: b.rating,
        stockQuantity: b.stockQuantity,
        categoryId: category.id,
        brandId: brand.id
      }
    });
    createdProducts.push(prod);
  }

  // 6. Seed Cart with "Joy of Minimalism" and "The Path to Success" for Demo User (matching UI Checkout image)
  const user1Cart = await prisma.cart.findUnique({ where: { userId: user1.id } });
  const joyMin = createdProducts.find(p => p.title.includes('Joy of Minimalism'));
  const pathSuccess = createdProducts.find(p => p.title.includes('Path to Success'));

  if (user1Cart && joyMin && pathSuccess) {
    await prisma.cartItem.create({
      data: {
        cartId: user1Cart.id,
        productId: joyMin.id,
        quantity: 1,
        unitPrice: joyMin.price
      }
    });
    await prisma.cartItem.create({
      data: {
        cartId: user1Cart.id,
        productId: pathSuccess.id,
        quantity: 1,
        unitPrice: pathSuccess.price
      }
    });
  }

  // 7. Seed Relations for recommendations
  const artFocus = createdProducts.find(p => p.title.includes('Art of Focus'));
  const artLearning = createdProducts.find(p => p.title.includes('Art of Learning'));

  if (artFocus && artLearning) {
    await prisma.productRelation.create({
      data: {
        productId: artFocus.id,
        relatedProductId: artLearning.id,
        relationType: 'SIMILAR'
      }
    });
  }

  console.log(`--- Seeding Completed! Seeded ${createdProducts.length} books and ${Object.keys(categories).length} categories. ---`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
