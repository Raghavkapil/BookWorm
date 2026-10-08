const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Book Worm Database ---');

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

  // 1. Categories
  const categoriesList = [
    { name: 'Romance',                slug: 'romance',          description: 'Romantic novels and love stories' },
    { name: 'Mystery',                slug: 'mystery',          description: 'Crime thrillers and investigative whodunits' },
    { name: 'Science Fiction',        slug: 'science-fiction',  description: 'Futuristic and cosmic adventures' },
    { name: 'Fantasy',                slug: 'fantasy',          description: 'Mythical realms, magic, and epic sagas' },
    { name: 'Historical',             slug: 'historical',       description: 'Historical fiction and period dramas' },
    { name: 'Biography',              slug: 'biography',        description: 'Life stories of inspiring personalities' },
    { name: 'Self-help',              slug: 'self-help',        description: 'Habits, productivity, and mindfulness' },
    { name: 'Memoir',                 slug: 'memoir',           description: 'Personal reflections and autobiographies' },
    { name: 'Travel',                 slug: 'travel',           description: 'Wanderlust journeys, cultures, and guides' },
    { name: 'Cooking',                slug: 'cooking',          description: 'Culinary arts, recipes, and gastronomy' },
    { name: "Children's",             slug: 'childrens',        description: 'Stories, fairy tales, and illustrated books' },
    { name: 'Young Adult',            slug: 'young-adult',      description: 'Coming-of-age fiction and teen adventures' },
    { name: 'Comics & Graphic Novels',slug: 'comics',           description: 'Illustrated narratives and graphic epics' },
    { name: 'Poetry',                 slug: 'poetry',           description: 'Lyrical verses and anthologies' },
    { name: 'Drama',                  slug: 'drama',            description: 'Plays, theatrical scripts, and dramatic fiction' },
    { name: 'Science',                slug: 'science',          description: 'Physics, biology, astronomy, and cosmology' },
    { name: 'Philosophy',             slug: 'philosophy',       description: 'Classic and modern philosophical thought' },
    { name: 'Religion',               slug: 'religion',         description: 'Spiritual guides and religious philosophy' },
    { name: 'Language Learning',      slug: 'language-learning',description: 'Grammar, linguistics, and fluency' }
  ];

  const categories = {};
  for (const cat of categoriesList) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }

  // 2. Publishers / Brands
  const brandsList = [
    { name: 'Penguin Random House', slug: 'penguin-random-house', description: 'World premier trade book publisher' },
    { name: 'HarperCollins',        slug: 'harpercollins',        description: 'Leading global publisher of timeless literature' },
    { name: "O'Reilly Media",       slug: 'oreilly-media',        description: 'Pioneering technology and engineering books' },
    { name: 'Oxford University Press', slug: 'oxford-university-press', description: 'World-renowned academic press' },
    { name: 'Simon & Schuster',     slug: 'simon-schuster',       description: 'Award-winning publisher of fiction and non-fiction' },
    { name: 'Bloomsbury',           slug: 'bloomsbury',           description: 'Independent publisher of literary fiction and non-fiction' },
    { name: 'Macmillan Publishers', slug: 'macmillan',            description: 'Global publisher across trade and academic titles' }
  ];

  const brands = {};
  for (const b of brandsList) {
    const created = await prisma.brand.create({ data: b });
    brands[b.slug] = created;
  }

  // 3. Demo Users
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

  await prisma.user.create({
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

  await prisma.giftPointsTransaction.create({
    data: { userId: user1.id, transactionType: 'CREDIT', points: 500, referenceId: 'WELCOME_BONUS' }
  });

  // 4. Saved Address
  await prisma.address.create({
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

  // 5. Books — real titles, verified ISBNs, all 19 categories covered
  //    Ordered so first 9 fill the 3 homepage sections neatly:
  //    [0-2]  Recommended for You
  //    [3-5]  Bestsellers this Month
  //    [6-8]  New Launches
  //    [9+]   Explore More Reads
  const booksData = [

    // ── RECOMMENDED FOR YOU (self-help, science-fiction, mystery) ──────────────
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      isbn: '978-0735211292',
      description: 'An easy and proven way to build good habits and break bad ones. James Clear distils the most fundamental information about habit formation.',
      price: 499,
      format: 'Paperback',
      tagText: 'Non-fiction, Self Help',
      catSlug: 'self-help',
      brandSlug: 'penguin-random-house',
      rating: 4.9,
      deliveryDays: 2,
      coverBgColor: '#059669',
      stockQuantity: 60
    },
    {
      title: 'The Hitchhiker\'s Guide to the Galaxy',
      author: 'Douglas Adams',
      isbn: '978-0345391803',
      description: 'Seconds before the Earth is demolished for a hyperspace bypass, Arthur Dent is whisked off the planet by his friend Ford Prefect.',
      price: 349,
      format: 'Paperback',
      tagText: 'Fiction, Science Fiction, Comedy',
      catSlug: 'science-fiction',
      brandSlug: 'penguin-random-house',
      rating: 4.8,
      deliveryDays: 2,
      coverBgColor: '#0284c7',
      stockQuantity: 45
    },
    {
      title: 'Gone Girl',
      author: 'Gillian Flynn',
      isbn: '978-0307588371',
      description: 'On a warm summer morning in North Carthage, Missouri, it is Nick and Amy Dunne\'s fifth wedding anniversary. The morning of their anniversary, Amy disappears.',
      price: 399,
      format: 'Paperback',
      tagText: 'Fiction, Mystery, Thriller',
      catSlug: 'mystery',
      brandSlug: 'penguin-random-house',
      rating: 4.5,
      deliveryDays: 3,
      coverBgColor: '#1e293b',
      stockQuantity: 35
    },

    // ── BESTSELLERS THIS MONTH (romance, fantasy, biography) ─────────────────
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      isbn: '978-0141439518',
      description: 'The story of the Bennet family and their five unmarried daughters, centering on the spirited Elizabeth and the proud Mr. Darcy.',
      price: 299,
      format: 'Paperback',
      tagText: 'Fiction, Romance, Classic',
      catSlug: 'romance',
      brandSlug: 'penguin-random-house',
      rating: 4.8,
      deliveryDays: 2,
      coverBgColor: '#be185d',
      stockQuantity: 50
    },
    {
      title: 'The Name of the Wind',
      author: 'Patrick Rothfuss',
      isbn: '978-0756404741',
      description: 'The riveting first-person narrative of Kvothe, a magically gifted young man who grows to be the most notorious wizard his world has ever seen.',
      price: 549,
      format: 'Paperback',
      tagText: 'Fiction, Fantasy, Adventure',
      catSlug: 'fantasy',
      brandSlug: 'penguin-random-house',
      rating: 4.8,
      deliveryDays: 2,
      coverBgColor: '#7c3aed',
      stockQuantity: 30
    },
    {
      title: 'Steve Jobs',
      author: 'Walter Isaacson',
      isbn: '978-1451648539',
      description: 'Based on more than forty interviews with Jobs conducted over two years, this is the authorised biography of Apple\'s co-founder.',
      price: 699,
      format: 'Hard Cover',
      tagText: 'Non-fiction, Biography, Technology',
      catSlug: 'biography',
      brandSlug: 'simon-schuster',
      rating: 4.7,
      deliveryDays: 3,
      coverBgColor: '#374151',
      stockQuantity: 25
    },

    // ── NEW LAUNCHES (drama, cooking, young-adult) ────────────────────────────
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0451524935',
      description: 'The dystopian classic of totalitarian surveillance and thoughtcrime — as chilling today as when it was first published.',
      price: 299,
      format: 'Paperback',
      tagText: 'Fiction, Dystopia, Classics',
      catSlug: 'drama',
      brandSlug: 'oxford-university-press',
      rating: 4.7,
      deliveryDays: 2,
      coverBgColor: '#4b5563',
      stockQuantity: 40
    },
    {
      title: 'Salt, Fat, Acid, Heat',
      author: 'Samin Nosrat',
      isbn: '978-1476753836',
      description: 'A New York Times bestseller teaching the four essential elements of good cooking, illustrated with vivid drawings throughout.',
      price: 899,
      format: 'Hard Cover',
      tagText: 'Non-fiction, Cooking, Food',
      catSlug: 'cooking',
      brandSlug: 'simon-schuster',
      rating: 4.8,
      deliveryDays: 3,
      coverBgColor: '#d97706',
      stockQuantity: 20
    },
    {
      title: 'The Hunger Games',
      author: 'Suzanne Collins',
      isbn: '978-0439023481',
      description: 'In a dark vision of the future, a terrifying reality TV show pits twenty-four teenagers against each other in a fight to the death.',
      price: 399,
      format: 'Paperback',
      tagText: 'Fiction, Young Adult, Dystopia',
      catSlug: 'young-adult',
      brandSlug: 'bloomsbury',
      rating: 4.7,
      deliveryDays: 2,
      coverBgColor: '#dc2626',
      stockQuantity: 50
    },

    // ── EXPLORE MORE READS ────────────────────────────────────────────────────

    // Self-help
    {
      title: 'Deep Work',
      author: 'Cal Newport',
      isbn: '978-1455586691',
      description: 'Rules for focused success in a distracted world, arguing that the ability to perform deep work is becoming increasingly rare and valuable.',
      price: 449,
      format: 'Paperback',
      tagText: 'Non-fiction, Productivity, Self Help',
      catSlug: 'self-help',
      brandSlug: 'harpercollins',
      rating: 4.7,
      deliveryDays: 2,
      coverBgColor: '#1e3a5f',
      stockQuantity: 35
    },
    {
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      isbn: '978-0374533557',
      description: 'Nobel laureate Daniel Kahneman reveals the two systems that drive the way we think and make choices — fast, intuitive thinking and slow, deliberate thinking.',
      price: 599,
      format: 'Paperback',
      tagText: 'Non-fiction, Psychology, Self Help',
      catSlug: 'self-help',
      brandSlug: 'penguin-random-house',
      rating: 4.6,
      deliveryDays: 2,
      coverBgColor: '#0f4c81',
      stockQuantity: 28
    },
    {
      title: 'The 7 Habits of Highly Effective People',
      author: 'Stephen R. Covey',
      isbn: '978-1982137274',
      description: 'A holistic, integrated, principle-centred approach for solving personal and professional problems, sold over 40 million copies worldwide.',
      price: 499,
      format: 'Paperback',
      tagText: 'Non-fiction, Leadership, Self Help',
      catSlug: 'self-help',
      brandSlug: 'simon-schuster',
      rating: 4.6,
      deliveryDays: 2,
      coverBgColor: '#1d4ed8',
      stockQuantity: 30
    },

    // Mystery / Thriller
    {
      title: 'The Girl with the Dragon Tattoo',
      author: 'Stieg Larsson',
      isbn: '978-0307454546',
      description: 'A financial journalist and a young computer hacker partner to investigate the forty-year-old disappearance of a wealthy patriarch\'s niece.',
      price: 449,
      format: 'Paperback',
      tagText: 'Fiction, Mystery, Thriller',
      catSlug: 'mystery',
      brandSlug: 'penguin-random-house',
      rating: 4.6,
      deliveryDays: 2,
      coverBgColor: '#0f172a',
      stockQuantity: 25
    },
    {
      title: 'And Then There Were None',
      author: 'Agatha Christie',
      isbn: '978-0062073488',
      description: 'Ten strangers are lured to an isolated island mansion off the Devon coast. One by one they begin to die.',
      price: 279,
      format: 'Paperback',
      tagText: 'Fiction, Mystery, Classic',
      catSlug: 'mystery',
      brandSlug: 'harpercollins',
      rating: 4.7,
      deliveryDays: 2,
      coverBgColor: '#1c1917',
      stockQuantity: 40
    },

    // Science Fiction
    {
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '978-0441013593',
      description: 'Set in the distant future amidst a feudal interstellar society, it tells the story of young Paul Atreides on the desert planet Arrakis.',
      price: 649,
      format: 'Paperback',
      tagText: 'Fiction, Science Fiction, Epic',
      catSlug: 'science-fiction',
      brandSlug: 'penguin-random-house',
      rating: 4.8,
      deliveryDays: 3,
      coverBgColor: '#92400e',
      stockQuantity: 30
    },
    {
      title: 'Ender\'s Game',
      author: 'Orson Scott Card',
      isbn: '978-0812550702',
      description: 'In order to develop a secure defence against a hostile alien race, government agencies breed child geniuses and train them as soldiers.',
      price: 399,
      format: 'Paperback',
      tagText: 'Fiction, Science Fiction, Adventure',
      catSlug: 'science-fiction',
      brandSlug: 'macmillan',
      rating: 4.7,
      deliveryDays: 2,
      coverBgColor: '#0c4a6e',
      stockQuantity: 22
    },
    {
      title: 'The Martian',
      author: 'Andy Weir',
      isbn: '978-0804139021',
      description: 'An astronaut stranded alone on Mars must use his ingenuity to survive while NASA and the world work to bring him home.',
      price: 449,
      format: 'Paperback',
      tagText: 'Fiction, Science Fiction, Survival',
      catSlug: 'science-fiction',
      brandSlug: 'penguin-random-house',
      rating: 4.8,
      deliveryDays: 2,
      coverBgColor: '#b45309',
      stockQuantity: 35
    },

    // Fantasy
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      isbn: '978-0547928227',
      description: 'Bilbo Baggins, a hobbit who enjoys a comfortable, unadventurous life, is swept into an epic quest to reclaim the dwarf kingdom of Erebor.',
      price: 399,
      format: 'Paperback',
      tagText: 'Fiction, Fantasy, Adventure',
      catSlug: 'fantasy',
      brandSlug: 'harpercollins',
      rating: 4.9,
      deliveryDays: 2,
      coverBgColor: '#065f46',
      stockQuantity: 45
    },
    {
      title: 'Harry Potter and the Philosopher\'s Stone',
      author: 'J.K. Rowling',
      isbn: '978-0439708180',
      description: 'Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat of number four, Privet Drive.',
      price: 499,
      format: 'Paperback',
      tagText: 'Fiction, Fantasy, Magic',
      catSlug: 'fantasy',
      brandSlug: 'bloomsbury',
      rating: 4.9,
      deliveryDays: 2,
      coverBgColor: '#7c2d12',
      stockQuantity: 60
    },
    {
      title: 'A Game of Thrones',
      author: 'George R.R. Martin',
      isbn: '978-0553593716',
      description: 'In the grip of a generation-long winter, noble families fight for the Iron Throne while an ancient evil awakens beyond the Wall.',
      price: 699,
      format: 'Paperback',
      tagText: 'Fiction, Fantasy, Epic',
      catSlug: 'fantasy',
      brandSlug: 'penguin-random-house',
      rating: 4.8,
      deliveryDays: 3,
      coverBgColor: '#1a1a2e',
      stockQuantity: 30
    },

    // Historical Fiction
    {
      title: 'The Pillars of the Earth',
      author: 'Ken Follett',
      isbn: '978-0451166890',
      description: 'Set in 12th-century England, this epic tale follows the building of a cathedral and the lives intertwined with it across generations.',
      price: 749,
      format: 'Paperback',
      tagText: 'Fiction, Historical, Epic',
      catSlug: 'historical',
      brandSlug: 'penguin-random-house',
      rating: 4.8,
      deliveryDays: 3,
      coverBgColor: '#78350f',
      stockQuantity: 20
    },
    {
      title: 'All the Light We Cannot See',
      author: 'Anthony Doerr',
      isbn: '978-1476746586',
      description: 'A blind French girl and a German boy\'s paths collide in occupied France as both try to survive the devastation of World War II.',
      price: 549,
      format: 'Paperback',
      tagText: 'Fiction, Historical, War',
      catSlug: 'historical',
      brandSlug: 'simon-schuster',
      rating: 4.8,
      deliveryDays: 2,
      coverBgColor: '#1e3a5f',
      stockQuantity: 25
    },
    {
      title: 'The Kite Runner',
      author: 'Khaled Hosseini',
      isbn: '978-1594631931',
      description: 'The story of two boys growing up in Afghanistan — one the son of a wealthy man, the other the son of his servant — and their friendship that is shattered by a traumatic event.',
      price: 399,
      format: 'Paperback',
      tagText: 'Fiction, Historical, Drama',
      catSlug: 'historical',
      brandSlug: 'penguin-random-house',
      rating: 4.7,
      deliveryDays: 2,
      coverBgColor: '#b45309',
      stockQuantity: 30
    },

    // Biography
    {
      title: 'The Diary of a Young Girl',
      author: 'Anne Frank',
      isbn: '978-0553296983',
      description: 'Anne Frank\'s own account of hiding with her family in Nazi-occupied Amsterdam for two years during World War II.',
      price: 299,
      format: 'Paperback',
      tagText: 'Non-fiction, Biography, History',
      catSlug: 'biography',
      brandSlug: 'penguin-random-house',
      rating: 4.8,
      deliveryDays: 2,
      coverBgColor: '#854d0e',
      stockQuantity: 35
    },
    {
      title: 'Long Walk to Freedom',
      author: 'Nelson Mandela',
      isbn: '978-0316548182',
      description: 'Nelson Mandela\'s autobiography narrating his childhood, his years as a freedom fighter, and his 27 years in prison, to his eventual presidency.',
      price: 599,
      format: 'Paperback',
      tagText: 'Non-fiction, Biography, Politics',
      catSlug: 'biography',
      brandSlug: 'harpercollins',
      rating: 4.9,
      deliveryDays: 3,
      coverBgColor: '#166534',
      stockQuantity: 20
    },
    {
      title: 'Elon Musk',
      author: 'Walter Isaacson',
      isbn: '978-1982181284',
      description: 'The story of a man who aspires to save our planet and colonise Mars, electrify the car industry and put AI to work for humanity.',
      price: 849,
      format: 'Hard Cover',
      tagText: 'Non-fiction, Biography, Technology',
      catSlug: 'biography',
      brandSlug: 'simon-schuster',
      rating: 4.5,
      deliveryDays: 3,
      coverBgColor: '#0f172a',
      stockQuantity: 22
    },

    // Memoir
    {
      title: 'Educated',
      author: 'Tara Westover',
      isbn: '978-0399590504',
      description: 'A memoir about a young girl who, kept out of school, grows up in the mountains of Idaho and goes on to earn a PhD from Cambridge University.',
      price: 499,
      format: 'Paperback',
      tagText: 'Non-fiction, Memoir, Education',
      catSlug: 'memoir',
      brandSlug: 'penguin-random-house',
      rating: 4.8,
      deliveryDays: 2,
      coverBgColor: '#a16207',
      stockQuantity: 28
    },
    {
      title: 'Becoming',
      author: 'Michelle Obama',
      isbn: '978-1524763138',
      description: 'In her memoir, the former First Lady of the United States invites readers into her world, chronicling the experiences that have shaped her.',
      price: 699,
      format: 'Hard Cover',
      tagText: 'Non-fiction, Memoir, Inspiration',
      catSlug: 'memoir',
      brandSlug: 'penguin-random-house',
      rating: 4.8,
      deliveryDays: 2,
      coverBgColor: '#be185d',
      stockQuantity: 30
    },
    {
      title: 'The Glass Castle',
      author: 'Jeannette Walls',
      isbn: '978-0743247542',
      description: 'A remarkable memoir of resilience and redemption, and a revelatory look into a family at once deeply dysfunctional and uniquely vibrant.',
      price: 399,
      format: 'Paperback',
      tagText: 'Non-fiction, Memoir, Family',
      catSlug: 'memoir',
      brandSlug: 'simon-schuster',
      rating: 4.6,
      deliveryDays: 2,
      coverBgColor: '#44403c',
      stockQuantity: 22
    },

    // Travel
    {
      title: 'Eat, Pray, Love',
      author: 'Elizabeth Gilbert',
      isbn: '978-0143038412',
      description: 'A divorced woman\'s year-long journey through Italy, India and Indonesia in search of pleasure, devotion, and a balance between the two.',
      price: 449,
      format: 'Paperback',
      tagText: 'Non-fiction, Travel, Memoir',
      catSlug: 'travel',
      brandSlug: 'penguin-random-house',
      rating: 4.4,
      deliveryDays: 2,
      coverBgColor: '#0369a1',
      stockQuantity: 25
    },
    {
      title: 'In Patagonia',
      author: 'Bruce Chatwin',
      isbn: '978-0099769712',
      description: 'A classic of travel literature recounting Chatwin\'s journey through the remote wilds of southern Argentina and Chile.',
      price: 349,
      format: 'Paperback',
      tagText: 'Non-fiction, Travel, Adventure',
      catSlug: 'travel',
      brandSlug: 'penguin-random-house',
      rating: 4.4,
      deliveryDays: 3,
      coverBgColor: '#1d4ed8',
      stockQuantity: 18
    },
    {
      title: 'Wild',
      author: 'Cheryl Strayed',
      isbn: '978-0307476074',
      description: 'A woman hikes over 1,100 miles of the Pacific Crest Trail alone to find healing after devastating loss, with no hiking experience.',
      price: 399,
      format: 'Paperback',
      tagText: 'Non-fiction, Travel, Nature',
      catSlug: 'travel',
      brandSlug: 'penguin-random-house',
      rating: 4.5,
      deliveryDays: 2,
      coverBgColor: '#166534',
      stockQuantity: 20
    },

    // Cooking
    {
      title: 'Jerusalem',
      author: 'Yotam Ottolenghi',
      isbn: '978-1607743941',
      description: 'A collection of 120 recipes from the city of Jerusalem, blending the culinary traditions of Jewish and Arab cuisines.',
      price: 1099,
      format: 'Hard Cover',
      tagText: 'Non-fiction, Cooking, Culture',
      catSlug: 'cooking',
      brandSlug: 'penguin-random-house',
      rating: 4.8,
      deliveryDays: 3,
      coverBgColor: '#92400e',
      stockQuantity: 15
    },
    {
      title: 'Mastering the Art of French Cooking',
      author: 'Julia Child',
      isbn: '978-0375413407',
      description: 'Julia Child\'s landmark cookbook translating classic French cuisine into approachable recipes for the American home cook.',
      price: 1299,
      format: 'Hard Cover',
      tagText: 'Non-fiction, Cooking, French Cuisine',
      catSlug: 'cooking',
      brandSlug: 'penguin-random-house',
      rating: 4.9,
      deliveryDays: 3,
      coverBgColor: '#b91c1c',
      stockQuantity: 12
    },
    {
      title: 'The Food Lab',
      author: 'J. Kenji López-Alt',
      isbn: '978-0393081084',
      description: 'A deep dive into the science of everyday cooking, with over 1,000 meticulously tested recipes accompanied by scientific explanations.',
      price: 1499,
      format: 'Hard Cover',
      tagText: 'Non-fiction, Cooking, Science',
      catSlug: 'cooking',
      brandSlug: 'macmillan',
      rating: 4.9,
      deliveryDays: 4,
      coverBgColor: '#dc2626',
      stockQuantity: 10
    },

    // Children's
    {
      title: 'Charlotte\'s Web',
      author: 'E.B. White',
      isbn: '978-0061124952',
      description: 'A tender story of the friendship between a pig named Wilbur and a spider named Charlotte, and Charlotte\'s determination to save her friend\'s life.',
      price: 249,
      format: 'Paperback',
      tagText: 'Fiction, Children, Friendship',
      catSlug: 'childrens',
      brandSlug: 'harpercollins',
      rating: 4.8,
      deliveryDays: 2,
      coverBgColor: '#d97706',
      stockQuantity: 40
    },
    {
      title: 'Where the Wild Things Are',
      author: 'Maurice Sendak',
      isbn: '978-0064431781',
      description: 'Young Max is sent to bed without supper and imagines sailing away to the land of the wild things, where he becomes king.',
      price: 299,
      format: 'Hard Cover',
      tagText: 'Fiction, Children, Picture Book',
      catSlug: 'childrens',
      brandSlug: 'harpercollins',
      rating: 4.7,
      deliveryDays: 2,
      coverBgColor: '#7c3aed',
      stockQuantity: 30
    },
    {
      title: 'Matilda',
      author: 'Roald Dahl',
      isbn: '978-0140328721',
      description: 'Matilda is a little girl who is so exceptional and so brave. But her parents think she\'s nothing but a nuisance — until she discovers she has a mysterious power.',
      price: 279,
      format: 'Paperback',
      tagText: 'Fiction, Children, Magic',
      catSlug: 'childrens',
      brandSlug: 'penguin-random-house',
      rating: 4.9,
      deliveryDays: 2,
      coverBgColor: '#059669',
      stockQuantity: 45
    },

    // Young Adult
    {
      title: 'The Fault in Our Stars',
      author: 'John Green',
      isbn: '978-0525478812',
      description: 'Two teenagers with cancer meet at a support group and fall in love, embarking on a journey to meet their favourite author in Amsterdam.',
      price: 349,
      format: 'Paperback',
      tagText: 'Fiction, Young Adult, Romance',
      catSlug: 'young-adult',
      brandSlug: 'penguin-random-house',
      rating: 4.6,
      deliveryDays: 2,
      coverBgColor: '#0369a1',
      stockQuantity: 35
    },
    {
      title: 'Divergent',
      author: 'Veronica Roth',
      isbn: '978-0062024039',
      description: 'In a future Chicago divided into factions, sixteen-year-old Beatrice Prior discovers she is Divergent — and cannot fit into any one group.',
      price: 349,
      format: 'Paperback',
      tagText: 'Fiction, Young Adult, Dystopia',
      catSlug: 'young-adult',
      brandSlug: 'harpercollins',
      rating: 4.5,
      deliveryDays: 2,
      coverBgColor: '#374151',
      stockQuantity: 30
    },

    // Comics & Graphic Novels
    {
      title: 'Maus',
      author: 'Art Spiegelman',
      isbn: '978-0679748403',
      description: 'Pulitzer Prize-winning graphic novel in which the author interviews his father about surviving the Holocaust, depicted with Jews as mice and Nazis as cats.',
      price: 799,
      format: 'Paperback',
      tagText: 'Non-fiction, Graphic Novel, History',
      catSlug: 'comics',
      brandSlug: 'penguin-random-house',
      rating: 4.9,
      deliveryDays: 3,
      coverBgColor: '#1c1917',
      stockQuantity: 18
    },
    {
      title: 'Watchmen',
      author: 'Alan Moore',
      isbn: '978-1401245252',
      description: 'Set in an alternate 1985 America, retired superheroes investigate the murder of a colleague while the world teeters on the brink of nuclear war.',
      price: 899,
      format: 'Paperback',
      tagText: 'Fiction, Graphic Novel, Superhero',
      catSlug: 'comics',
      brandSlug: 'penguin-random-house',
      rating: 4.8,
      deliveryDays: 3,
      coverBgColor: '#0f172a',
      stockQuantity: 20
    },
    {
      title: 'Persepolis',
      author: 'Marjane Satrapi',
      isbn: '978-0375714573',
      description: 'A memoir in graphic novel form of growing up in Iran during the Islamic Revolution, told with a child\'s disarming innocence.',
      price: 699,
      format: 'Paperback',
      tagText: 'Non-fiction, Graphic Novel, Memoir',
      catSlug: 'comics',
      brandSlug: 'penguin-random-house',
      rating: 4.7,
      deliveryDays: 2,
      coverBgColor: '#111827',
      stockQuantity: 22
    },

    // Poetry
    {
      title: 'The Waste Land',
      author: 'T.S. Eliot',
      isbn: '978-0393310184',
      description: 'One of the most influential poems of the 20th century, a landmark of modernist poetry exploring fragmentation, decay, and spiritual rebirth.',
      price: 249,
      format: 'Paperback',
      tagText: 'Poetry, Modernism, Classic',
      catSlug: 'poetry',
      brandSlug: 'macmillan',
      rating: 4.5,
      deliveryDays: 2,
      coverBgColor: '#4b5563',
      stockQuantity: 20
    },
    {
      title: 'Milk and Honey',
      author: 'Rupi Kaur',
      isbn: '978-1449474256',
      description: 'A collection of poetry and prose about survival through abuse, love, loss, and femininity, divided into four chapters.',
      price: 349,
      format: 'Paperback',
      tagText: 'Poetry, Contemporary, Feminist',
      catSlug: 'poetry',
      brandSlug: 'simon-schuster',
      rating: 4.5,
      deliveryDays: 2,
      coverBgColor: '#f8fafc',
      stockQuantity: 35
    },
    {
      title: 'Leaves of Grass',
      author: 'Walt Whitman',
      isbn: '978-0140421996',
      description: 'Whitman\'s constantly revised and expanded collection of poems celebrating democracy, nature, love, and friendship, first published in 1855.',
      price: 299,
      format: 'Paperback',
      tagText: 'Poetry, American Literature, Classic',
      catSlug: 'poetry',
      brandSlug: 'penguin-random-house',
      rating: 4.6,
      deliveryDays: 2,
      coverBgColor: '#166534',
      stockQuantity: 18
    },

    // Drama
    {
      title: 'Hamlet',
      author: 'William Shakespeare',
      isbn: '978-0521618748',
      description: 'Prince Hamlet of Denmark is tasked by his father\'s ghost to avenge his murder by his uncle Claudius, who has seized the throne and married his mother.',
      price: 199,
      format: 'Paperback',
      tagText: 'Drama, Classic, Shakespeare',
      catSlug: 'drama',
      brandSlug: 'oxford-university-press',
      rating: 4.7,
      deliveryDays: 2,
      coverBgColor: '#1e293b',
      stockQuantity: 30
    },
    {
      title: 'Death of a Salesman',
      author: 'Arthur Miller',
      isbn: '978-0143124245',
      description: 'Willy Loman, an ageing travelling salesman, struggles with failure and the American Dream as he faces the twilight of his career.',
      price: 229,
      format: 'Paperback',
      tagText: 'Drama, American Literature, Classic',
      catSlug: 'drama',
      brandSlug: 'penguin-random-house',
      rating: 4.5,
      deliveryDays: 2,
      coverBgColor: '#374151',
      stockQuantity: 25
    },

    // Science
    {
      title: 'Cosmos',
      author: 'Carl Sagan',
      isbn: '978-0345539434',
      description: 'The story of fifteen billion years of cosmic evolution, combining science, philosophy, and culture in one sweeping narrative.',
      price: 599,
      format: 'Hard Cover',
      tagText: 'Non-fiction, Science, Astronomy',
      catSlug: 'science',
      brandSlug: 'penguin-random-house',
      rating: 4.9,
      deliveryDays: 2,
      coverBgColor: '#0f172a',
      stockQuantity: 20
    },
    {
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      isbn: '978-0553380163',
      description: 'Hawking\'s landmark work on cosmology, explaining concepts from the Big Bang and black holes to the nature of time and the possibility of a unified theory.',
      price: 399,
      format: 'Paperback',
      tagText: 'Non-fiction, Science, Physics',
      catSlug: 'science',
      brandSlug: 'bloomsbury',
      rating: 4.7,
      deliveryDays: 2,
      coverBgColor: '#1e1b4b',
      stockQuantity: 30
    },
    {
      title: 'The Selfish Gene',
      author: 'Richard Dawkins',
      isbn: '978-0198788607',
      description: 'Richard Dawkins\' revolutionary work on evolution and natural selection, introducing the concept of the gene-centred view of evolution.',
      price: 449,
      format: 'Paperback',
      tagText: 'Non-fiction, Science, Biology',
      catSlug: 'science',
      brandSlug: 'oxford-university-press',
      rating: 4.6,
      deliveryDays: 2,
      coverBgColor: '#065f46',
      stockQuantity: 22
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      description: 'A handbook of agile software craftsmanship that shows how to write clean, readable, and maintainable code.',
      price: 799,
      format: 'Paperback',
      tagText: 'Non-fiction, Engineering, Technology',
      catSlug: 'science',
      brandSlug: 'oreilly-media',
      rating: 4.8,
      deliveryDays: 2,
      coverBgColor: '#2563eb',
      stockQuantity: 25
    },

    // Philosophy
    {
      title: 'Meditations',
      author: 'Marcus Aurelius',
      isbn: '978-0140449334',
      description: 'The private writings of Emperor Marcus Aurelius — a series of spiritual exercises filled with wisdom, stoic philosophy, and self-reflection.',
      price: 299,
      format: 'Paperback',
      tagText: 'Philosophy, Stoicism, Classic',
      catSlug: 'philosophy',
      brandSlug: 'penguin-random-house',
      rating: 4.9,
      deliveryDays: 2,
      coverBgColor: '#78350f',
      stockQuantity: 35
    },
    {
      title: 'Sophie\'s World',
      author: 'Jostein Gaarder',
      isbn: '978-0374530716',
      description: 'A young girl finds two notes asking "Who are you?" and "Where does the world come from?" — beginning a philosophical journey through Western thought.',
      price: 449,
      format: 'Paperback',
      tagText: 'Philosophy, Fiction, Education',
      catSlug: 'philosophy',
      brandSlug: 'macmillan',
      rating: 4.6,
      deliveryDays: 2,
      coverBgColor: '#1e3a5f',
      stockQuantity: 25
    },
    {
      title: 'Man\'s Search for Meaning',
      author: 'Viktor E. Frankl',
      isbn: '978-0807014271',
      description: 'Psychiatrist Viktor Frankl\'s memoir of surviving Nazi death camps and his discovery of logotherapy — finding meaning in life even in suffering.',
      price: 299,
      format: 'Paperback',
      tagText: 'Philosophy, Memoir, Psychology',
      catSlug: 'philosophy',
      brandSlug: 'bloomsbury',
      rating: 4.9,
      deliveryDays: 2,
      coverBgColor: '#4b5563',
      stockQuantity: 40
    },

    // Religion
    {
      title: 'The Power of Now',
      author: 'Eckhart Tolle',
      isbn: '978-1577314806',
      description: 'A guide to spiritual enlightenment, emphasising the importance of living in the present moment rather than dwelling on the past or future.',
      price: 349,
      format: 'Paperback',
      tagText: 'Religion, Spirituality, Self Help',
      catSlug: 'religion',
      brandSlug: 'macmillan',
      rating: 4.6,
      deliveryDays: 2,
      coverBgColor: '#d97706',
      stockQuantity: 30
    },
    {
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      isbn: '978-0062315007',
      description: 'A philosophical novel about an Andalusian shepherd boy named Santiago who travels from his homeland in Spain to Egypt in search of treasure.',
      price: 299,
      format: 'Paperback',
      tagText: 'Fiction, Spirituality, Adventure',
      catSlug: 'religion',
      brandSlug: 'harpercollins',
      rating: 4.7,
      deliveryDays: 2,
      coverBgColor: '#d97706',
      stockQuantity: 50
    },
    {
      title: 'Siddhartha',
      author: 'Hermann Hesse',
      isbn: '978-0553208849',
      description: 'The spiritual journey of self-discovery of a man named Siddhartha during the time of Gautama Buddha in ancient Nepal and India.',
      price: 249,
      format: 'Paperback',
      tagText: 'Fiction, Spirituality, Philosophy',
      catSlug: 'religion',
      brandSlug: 'bloomsbury',
      rating: 4.7,
      deliveryDays: 2,
      coverBgColor: '#92400e',
      stockQuantity: 28
    },

    // Language Learning
    {
      title: 'Fluent in 3 Months',
      author: 'Benny Lewis',
      isbn: '978-0062282699',
      description: 'How anyone at any age can learn to speak any language from anywhere in the world in 3 months using unconventional techniques.',
      price: 399,
      format: 'Paperback',
      tagText: 'Non-fiction, Language, Education',
      catSlug: 'language-learning',
      brandSlug: 'harpercollins',
      rating: 4.2,
      deliveryDays: 2,
      coverBgColor: '#0284c7',
      stockQuantity: 20
    },
    {
      title: 'The Story of Human Language',
      author: 'John McWhorter',
      isbn: '978-1598033816',
      description: 'An engaging overview of how human language works, how it changes, and how the thousands of languages in the world are related.',
      price: 449,
      format: 'Paperback',
      tagText: 'Non-fiction, Linguistics, Education',
      catSlug: 'language-learning',
      brandSlug: 'macmillan',
      rating: 4.5,
      deliveryDays: 3,
      coverBgColor: '#1d4ed8',
      stockQuantity: 15
    },
    {
      title: 'Word Power Made Easy',
      author: 'Norman Lewis',
      isbn: '978-1501171444',
      description: 'The classic vocabulary-building programme that has sold over one million copies, teaching over 3,000 words through a structured, proven system.',
      price: 299,
      format: 'Paperback',
      tagText: 'Non-fiction, Vocabulary, Education',
      catSlug: 'language-learning',
      brandSlug: 'simon-schuster',
      rating: 4.7,
      deliveryDays: 2,
      coverBgColor: '#065f46',
      stockQuantity: 40
    },

    // Romance (additional)
    {
      title: 'Me Before You',
      author: 'Jojo Moyes',
      isbn: '978-0143124542',
      description: 'Louisa Clark takes a job as caregiver to Will Traynor, a young banker paralysed in an accident, and an unlikely relationship develops.',
      price: 349,
      format: 'Paperback',
      tagText: 'Fiction, Romance, Drama',
      catSlug: 'romance',
      brandSlug: 'penguin-random-house',
      rating: 4.5,
      deliveryDays: 2,
      coverBgColor: '#be185d',
      stockQuantity: 28
    },
    {
      title: 'Outlander',
      author: 'Diana Gabaldon',
      isbn: '978-0440212560',
      description: 'A WWII combat nurse is hurled back in time to 18th-century Scotland, where she encounters a dashing young warrior and falls in love.',
      price: 599,
      format: 'Paperback',
      tagText: 'Fiction, Romance, Historical',
      catSlug: 'romance',
      brandSlug: 'penguin-random-house',
      rating: 4.7,
      deliveryDays: 3,
      coverBgColor: '#134e4a',
      stockQuantity: 22
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
        deliveryDateText: `Delivery within ${b.deliveryDays} day${b.deliveryDays === 1 ? '' : 's'}`,
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

  // 6. Seed demo cart items
  const user1Cart = await prisma.cart.findUnique({ where: { userId: user1.id } });
  const cosmosBook = createdProducts.find(p => p.title === 'Cosmos');
  const alchemist  = createdProducts.find(p => p.title === 'The Alchemist');

  if (user1Cart && cosmosBook && alchemist) {
    await prisma.cartItem.create({
      data: { cartId: user1Cart.id, productId: cosmosBook.id, quantity: 1, unitPrice: cosmosBook.price }
    });
    await prisma.cartItem.create({
      data: { cartId: user1Cart.id, productId: alchemist.id, quantity: 1, unitPrice: alchemist.price }
    });
  }

  // 7. Seed product relations (related reads)
  const relations = [
    ['Atomic Habits',           'Deep Work'],
    ['Atomic Habits',           'Thinking, Fast and Slow'],
    ['Deep Work',               'The 7 Habits of Highly Effective People'],
    ['Dune',                    'Ender\'s Game'],
    ['Dune',                    'The Martian'],
    ['The Hitchhiker\'s Guide to the Galaxy', 'Dune'],
    ['The Name of the Wind',    'The Hobbit'],
    ['The Name of the Wind',    'A Game of Thrones'],
    ['Harry Potter and the Philosopher\'s Stone', 'The Hobbit'],
    ['Gone Girl',               'The Girl with the Dragon Tattoo'],
    ['Gone Girl',               'And Then There Were None'],
    ['Steve Jobs',              'Elon Musk'],
    ['Becoming',                'Educated'],
    ['Educated',                'The Glass Castle'],
    ['1984',                    'Hamlet'],
    ['The Kite Runner',         'All the Light We Cannot See'],
    ['A Brief History of Time', 'Cosmos'],
    ['Cosmos',                  'The Selfish Gene'],
    ['Meditations',             "Man's Search for Meaning"],
    ['The Alchemist',           'Siddhartha'],
    ['Salt, Fat, Acid, Heat',   'Jerusalem'],
    ['The Hunger Games',        'Divergent'],
    ['Pride and Prejudice',     'Me Before You'],
    ['Maus',                    'Persepolis'],
  ];

  for (const [srcTitle, relTitle] of relations) {
    const src = createdProducts.find(p => p.title === srcTitle);
    const rel = createdProducts.find(p => p.title === relTitle);
    if (src && rel) {
      await prisma.productRelation.upsert({
        where: { productId_relatedProductId: { productId: src.id, relatedProductId: rel.id } },
        update: {},
        create: { productId: src.id, relatedProductId: rel.id, relationType: 'SIMILAR' }
      });
    }
  }

  console.log(`--- Seeding Completed! ${createdProducts.length} books across ${Object.keys(categories).length} categories. ---`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
