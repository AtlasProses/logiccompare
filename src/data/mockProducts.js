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
      "OS": "iOS 17"
    },
    scores: {
      performance: 95,
      camera: 94,
      battery: 88,
      value: 75
    },
    amazonLink: "https://amzn.to/example-iphone-15-pro-max"
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
      "OS": "Android 14"
    },
    scores: {
      performance: 96,
      camera: 95,
      battery: 92,
      value: 80
    },
    amazonLink: "https://amzn.to/example-galaxy-s24-ultra"
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
      "OS": "HyperOS (Android 14)"
    },
    scores: {
      performance: 94,
      camera: 97,
      battery: 89,
      value: 85
    },
    amazonLink: "https://amzn.to/example-xiaomi-14-ultra"
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
      "OS": "macOS Sonoma"
    },
    scores: {
      performance: 98,
      camera: 80,
      battery: 95,
      value: 65
    },
    amazonLink: "https://amzn.to/example-macbook-m3-max"
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
      "OS": "Windows 11 Home"
    },
    scores: {
      performance: 90,
      camera: 75,
      battery: 70,
      value: 72
    },
    amazonLink: "https://amzn.to/example-dell-xps-16"
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
      "OS": "macOS Sonoma"
    },
    scores: {
      performance: 88,
      camera: 70,
      battery: 90,
      value: 82
    },
    amazonLink: "https://amzn.to/example-macbook-air-m3"
  },
  {
    id: "xiaomi-smart-pet-feeder",
    name: "Smart Pet Feeder",
    brand: "Xiaomi",
    category: "Pet Care",
    specs: {
      "Display": "LED Status Indicators",
      "Processor": "IoT Smart Microcontroller",
      "RAM": "N/A",
      "Storage": "3.6L Dry Food Capacity",
      "Battery": "AAA Backup Batteries support",
      "Main Camera": "N/A (Built-in moisture cartridge)",
      "Weight": "3 kg",
      "Charging Speed": "6W power cord adapter",
      "OS": "Xiaomi Home Smart IoT Integration"
    },
    scores: {
      performance: 85,
      camera: 50,
      battery: 92,
      value: 88
    },
    amazonLink: "https://amzn.to/example-xiaomi-pet-feeder"
  },
  {
    id: "sage-barista-express",
    name: "Barista Express Espresso Machine",
    brand: "Sage",
    category: "Coffee Gear",
    specs: {
      "Display": "Analogue Pressure Gauge",
      "Processor": "PID Temperature Control",
      "RAM": "N/A",
      "Storage": "2.0L Water Tank / 250g Bean Hopper",
      "Battery": "N/A (Mains Power)",
      "Main Camera": "N/A",
      "Weight": "12.5 kg",
      "Charging Speed": "1850W heating element",
      "OS": "ThermoCoil heating system"
    },
    scores: {
      performance: 92,
      camera: 40,
      battery: 60,
      value: 85
    },
    amazonLink: "https://amzn.to/example-sage-barista-express"
  },
  {
    id: "dyson-airwrap-multistyler",
    name: "Airwrap Multi-Styler Complete",
    brand: "Dyson",
    category: "Home Appliances",
    specs: {
      "Display": "LED filter cleaning indicator",
      "Processor": "V9 Digital Motor Control",
      "RAM": "N/A",
      "Storage": "N/A",
      "Battery": "N/A",
      "Main Camera": "N/A",
      "Weight": "660 g",
      "Charging Speed": "1300W airflow power",
      "OS": "Coanda styling effect"
    },
    scores: {
      performance: 94,
      camera: 30,
      battery: 70,
      value: 78
    },
    amazonLink: "https://amzn.to/example-dyson-airwrap"
  },
  {
    id: "philips-avent-video-monitor",
    name: "Avent Smart Baby Monitor",
    brand: "Philips",
    category: "Baby & Children",
    specs: {
      "Display": "5-inch LCD Color Screen, FHSS",
      "Processor": "Smart Eco Mode Transmitter",
      "RAM": "N/A",
      "Storage": "N/A",
      "Battery": "12 Hours Baby Monitor Battery",
      "Main Camera": "HD camera with Night Vision",
      "Weight": "380 g",
      "Charging Speed": "5V Micro-USB charging",
      "OS": "Philips Baby Connect (Secure DECT)"
    },
    scores: {
      performance: 89,
      camera: 85,
      battery: 88,
      value: 80
    },
    amazonLink: "https://amzn.to/example-philips-avent"
  }
];
