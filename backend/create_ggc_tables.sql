-- Table users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'CASHIER',
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table customers
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT NOT NULL,
    date_of_birth TIMESTAMP,
    address TEXT,
    city TEXT,
    status TEXT DEFAULT 'NEW',
    notes TEXT,
    accept_cgv BOOLEAN DEFAULT false,
    cgv_accepted_at TIMESTAMP,
    total_spent DECIMAL(12,2) DEFAULT 0,
    total_hours DECIMAL(10,2) DEFAULT 0,
    visit_count INTEGER DEFAULT 0,
    last_visit TIMESTAMP,
    created_by_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer l'admin (mot de passe: admin123)
INSERT INTO users (id, email, password, name, role)
VALUES (
    'admin-user-001',
    'admin@ggc.cm',
    '$2a$12$W1jR8vH6F9qX2mN8pK7oQz0vE3hG5j8kL9mN3oP5rS7tU0vW2x',
    'Administrateur GGC',
    'ADMIN'
) ON CONFLICT (email) DO NOTHING;

-- Donner les droits à erwan sur ces tables
GRANT ALL ON users, customers TO erwan;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO erwan;
