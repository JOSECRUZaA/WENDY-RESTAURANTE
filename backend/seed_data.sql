
-- TIPO: PLATO FUERTE (COCINA)
INSERT INTO public.products (nombre, precio, area, descripcion, controla_stock, stock_actual, disponible) VALUES
('Silpancho Cochabambino', 35.00, 'cocina', 'Carne apanada gigante con arroz, papa y huevo', true, 50, true),
('Pique Macho (2 Personas)', 65.00, 'cocina', 'Trozos de lomo, chorizo, papa frita, loco y tomate', true, 40, true),
('Pique Macho (Familiar)', 120.00, 'cocina', 'Porción gigante para 4 personas', true, 30, true),
('Milanesa de Pollo', 28.00, 'cocina', 'Con guarnición de arroz y ensalada', true, 50, true),
('Lomo Montado', 42.00, 'cocina', 'Lomo jugoso con 2 huevos fritos encima', true, 40, true),
('Chicharrón de Cerdo', 50.00, 'cocina', 'Con mote, papa y llajua', true, 35, true),
('Fricase Paceño', 45.00, 'cocina', 'Picante de cerdo con chuño y mote', true, 30, true),
('Sopa de Maní', 15.00, 'cocina', 'Tradicional con costilla y papas fritas', true, 60, true),
('Chairo Paceño', 18.00, 'cocina', 'Sopa espesa con chuño y trigo', true, 40, true),
('Ají de Fideo', 22.00, 'cocina', 'Picante con carne molida y papa', true, 45, true);

-- TIPO: EXTRAS (COCINA)
INSERT INTO public.products (nombre, precio, area, descripcion, controla_stock, stock_actual, disponible) VALUES
('Porción Arroz', 8.00, 'cocina', 'Arroz blanco graneado', true, 100, true),
('Porción Papas Fritas', 12.00, 'cocina', 'Papas bastón crocantes', true, 100, true),
('Ensalada Mixta', 10.00, 'cocina', 'Lechuga, tomate y cebolla', true, 80, true);

-- TIPO: BEBIDAS (BAR)
INSERT INTO public.products (nombre, precio, area, descripcion, controla_stock, stock_actual, disponible) VALUES
('Coca Cola 2L', 25.00, 'bar', 'Botella retornable', true, 48, true),
('Coca Cola Personal', 8.00, 'bar', 'Botella vidrio 300ml', true, 50, true),
('Fanta Naranja 2L', 25.00, 'bar', 'Botella retornable', true, 24, true),
('Sprite 2L', 25.00, 'bar', 'Botella retornable', true, 24, true),
('Cerveza Huari', 22.00, 'bar', 'Botella 620ml', true, 120, true),
('Cerveza Paceña Macanuda', 28.00, 'bar', 'Botella 710ml', true, 120, true),
('Jugo del Valle (Durazno)', 15.00, 'bar', 'Cartón 1L', true, 30, true),
('Agua Vital (Sin Gas)', 8.00, 'bar', 'Botella 500ml', true, 60, true),
('Agua Vital (Con Gas)', 8.00, 'bar', 'Botella 500ml', true, 60, true);

-- TIPO: TRAGOS (BAR)
INSERT INTO public.products (nombre, precio, area, descripcion, controla_stock, stock_actual, disponible) VALUES
('Fernet Branca (Vaso)', 25.00, 'bar', 'Preparado con Coca Cola', true, 100, true),
('Chuflay Singani', 20.00, 'bar', 'Singani con Ginger Ale y Limón', true, 100, true);
