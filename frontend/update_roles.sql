-- Agrega los roles 'cocina' y 'bar' al tipo ENUM existente
-- NOTA: Postgres NO permite 'IF NOT EXISTS' directamente en ALTER TYPE ADD VALUE, 
-- así que si ya existen, dará error, pero es seguro ignorarlo.

ALTER TYPE user_role ADD VALUE 'cocina';
ALTER TYPE user_role ADD VALUE 'bar';
