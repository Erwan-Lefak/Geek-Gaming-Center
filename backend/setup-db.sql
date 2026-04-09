-- ============================================
-- GEEK GAMING CENTER - DATABASE SETUP
-- ============================================

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS resources CASCADE;

-- ============================================
-- Resources Table
-- ============================================
CREATE TABLE resources (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'available',
  hourly_rate DECIMAL(10, 2) NOT NULL,
  specifications JSONB,
  availability_schedule JSONB,
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Bookings Table (créée AVANT time_slots pour les FOREIGN KEY)
-- ============================================
CREATE TABLE bookings (
  id VARCHAR(255) PRIMARY KEY,
  customer_id VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  slot_ids TEXT[] NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  deposit_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  payment_intent_id VARCHAR(255),
  deposit_paid BOOLEAN DEFAULT FALSE,
  no_show_penalty BOOLEAN DEFAULT FALSE,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Time Slots Table
-- ============================================
CREATE TABLE time_slots (
  id VARCHAR(255) PRIMARY KEY,
  resource_id VARCHAR(255) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'available',
  price DECIMAL(10, 2) NOT NULL,
  is_peak_hour BOOLEAN DEFAULT FALSE,
  booking_id VARCHAR(255) REFERENCES bookings(id) ON DELETE SET NULL,
  customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT slot_booking_constraint UNIQUE (resource_id, start_time, end_time)
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX idx_time_slots_resource ON time_slots(resource_id);
CREATE INDEX idx_time_slots_status ON time_slots(status);
CREATE INDEX idx_time_slots_time_range ON time_slots(start_time, end_time);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- ============================================
-- Seed Data: Resources
-- ============================================

-- PS5 Gaming Stations (15€/h)
INSERT INTO resources (id, name, type, status, hourly_rate, specifications, availability_schedule, images, description) VALUES
('ps5-1', 'PlayStation 5 - Station 1', 'ps5', 'available', 15.00,
 '{"controller": "DualSense", "resolution": "4K", "storage": "1TB SSD"}',
 '{"weekdays": ["10:00-23:00"], "weekends": ["09:00-00:00"]}',
 '[]',
 'Station de jeu PlayStation 5 avec manette DualSense, résolution 4K et 1TB de stockage.'),
('ps5-2', 'PlayStation 5 - Station 2', 'ps5', 'available', 15.00,
 '{"controller": "DualSense", "resolution": "4K", "storage": "1TB SSD"}',
 '{"weekdays": ["10:00-23:00"], "weekends": ["09:00-00:00"]}',
 '[]',
 'Station de jeu PlayStation 5 avec manette DualSense, résolution 4K et 1TB de stockage.'),
('ps5-3', 'PlayStation 5 - Station 3', 'ps5', 'available', 15.00,
 '{"controller": "DualSense", "resolution": "4K", "storage": "1TB SSD"}',
 '{"weekdays": ["10:00-23:00"], "weekends": ["09:00-00:00"]}',
 '[]',
 'Station de jeu PlayStation 5 avec manette DualSense, résolution 4K et 1TB de stockage.');

-- Xbox Gaming Stations (15€/h)
INSERT INTO resources (id, name, type, status, hourly_rate, specifications, availability_schedule, images, description) VALUES
('xbox-1', 'Xbox Series X - Station 1', 'xbox', 'available', 15.00,
 '{"controller": "Xbox Elite", "resolution": "4K", "storage": "1TB SSD", "game_pass": "true"}',
 '{"weekdays": ["10:00-23:00"], "weekends": ["09:00-00:00"]}',
 '[]',
 'Station de jeu Xbox Series X avec manette Elite, résolution 4K, 1TB de stockage et Game Pass inclus.'),
('xbox-2', 'Xbox Series X - Station 2', 'xbox', 'available', 15.00,
 '{"controller": "Xbox Elite", "resolution": "4K", "storage": "1TB SSD", "game_pass": "true"}',
 '{"weekdays": ["10:00-23:00"], "weekends": ["09:00-00:00"]}',
 '[]',
 'Station de jeu Xbox Series X avec manette Elite, résolution 4K, 1TB de stockage et Game Pass inclus.');

-- VR Stations (25€/h)
INSERT INTO resources (id, name, type, status, hourly_rate, specifications, availability_schedule, images, description) VALUES
('vr-1', 'VR Meta Quest 3 - Station 1', 'vr', 'available', 25.00,
 '{"headset": "Meta Quest 3", "resolution": "4K+", "refresh_rate": "120Hz", "tracking": "Inside-out"}',
 '{"weekdays": ["10:00-22:00"], "weekends": ["10:00-22:00"]}',
 '[]',
 'Station de réalité virtuelle avec casque Meta Quest 3, résolution 4K+ et taux de rafraîchissement 120Hz.'),
('vr-2', 'VR Meta Quest 3 - Station 2', 'vr', 'available', 25.00,
 '{"headset": "Meta Quest 3", "resolution": "4K+", "refresh_rate": "120Hz", "tracking": "Inside-out"}',
 '{"weekdays": ["10:00-22:00"], "weekends": ["10:00-22:00"]}',
 '[]',
 'Station de réalité virtuelle avec casque Meta Quest 3, résolution 4K+ et taux de rafraîchissement 120Hz.');

-- Simulation Auto (20€/h)
INSERT INTO resources (id, name, type, status, hourly_rate, specifications, availability_schedule, images, description) VALUES
('sim-1', 'Simulation Auto - Cockpit Pro', 'simulation', 'available', 20.00,
 '{"wheel": "Logitech G29", "pedals": "Triple pedal", "seat": "Racing seat", "monitors": "3x 27\" 144Hz"}',
 '{"weekdays": ["10:00-23:00"], "weekends": ["09:00-00:00"]}',
 '[]',
 'Cockpit de simulation auto professionnel avec volant Logitech G29, pédalier triple et siège de course. Trois moniteurs 144Hz pour immersion totale.');

-- Arcade Machines (10€/h)
INSERT INTO resources (id, name, type, status, hourly_rate, specifications, availability_schedule, images, description) VALUES
('arcade-1', 'Arcade Machine - Retro', 'arcade', 'available', 10.00,
 '{"games": "500+ classic games", "screen": "32\" LCD", "controls": "Joystick + 6 buttons", "players": "2 players"}',
 '{"weekdays": ["10:00-23:00"], "weekends": ["09:00-00:00"]}',
 '[]',
 'Machine d''arcade rétro avec plus de 500 jeux classiques, écran LCD 32\" et contrôles pour 2 joueurs.');

-- Retro Gaming Station (10€/h)
INSERT INTO resources (id, name, type, status, hourly_rate, specifications, availability_schedule, images, description) VALUES
('retro-1', 'Retro Gaming Station', 'retro', 'available', 10.00,
 '{"consoles": ["SNES", "N64", "PS1", "Dreamcast"], "tv": "32\" CRT", "games": "Library of 200+ classics"}',
 '{"weekdays": ["10:00-23:00"], "weekends": ["09:00-00:00"]}',
 '[]',
 'Station de rétro-gaming avec consoles classiques (SNES, N64, PS1, Dreamcast) et bibliothèque de 200+ jeux sur TV CRT.');

SELECT 'Database setup completed successfully!' as message;
