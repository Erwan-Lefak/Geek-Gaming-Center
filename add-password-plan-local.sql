-- Ajouter le champ password_plain à la table customers locale
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_plain TEXT;
