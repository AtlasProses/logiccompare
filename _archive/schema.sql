-- LogicCompare D1 SQLite Shards Schema

-- ==========================================
-- 1. CORE SYSTEM TABLES (logiccompare-core)
-- ==========================================

-- Brands
CREATE TABLE IF NOT EXISTS brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Categories (Hierarchical: Electronics -> Laptops)
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT,
    FOREIGN KEY(parent_id) REFERENCES categories(id)
);

-- Virtual Editorial Pool (100 Editors)
CREATE TABLE IF NOT EXISTS editors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('Chief', 'Super', 'Senior', 'General')),
    avatar_url TEXT,
    bio TEXT
);

-- Registered Users (Protected via Turnstile/OAuth)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 2. PRODUCT SPECIFICATION TABLES (Shards 2 to 6)
-- =========================================================

-- Products (Contains views counter for popularity metrics)
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    specs_json TEXT NOT NULL, -- Compressed specs for edge performance
    views INTEGER DEFAULT 0, -- Total views counter
    avg_user_score REAL DEFAULT 0.0,
    avg_editor_score REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(brand_id) REFERENCES brands(id),
    FOREIGN KEY(category_id) REFERENCES categories(id)
);

-- Affiliate price/store offers matrix (Linked to Amazon, Temu, AliExpress)
CREATE TABLE IF NOT EXISTS offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    store_name TEXT CHECK(store_name IN ('Amazon', 'Temu', 'AliExpress')),
    price REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    affiliate_url TEXT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);


-- =========================================================
-- 3. USER COMMENTS & REACTIONS TABLES (Shards 7 to 9)
-- =========================================================

-- Editor Reviews
CREATE TABLE IF NOT EXISTS editor_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    editor_id TEXT NOT NULL,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(editor_id) REFERENCES editors(id)
);

-- User Reviews (Written by registered users)
CREATE TABLE IF NOT EXISTS user_reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Review Reactions (Likes/Hearts left by guest visitors)
CREATE TABLE IF NOT EXISTS review_reactions (
    review_id TEXT NOT NULL,
    visitor_hash TEXT NOT NULL, -- Fingerprinted guest browser hash
    reaction_type TEXT CHECK(reaction_type IN ('like', 'dislike', 'heart', 'favorite')),
    PRIMARY KEY(review_id, visitor_hash, reaction_type),
    FOREIGN KEY(review_id) REFERENCES user_reviews(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_views ON products(views DESC);
CREATE INDEX IF NOT EXISTS idx_products_lookup ON products(category_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_offers_product ON offers(product_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_product ON user_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reactions_lookup ON review_reactions(review_id);
