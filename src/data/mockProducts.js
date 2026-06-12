export const mockProducts = [
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    category: "Smartphones",
    specs: {
      "Display": "6.7-inch Super Retina XDR OLED, 120Hz",
      "Processor": "Apple A17 Pro (3nm)",
      "RAM": "8 GB",
      "Storage": "256 GB / 512 GB / 1 TB",
      "Battery": "4441 mAh",
      "Main Camera": "48 MP (wide) + 12 MP (periscope telephoto 5x) + 12 MP (ultrawide)",
      "Weight": "221 g",
      "Charging Speed": "25W wired",
      "OS": "iOS 17",
      "Series": "Pro Series",
      "Launch Date": "September 12, 2023",
      "Release Date": "September 22, 2023"
    },
    scores: {
      performance: 95,
      camera: 94,
      battery: 88,
      value: 75
    },
    amazonLink: "https://amzn.to/example-iphone-15-pro-max",
    reviews: [
      {
        id: "rev-ip-1",
        author: "Marcus Aurelius",
        type: "editor",
        role: "Chief Editor",
        avatar: "https://avatar.vercel.sh/marcus",
        rating: 5,
        date: "2026-01-15",
        content: "A17 Pro chipset sets a new benchmark for mobile processors. Titanium design feels lighter but is prone to fingerprints.",
        likes: 42,
        hearts: 18
      },
      {
        id: "rev-ip-2",
        author: "Ahmet Yilmaz",
        type: "user",
        role: "Verified Purchaser",
        avatar: "https://avatar.vercel.sh/ahmet",
        rating: 4,
        date: "2026-02-10",
        content: "Bataryası yoğun kullanımda bir günü rahat çıkarıyor. Kamerası harika ancak fiyatı çok yüksek.",
        likes: 25,
        hearts: 4
      }
    ]
  },
  {
    id: "galaxy-s24-ultra",
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Smartphones",
    specs: {
      "Display": "6.8-inch Dynamic AMOLED 2X, 120Hz",
      "Processor": "Snapdragon 8 Gen 3 (4nm)",
      "RAM": "12 GB",
      "Storage": "256 GB / 512 GB / 1 TB",
      "Battery": "5000 mAh",
      "Main Camera": "200 MP (wide) + 50 MP (telephoto 5x) + 10 MP (telephoto 3x) + 12 MP (ultrawide)",
      "Weight": "232 g",
      "Charging Speed": "45W wired",
      "OS": "Android 14",
      "Series": "Galaxy S Series",
      "Launch Date": "January 17, 2024",
      "Release Date": "January 31, 2024"
    },
    scores: {
      performance: 96,
      camera: 95,
      battery: 92,
      value: 80
    },
    amazonLink: "https://amzn.to/example-galaxy-s24-ultra",
    reviews: [
      {
        id: "rev-s24-1",
        author: "Alice Zhang",
        type: "editor",
        role: "Senior Tech Editor",
        avatar: "https://avatar.vercel.sh/alice",
        rating: 5,
        date: "2026-01-20",
        content: "Galaxy AI features are helpful, and the anti-reflective screen is a game changer for outdoor visibility.",
        likes: 56,
        hearts: 22
      },
      {
        id: "rev-s24-2",
        author: "Sarah K.",
        type: "user",
        role: "Power User",
        avatar: "https://avatar.vercel.sh/sarah",
        rating: 5,
        date: "2026-03-01",
        content: "S-Pen desteği ve çoklu pencere yönetimi mükemmel. 45W şarj hızı fazlasıyla yeterli.",
        likes: 18,
        hearts: 9
      }
    ]
  },
  {
    id: "xiaomi-14-ultra",
    name: "Xiaomi 14 Ultra",
    brand: "Xiaomi",
    category: "Smartphones",
    specs: {
      "Display": "6.73-inch LTPO AMOLED, 120Hz",
      "Processor": "Snapdragon 8 Gen 3 (4nm)",
      "RAM": "16 GB",
      "Storage": "512 GB",
      "Battery": "5000 mAh",
      "Main Camera": "50 MP Leica Quad Camera system",
      "Weight": "220 g",
      "Charging Speed": "90W wired, 80W wireless",
      "OS": "HyperOS (Android 14)",
      "Series": "Ultra Series",
      "Launch Date": "February 22, 2024",
      "Release Date": "March 15, 2024"
    },
    scores: {
      performance: 94,
      camera: 97,
      battery: 89,
      value: 85
    },
    amazonLink: "https://amzn.to/example-xiaomi-14-ultra",
    reviews: [
      {
        id: "rev-xi-1",
        author: "Alice Zhang",
        type: "editor",
        role: "Senior Tech Editor",
        avatar: "https://avatar.vercel.sh/alice",
        rating: 5,
        date: "2026-03-20",
        content: "The 1-inch sensor size is incredible for night shots. Leica color profiles are spectacular.",
        likes: 38,
        hearts: 15
      },
      {
        id: "rev-xi-2",
        author: "Mehmet Demir",
        type: "user",
        role: "Photography Enthusiast",
        avatar: "https://avatar.vercel.sh/mehmet",
        rating: 4,
        date: "2026-04-05",
        content: "Telefon değil sanki profesyonel fotoğraf makinesi. Şarjı 90W ile acayip hızlı doluyor.",
        likes: 29,
        hearts: 8
      }
    ]
  },
  {
    id: "macbook-pro-m3-max",
    name: "MacBook Pro 16\" (M3 Max)",
    brand: "Apple",
    category: "Laptops",
    specs: {
      "Display": "16.2-inch Liquid Retina XDR, 120Hz",
      "Processor": "Apple M3 Max (16-core CPU, 40-core GPU)",
      "RAM": "36 GB / 48 GB / 128 GB",
      "Storage": "512 GB / 1 TB / 2 TB / 4 TB / 8 TB",
      "Battery": "100 Wh (up to 22h runtime)",
      "Main Camera": "1080p FaceTime HD",
      "Weight": "2.16 kg",
      "Charging Speed": "140W MagSafe 3",
      "OS": "macOS Sonoma",
      "Series": "MacBook Pro",
      "Launch Date": "October 30, 2023",
      "Release Date": "November 7, 2023"
    },
    scores: {
      performance: 98,
      camera: 80,
      battery: 95,
      value: 65
    },
    amazonLink: "https://amzn.to/example-macbook-m3-max",
    reviews: [
      {
        id: "rev-mb-1",
        author: "Marcus Aurelius",
        type: "editor",
        role: "Chief Editor",
        avatar: "https://avatar.vercel.sh/marcus",
        rating: 5,
        date: "2026-02-12",
        content: "Unmatched performance per watt. Video rendering speeds are desktop-grade without fan noise.",
        likes: 74,
        hearts: 30
      },
      {
        id: "rev-mb-2",
        author: "Caner T.",
        type: "user",
        role: "Software Developer",
        avatar: "https://avatar.vercel.sh/caner",
        rating: 5,
        date: "2026-04-10",
        content: "Derleme süreleri yarıya indi. Batarya ömrü tüm gün kesintisiz kodlama için fazlasıyla yetiyor.",
        likes: 31,
        hearts: 12
      }
    ]
  },
  {
    id: "dell-xps-16-2024",
    name: "Dell XPS 16 (2024)",
    brand: "Dell",
    category: "Laptops",
    specs: {
      "Display": "16.3-inch OLED Touchscreen, 90Hz",
      "Processor": "Intel Core Ultra 7 155H / Ultra 9 185H",
      "RAM": "16 GB / 32 GB / 64 GB",
      "Storage": "512 GB / 1 TB / 2 TB / 4 TB",
      "Battery": "99.5 Wh (up to 10h runtime)",
      "Main Camera": "1080p FHD camera",
      "Weight": "2.13 kg",
      "Charging Speed": "130W USB-C",
      "OS": "Windows 11 Home",
      "Series": "XPS Premium",
      "Launch Date": "January 8, 2024",
      "Release Date": "February 20, 2024"
    },
    scores: {
      performance: 90,
      camera: 75,
      battery: 70,
      value: 72
    },
    amazonLink: "https://amzn.to/example-dell-xps-16",
    reviews: [
      {
        id: "rev-xps-1",
        author: "Alice Zhang",
        type: "editor",
        role: "Senior Tech Editor",
        avatar: "https://avatar.vercel.sh/alice",
        rating: 4,
        date: "2026-03-05",
        content: "Beautiful design and display, but the capacitive function row and touchpad might take time to get used to.",
        likes: 28,
        hearts: 6
      },
      {
        id: "rev-xps-2",
        author: "Berrin E.",
        type: "user",
        role: "Product Designer",
        avatar: "https://avatar.vercel.sh/berrin",
        rating: 4,
        date: "2026-05-18",
        content: "Tasarım kalitesi çok yüksek, ekran renk doğruluğu harika. F klavyeliler için alışması biraz zaman alıyor.",
        likes: 14,
        hearts: 2
      }
    ]
  },
  {
    id: "macbook-air-m3",
    name: "MacBook Air 13\" M3",
    brand: "Apple",
    category: "Laptops",
    specs: {
      "Display": "13.6-inch Liquid Retina, 60Hz",
      "Processor": "Apple M3 (8-core CPU, 10-core GPU)",
      "RAM": "16 GB Unified",
      "Storage": "512 GB SSD",
      "Battery": "52.6 Wh (up to 18h runtime)",
      "Main Camera": "1080p FaceTime HD",
      "Weight": "1.24 kg",
      "Charging Speed": "35W Dual USB-C",
      "OS": "macOS Sonoma",
      "Series": "MacBook Air",
      "Launch Date": "March 4, 2024",
      "Release Date": "March 8, 2024"
    },
    scores: {
      performance: 88,
      camera: 70,
      battery: 90,
      value: 82
    },
    amazonLink: "https://amzn.to/example-macbook-air-m3",
    reviews: [
      {
        id: "rev-mba-1",
        author: "Marcus Aurelius",
        type: "editor",
        role: "Chief Editor",
        avatar: "https://avatar.vercel.sh/marcus",
        rating: 5,
        date: "2026-03-10",
        content: "The best lightweight laptop on the market. Fanless design means complete silence under any load.",
        likes: 49,
        hearts: 14
      },
      {
        id: "rev-mba-2",
        author: "Elif S.",
        type: "user",
        role: "Student",
        avatar: "https://avatar.vercel.sh/elif",
        rating: 5,
        date: "2026-04-20",
        content: "Çantada taşındığını bile unutuyorsunuz. Şarj aletini okula götürmeme hiç gerek kalmıyor.",
        likes: 22,
        hearts: 7
      }
    ]
  },
  {
    id: "dyson-v15-detect",
    name: "V15 Detect Cordless Vacuum",
    brand: "Dyson",
    category: "Home Appliances",
    specs: {
      "Suction Power": "240 AW",
      "Run Time": "Up to 60 minutes",
      "Bin Volume": "0.76 L",
      "Filtration": "Fully-sealed 5-stage filtration",
      "Weight": "3.1 kg",
      "Power": "660 W",
      "Type": "Cordless Stick Vacuum"
    },
    scores: {
      performance: 95,
      camera: 30,
      battery: 80,
      value: 70
    },
    amazonLink: "https://amzn.to/example-dyson-v15",
    reviews: [
      {
        id: "rev-d15-1",
        author: "John Doe",
        type: "editor",
        role: "Home Gear Expert",
        avatar: "https://avatar.vercel.sh/john",
        rating: 5,
        date: "2026-01-05",
        content: "The laser dust detection makes invisible dust clearly visible. Suction power auto-adjusts very reliably.",
        likes: 37,
        hearts: 9
      },
      {
        id: "rev-d15-2",
        author: "Fatma B.",
        type: "user",
        role: "Verified Purchaser",
        avatar: "https://avatar.vercel.sh/fatma",
        rating: 4,
        date: "2026-03-15",
        content: "Lazer ışığı gerçekten her pisliği gösteriyor. Temizlik süresi epey kısaldı ama tetiğe sürekli basmak yorucu.",
        likes: 19,
        hearts: 3
      }
    ]
  },
  {
    id: "roborock-s8-pro-ultra",
    name: "Roborock S8 Pro Ultra",
    brand: "Roborock",
    category: "Home Appliances",
    specs: {
      "Suction Power": "6000 Pa",
      "Run Time": "Up to 180 minutes",
      "Bin Volume": "0.35 L (dust) / 0.3 L (water)",
      "Filtration": "E11 washable air filter",
      "Weight": "4.8 kg",
      "Connectivity": "Wi-Fi (Roborock App)",
      "Type": "Robot Vacuum & Mop System"
    },
    scores: {
      performance: 96,
      camera: 70,
      battery: 92,
      value: 74
    },
    amazonLink: "https://amzn.to/example-roborock-s8",
    reviews: [
      {
        id: "rev-s8-1",
        author: "John Doe",
        type: "editor",
        role: "Home Gear Expert",
        avatar: "https://avatar.vercel.sh/john",
        rating: 5,
        date: "2026-02-18",
        content: "Self-cleaning dock is a true set-and-forget experience. Excellent navigation around cables and slippers.",
        likes: 54,
        hearts: 21
      },
      {
        id: "rev-s8-2",
        author: "Cem A.",
        type: "user",
        role: "Busy Professional",
        avatar: "https://avatar.vercel.sh/cem",
        rating: 5,
        date: "2026-04-12",
        content: "Evde kedi köpek olmasına rağmen halılardaki kılları tamamen topluyor. Paspas yıkama ve kurutma istasyonu harika.",
        likes: 27,
        hearts: 11
      }
    ]
  },
  {
    id: "sage-barista-express",
    name: "Barista Express Espresso Machine",
    brand: "Sage",
    category: "Coffee Gear",
    specs: {
      "Type": "Semi-Automatic",
      "Pressure": "15 Bar",
      "Water Tank": "2.0 L",
      "Grinder": "Integrated conical burr (250g)",
      "Heating System": "ThermoCoil (PID control)",
      "Weight": "12.5 kg",
      "Power": "1850 W"
    },
    scores: {
      performance: 92,
      camera: 40,
      battery: 60,
      value: 85
    },
    amazonLink: "https://amzn.to/example-sage-barista-express",
    reviews: [
      {
        id: "rev-sage-1",
        author: "John Doe",
        type: "editor",
        role: "Coffee Gear Specialist",
        avatar: "https://avatar.vercel.sh/john",
        rating: 5,
        date: "2026-02-10",
        content: "The gold standard for home espresso beginners. PID controller ensures perfect temperature stability.",
        likes: 64,
        hearts: 28
      },
      {
        id: "rev-sage-2",
        author: "Burak Y.",
        type: "user",
        role: "Home Barista",
        avatar: "https://avatar.vercel.sh/burak",
        rating: 5,
        date: "2026-03-25",
        content: "Kahve dükkanındaki lezzeti eve taşıdım. Öğütücüsünün ayarlarını çözdükten sonra harika shotlar alıyorum.",
        likes: 41,
        hearts: 19
      }
    ]
  },
  {
    id: "delonghi-magnifica-start",
    name: "Magnifica Start Fully Automatic",
    brand: "DeLonghi",
    category: "Coffee Gear",
    specs: {
      "Type": "Fully Automatic",
      "Pressure": "15 Bar",
      "Water Tank": "1.8 L",
      "Grinder": "Steel burr grinder (250g)",
      "Heating System": "Thermoblock",
      "Weight": "8.8 kg",
      "Power": "1450 W"
    },
    scores: {
      performance: 88,
      camera: 30,
      battery: 65,
      value: 88
    },
    amazonLink: "https://amzn.to/example-delonghi-start",
    reviews: [
      {
        id: "rev-del-1",
        author: "John Doe",
        type: "editor",
        role: "Coffee Gear Specialist",
        avatar: "https://avatar.vercel.sh/john",
        rating: 4,
        date: "2026-03-12",
        content: "Super-automatic convenience at a very fair price point. Steam wand is decent but requires manual work.",
        likes: 33,
        hearts: 7
      },
      {
        id: "rev-del-2",
        author: "Deniz G.",
        type: "user",
        role: "Verified Purchaser",
        avatar: "https://avatar.vercel.sh/deniz",
        rating: 4,
        date: "2026-05-01",
        content: "Tek tuşla kahve çekip hazırlaması büyük kolaylık. Temizliği de aşırı zahmetsiz.",
        likes: 15,
        hearts: 4
      }
    ]
  },
  {
    id: "xiaomi-smart-pet-feeder",
    name: "Smart Pet Feeder",
    brand: "Xiaomi",
    category: "Pet Care",
    specs: {
      "Capacity": "3.6 L (Dry food)",
      "Material": "304 Stainless steel bowl & ABS plastic",
      "Connectivity": "Wi-Fi 2.4GHz (Xiaomi Home App)",
      "Dimensions": "31.1 x 18.0 x 38.7 cm",
      "Weight": "3 kg",
      "Power": "6 W (AAA backup batteries support)"
    },
    scores: {
      performance: 85,
      camera: 50,
      battery: 92,
      value: 88
    },
    amazonLink: "https://amzn.to/example-xiaomi-pet-feeder",
    reviews: [
      {
        id: "rev-pf-1",
        author: "Sarah Connor",
        type: "editor",
        role: "Senior Pet Editor",
        avatar: "https://avatar.vercel.sh/sarah",
        rating: 4,
        date: "2026-01-20",
        content: "Very reliable dispensing mechanism that doesn't jam. Backup battery keeps it working even during power cuts.",
        likes: 29,
        hearts: 11
      },
      {
        id: "rev-pf-2",
        author: "Zeynep T.",
        type: "user",
        role: "Cat Owner",
        avatar: "https://avatar.vercel.sh/zeynep",
        rating: 5,
        date: "2026-04-18",
        content: "Hafta sonu tatile giderken içim rahat ediyor. Uygulama üzerinden ek porsiyon da gönderebiliyorum.",
        likes: 17,
        hearts: 5
      }
    ]
  },
  {
    id: "purina-pro-plan-kitten",
    name: "Pro Plan OptiStart Kitten Chicken",
    brand: "Purina",
    category: "Pet Care",
    specs: {
      "Type": "Dry Kitten Food (Mamalar)",
      "Capacity": "10 kg bag",
      "Material": "Chicken, Rice, Dried poultry protein",
      "Dimensions": "12 x 40 x 70 cm",
      "Weight": "10 kg"
    },
    scores: {
      performance: 90,
      camera: 20,
      battery: 50,
      value: 82
    },
    amazonLink: "https://amzn.to/example-purina-proplan",
    reviews: [
      {
        id: "rev-pp-1",
        author: "Sarah Connor",
        type: "editor",
        role: "Senior Pet Editor",
        avatar: "https://avatar.vercel.sh/sarah",
        rating: 5,
        date: "2026-02-15",
        content: "High protein and colostrum benefits support immune health. Highly recommended by veterinarians.",
        likes: 22,
        hearts: 8
      },
      {
        id: "rev-pp-2",
        author: "Kadir K.",
        type: "user",
        role: "Kitten Owner",
        avatar: "https://avatar.vercel.sh/kadir",
        rating: 5,
        date: "2026-04-02",
        content: "Yavru kedim iştahla yiyor. Tüyleri çok daha parlak olmaya başladı. Kesinlikle tavsiye ederim.",
        likes: 12,
        hearts: 3
      }
    ]
  },
  {
    id: "gimcat-malt-soft-extra",
    name: "Malt-Soft Extra Paste",
    brand: "GimCat",
    category: "Pet Care",
    specs: {
      "Type": "Malt Paste (Macunlar)",
      "Capacity": "100 g tube",
      "Material": "Malt extract, Oils, Fats, Cellulose",
      "Dimensions": "4 x 5 x 18 cm",
      "Weight": "120 g"
    },
    scores: {
      performance: 94,
      camera: 10,
      battery: 40,
      value: 86
    },
    amazonLink: "https://amzn.to/example-gimcat-malt",
    reviews: [
      {
        id: "rev-gc-1",
        author: "Sarah Connor",
        type: "editor",
        role: "Senior Pet Editor",
        avatar: "https://avatar.vercel.sh/sarah",
        rating: 5,
        date: "2026-03-01",
        content: "Extremely effective formula to prevent hairballs. No added sugar is a big health benefit.",
        likes: 19,
        hearts: 10
      },
      {
        id: "rev-gc-2",
        author: "Merve U.",
        type: "user",
        role: "Cat Owner",
        avatar: "https://avatar.vercel.sh/merve",
        rating: 5,
        date: "2026-05-10",
        content: "Tüy kusma problemlerini tamamen çözdü. Ödül maması gibi yalıyorlar, çok seviyor.",
        likes: 8,
        hearts: 2
      }
    ]
  },
  {
    id: "catit-pixi-fountain",
    name: "Pixi Smart Drinking Fountain",
    brand: "Catit",
    category: "Pet Care",
    specs: {
      "Type": "Water Fountain (Su Kapları)",
      "Capacity": "2.5 L",
      "Material": "BPA-free plastic & Stainless steel top",
      "Connectivity": "Wi-Fi (Catit Pixi App)",
      "Dimensions": "20.5 x 20.5 x 17 cm",
      "Weight": "1.2 kg",
      "Filtration": "Triple action filter cartridge"
    },
    scores: {
      performance: 92,
      camera: 40,
      battery: 88,
      value: 80
    },
    amazonLink: "https://amzn.to/example-catit-pixi",
    reviews: [
      {
        id: "rev-cp-1",
        author: "Sarah Connor",
        type: "editor",
        role: "Senior Pet Editor",
        avatar: "https://avatar.vercel.sh/sarah",
        rating: 5,
        date: "2026-03-15",
        content: "Extremely silent pump. LED indicators alert when the water levels are low or filter needs changing.",
        likes: 31,
        hearts: 14
      },
      {
        id: "rev-cp-2",
        author: "Murat S.",
        type: "user",
        role: "Cat Owner",
        avatar: "https://avatar.vercel.sh/murat",
        rating: 5,
        date: "2026-04-22",
        content: "Kedim durgun su içmiyordu, buna bayıldı. Su seviyesini burundaki ışıktan takip etmek çok kolay.",
        likes: 14,
        hearts: 6
      }
    ]
  },
  {
    id: "philips-avent-video-monitor",
    name: "Avent Smart Baby Monitor",
    brand: "Philips",
    category: "Baby & Children",
    specs: {
      "Display": "5-inch LCD Color Screen, FHSS",
      "Processor": "Secure Connect eco transmitter",
      "Battery": "Up to 12 Hours baby unit battery",
      "Main Camera": "HD Camera with night vision & zoom",
      "Weight": "380 g",
      "Charging Speed": "5V Micro-USB charging",
      "OS": "Secure DECT connection tech",
      "Connectivity": "Direct FHSS & Wi-Fi support"
    },
    scores: {
      performance: 89,
      camera: 85,
      battery: 88,
      value: 80
    },
    amazonLink: "https://amzn.to/example-philips-avent",
    reviews: [
      {
        id: "rev-pa-1",
        author: "Marcus Aurelius",
        type: "editor",
        role: "Tech Editor",
        avatar: "https://avatar.vercel.sh/marcus",
        rating: 4,
        date: "2026-01-30",
        content: "Highly secure connection. Sound clarity is crisp and the night vision auto-focus works very fast.",
        likes: 30,
        hearts: 11
      },
      {
        id: "rev-pa-2",
        author: "Gökhan D.",
        type: "user",
        role: "New Parent",
        avatar: "https://avatar.vercel.sh/gokhan",
        rating: 5,
        date: "2026-03-18",
        content: "Çekim alanı çok geniş. İki katlı müstakil evde en ufak bir kopma yaşamadık. Şarjı da çok iyi gidiyor.",
        likes: 18,
        hearts: 4
      }
    ]
  },
  {
    id: "bugaboo-butterfly-stroller",
    name: "Butterfly Ultra-Compact Stroller",
    brand: "Bugaboo",
    category: "Baby & Children",
    specs: {
      "Type": "Stroller (Bebek Arabaları)",
      "Material": "Aluminum frame, Premium fabrics",
      "Dimensions": "45 x 23 x 54 cm (folded)",
      "Weight": "7.3 kg",
      "Capacity": "Up to 22 kg seat load"
    },
    scores: {
      performance: 94,
      camera: 30,
      battery: 50,
      value: 78
    },
    amazonLink: "https://amzn.to/example-bugaboo",
    reviews: [
      {
        id: "rev-bb-1",
        author: "Sarah Connor",
        type: "editor",
        role: "Senior Safety Editor",
        avatar: "https://avatar.vercel.sh/sarah",
        rating: 5,
        date: "2026-02-28",
        content: "Exceptional one-second fold mechanism. Extremely compact for aircraft overhead bins yet feels sturdy.",
        likes: 26,
        hearts: 12
      },
      {
        id: "rev-bb-2",
        author: "Esra T.",
        type: "user",
        role: "Traveler Parent",
        avatar: "https://avatar.vercel.sh/esra",
        rating: 5,
        date: "2026-05-05",
        content: "Tek elle kapatıp açmak rüya gibi. Diğer kabin boy arabalara göre süspansiyonu çok daha başarılı.",
        likes: 13,
        hearts: 5
      }
    ]
  },
  {
    id: "britax-romer-dualfix",
    name: "Dualfix M i-Size Car Seat",
    brand: "Britax Römer",
    category: "Baby & Children",
    specs: {
      "Type": "Car Seat (Oto Koltukları)",
      "Material": "ISOFIX Steel structure, Foam padding",
      "Dimensions": "48 x 44 x 74 cm",
      "Weight": "15 kg",
      "Capacity": "3 months to 4 years (up to 18 kg)",
      "Connectivity": "360-degree rotating base"
    },
    scores: {
      performance: 96,
      camera: 20,
      battery: 40,
      value: 75
    },
    amazonLink: "https://amzn.to/example-dualfix",
    reviews: [
      {
        id: "rev-br-1",
        author: "Sarah Connor",
        type: "editor",
        role: "Senior Safety Editor",
        avatar: "https://avatar.vercel.sh/sarah",
        rating: 5,
        date: "2026-03-10",
        content: "Top ADAC test results. 360-degree rotation is a massive convenience for buckling children in.",
        likes: 38,
        hearts: 19
      },
      {
        id: "rev-br-2",
        author: "Volkan B.",
        type: "user",
        role: "Verified Purchaser",
        avatar: "https://avatar.vercel.sh/volkan",
        rating: 5,
        date: "2026-04-30",
        content: "Çocuğu koltuğa yerleştirirken 360 derece dönebilmesi beli kurtarıyor. Kumaşı da hiç terletmiyor.",
        likes: 19,
        hearts: 6
      }
    ]
  },
  {
    id: "babilin-en-zengin-adami",
    name: "Babil'in En Zengin Adamı",
    brand: "Panama Yayıncılık",
    category: "Books & Lifestyle",
    specs: {
      "Author": "George S. Clason",
      "Publisher": "Panama Yayıncılık",
      "Translator": "Selin Ceyhan",
      "ISBN": "9786052243452",
      "Edition": "45. Baskı",
      "Pages": "160 Sayfa",
      "Binding": "Karton Kapak",
      "Paper": "2. Hamur (Kitap Kağıdı)",
      "Dimensions": "13.5 x 21 cm"
    },
    scores: {
      performance: 98,
      camera: 10,
      battery: 10,
      value: 99
    },
    amazonLink: "https://amzn.to/example-babil",
    frontCover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300",
    backCover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300",
    description: "Babil, antik çağın en zengin ve en görkemli şehriydi. Bu zenginliğin sırrı neydi? Parayı kazanma, biriktirme ve çoğaltma konusundaki zamansız ilkelerle finansal refahın kapılarını aralayan klasik bir başyapıt.",
    reviews: [
      {
        id: "rev-babil-1",
        author: "Marcus Aurelius",
        type: "editor",
        role: "Chief Editor",
        avatar: "https://avatar.vercel.sh/marcus",
        rating: 5,
        date: "2026-01-10",
        content: "A timeless masterpiece on wealth building. Clason's parables of Babylon deliver profound financial rules in extremely simple stories.",
        likes: 85,
        hearts: 41
      },
      {
        id: "rev-babil-2",
        author: "Selin U.",
        type: "user",
        role: "Book Reader",
        avatar: "https://avatar.vercel.sh/selin",
        rating: 5,
        date: "2026-02-28",
        content: "Finansal okuryazarlık alanında okunması gereken ilk kitap. Kuralları uygulaması çok basit ve etkili.",
        likes: 54,
        hearts: 22
      }
    ]
  },
  {
    id: "dusun-ve-zengin-ol",
    name: "Düşün ve Zengin Ol",
    brand: "Altın Kitaplar",
    category: "Books & Lifestyle",
    specs: {
      "Author": "Napoleon Hill",
      "Publisher": "Altın Kitaplar",
      "Translator": "Kartal Dostlar",
      "ISBN": "9789752115163",
      "Edition": "15. Baskı",
      "Pages": "384 Sayfa",
      "Binding": "Karton Kapak",
      "Paper": "2. Hamur (Kitap Kağıdı)",
      "Dimensions": "13.5 x 21.5 cm"
    },
    scores: {
      performance: 95,
      camera: 10,
      battery: 10,
      value: 96
    },
    amazonLink: "https://amzn.to/example-think-grow",
    frontCover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300",
    backCover: "https://images.unsplash.com/photo-1629992101753-56c1ebff3b19?auto=format&fit=crop&q=80&w=300",
    description: "Napoleon Hill'in 500'den fazla başarılı insanla yaptığı mülakatların sonucunda formüle ettiği, zenginleşme ve hayatta başarıya ulaşma felsefesini anlatan tüm zamanların en çok satan kişisel gelişim kitabı.",
    reviews: [
      {
        id: "rev-dusun-1",
        author: "Marcus Aurelius",
        type: "editor",
        role: "Chief Editor",
        avatar: "https://avatar.vercel.sh/marcus",
        rating: 5,
        date: "2026-01-12",
        content: "One of the cornerstones of self-help literature. Hill's structure on desire, faith, and autosuggestion remains highly influential.",
        likes: 62,
        hearts: 29
      },
      {
        id: "rev-dusun-2",
        author: "Gökhan S.",
        type: "user",
        role: "Book Reader",
        avatar: "https://avatar.vercel.sh/gokhan-reader",
        rating: 5,
        date: "2026-03-14",
        content: "Zihniyet dönüşümü için muhteşem bir eser. Başarıya giden yolu formüllerle adım adım anlatmış.",
        likes: 38,
        hearts: 15
      }
    ]
  }
];
