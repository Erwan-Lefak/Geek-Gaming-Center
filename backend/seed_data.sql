-- Seed pour le CRM Geek Gaming Center
-- Utilise les tables créées manuellement

-- 1. Mettre à jour le mot de passe admin (déjà créé)
UPDATE users SET password = '$2b$12$44UbumHlY8swm.nRhxd/p.Fri6uPY8MYlOtphyHQAAoAE99NofCIq' WHERE email = 'admin@ggc.cm';

-- 2. Créer les utilisateurs de test avec mots de passe hachés
INSERT INTO users (id, email, password, name, role, phone) VALUES
('manager-001', 'manager@ggc.cm', '$2b$12$5eUV04qc0K3kE7CWU6awXO3P69J//ZdURZoTrhUToJhzZusXCNaC.', 'Gérant GGC', 'MANAGER', '+237 600 000 002'),
('cashier-001', 'caissiere@ggc.cm', '$2b$12$cYSMZcxiQLvuuYbiZlM72.Dyh2KE7R9Z3dEcItHcgdcuwH.dLBHnm', 'Caissière GGC', 'CASHIER', '+237 600 000 003'),
('tech-001', 'technicien@ggc.cm', '$2b$12$JI54uMFy.sMA8DErGG0gs.XLfAG3e.2CfwJvaG69rl4LEkxD/.H4e', 'Technicien GGC', 'TECHNICIAN', '+237 600 000 004'),
('shareholder-001', 'actionnaire@ggc.cm', '$2b$12$vT2KkhEo0sqZ/AE7d8kykuLkuuWo4wlnlPpZk.j3s1zGvw8Mdm2sW', 'Actionnaire GGC', 'SHAREHOLDER', '+237 600 000 005')
ON CONFLICT (email) DO NOTHING;

-- 3. Créer des clients de test
INSERT INTO customers (id, first_name, last_name, email, phone, status, accept_cgv, cgv_accepted_at, created_by_id) VALUES
('customer-001', 'Jean', 'Test', 'client.test@example.com', '+237 671 234 567', 'ACTIVE', true, NOW(), 'admin-user-001'),
('customer-002', 'Marie', 'Dupont', 'marie.dupont@example.com', '+237 672 345 678', 'NEW', true, NOW(), 'admin-user-001'),
('customer-003', 'Paul', 'Kamga', 'paul.kamga@example.com', '+237 673 456 789', 'VIP', true, NOW(), 'admin-user-001')
ON CONFLICT (email) DO NOTHING;

-- Afficher les résultats
SELECT '✅ Seed completed!' as message;
SELECT '📋 Admin: admin@ggc.cm / admin123' as account;
SELECT '📋 Manager: manager@ggc.cm / manager123' as account;
SELECT '📋 Cashier: caissiere@ggc.cm / cashier123' as account;
SELECT '📋 Technician: technicien@ggc.cm / tech123' as account;
SELECT '📋 Shareholder: actionnaire@ggc.cm / shareholder123' as account;
