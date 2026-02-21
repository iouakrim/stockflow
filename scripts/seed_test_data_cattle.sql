-- Script de génération de données de test pour StockFlow Pro - Spécialisé Aliment de Bétail
-- Tenant ID: 04c81dfa-aaf1-4ca3-b958-8509893c5a9e
-- User ID: d061b61b-4b93-47b3-83a2-7063e0566e90

DO $$ 
DECLARE 
    v_tenant_id UUID := '04c81dfa-aaf1-4ca3-b958-8509893c5a9e';
    v_user_id UUID := 'd061b61b-4b93-47b3-83a2-7063e0566e90';
    v_depot_1 UUID := 'c4ce1708-b7b2-408b-9eee-a18b3103fbaf'; -- Dépot principal
    v_depot_2 UUID;
    v_depot_3 UUID;
    
    v_sup_alfsahel UUID;
    v_sup_koudijs UUID;
    v_sup_provimi UUID;

    v_prod_vache UUID;
    v_prod_mouton UUID;
    v_prod_poussin UUID;
    v_prod_mais UUID;
    v_prod_orge UUID;
    v_prod_luzerne UUID;
BEGIN
    -- 1. Création de dépôts supplémentaires (S'ils n'existent pas déjà ou pour varier)
    INSERT INTO warehouses (tenant_id, name, address) 
    VALUES (v_tenant_id, 'Centre de Distribution Doukkala', 'Sidi Bennour, Zone Agricole')
    RETURNING id INTO v_depot_2;

    INSERT INTO warehouses (tenant_id, name, address) 
    VALUES (v_tenant_id, 'Hub Logistique Oriental', 'Berkane, Route d''Oujda')
    RETURNING id INTO v_depot_3;

    -- Mise à jour des accès
    UPDATE profiles 
    SET warehouse_access = warehouse_access || ARRAY[v_depot_2, v_depot_3]::UUID[]
    WHERE id = v_user_id;

    -- 2. Insertion des Fournisseurs (Spécialistes Aliments)
    INSERT INTO suppliers (tenant_id, name, contact_name, email, phone, category)
    VALUES (v_tenant_id, 'Alf Sahel', 'Hassan Benjelloun', 'contact@alfsahel.ma', '+212 522-445566', 'Aliments Composés')
    RETURNING id INTO v_sup_alfsahel;

    INSERT INTO suppliers (tenant_id, name, contact_name, email, phone, category)
    VALUES (v_tenant_id, 'Koudijs Morocco', 'Jan de Vries', 'service@koudijs.ma', '+212 537-889900', 'Concentrés & Premix')
    RETURNING id INTO v_sup_koudijs;

    INSERT INTO suppliers (tenant_id, name, contact_name, email, phone, category)
    VALUES (v_tenant_id, 'Provimi Cargill', 'Yassine Mansouri', 'y_mansouri@provimi.com', '+212 523-332211', 'Nutrition Animale')
    RETURNING id INTO v_sup_provimi;

    -- 3. Insertion des Produits (Aliments Bétail)
    -- Vaches Laitières
    INSERT INTO products (tenant_id, supplier_id, name, description, category, cost_price, selling_price, unit, barcode, sku)
    VALUES (v_tenant_id, v_sup_alfsahel, 'Aliment Vache Laitière 18%', 'Aliment complet pour haute production laitière', 'Bovins', 4.80, 5.90, 'kg', '700100200300', 'ALIM-VL-18')
    RETURNING id INTO v_prod_vache;

    -- Engraissement Moutons
    INSERT INTO products (tenant_id, supplier_id, name, description, category, cost_price, selling_price, unit, barcode, sku)
    VALUES (v_tenant_id, v_sup_alfsahel, 'Aliment Engraissement Moutons', 'Spécial Aïd et abattage', 'Ovins', 4.20, 5.40, 'kg', '700400500600', 'ALIM-MT-ENG')
    RETURNING id INTO v_prod_mouton;

    -- Volaille démarrage
    INSERT INTO products (tenant_id, supplier_id, name, description, category, cost_price, selling_price, unit, barcode, sku)
    VALUES (v_tenant_id, v_sup_provimi, 'Poussin Démarrage (Sacs 50kg)', 'Aliment premier âge riche en protéines', 'Aviculture', 280.00, 365.00, 'un', '700700800900', 'VOL-DEM-50')
    RETURNING id INTO v_prod_poussin;

    -- Matières premières
    INSERT INTO products (tenant_id, supplier_id, name, description, category, cost_price, selling_price, unit, barcode, sku)
    VALUES (v_tenant_id, v_sup_koudijs, 'Maïs Grain Concassé', 'Maïs importé haute qualité', 'Matières Premières', 3.80, 4.60, 'kg', '700999000111', 'MP-MAIS-C')
    RETURNING id INTO v_prod_mais;

    INSERT INTO products (tenant_id, supplier_id, name, description, category, cost_price, selling_price, unit, barcode, sku)
    VALUES (v_tenant_id, v_sup_koudijs, 'Orge Nettoyée', 'Orge locale pour chevaux et bétail', 'Matières Premières', 3.50, 4.25, 'kg', '700222333444', 'MP-ORGE-N')
    RETURNING id INTO v_prod_orge;

    INSERT INTO products (tenant_id, supplier_id, name, description, category, cost_price, selling_price, unit, barcode, sku)
    VALUES (v_tenant_id, v_sup_provimi, 'Luzerne Déshydratée (Bottes)', 'Fourrage compressé haute valeur nutritive', 'Fourrage', 150.00, 210.00, 'un', '700555666777', 'FR-LUZ-B')
    RETURNING id INTO v_prod_luzerne;

    -- 4. Initialisation du Stock (Volumes importants typiques du secteur)
    -- Dépôt 1 (Souvent proche des ports/villes)
    INSERT INTO warehouse_stock (tenant_id, warehouse_id, product_id, stock_quantity, low_stock_threshold)
    VALUES 
        (v_tenant_id, v_depot_1, v_prod_mais, 85000, 5000),
        (v_tenant_id, v_depot_1, v_prod_orge, 60000, 4000),
        (v_tenant_id, v_depot_1, v_prod_vache, 15000, 1000);

    -- Dépôt 2 (Doukkala - Zone d'élevage intensive)
    INSERT INTO warehouse_stock (tenant_id, warehouse_id, product_id, stock_quantity, low_stock_threshold)
    VALUES 
        (v_tenant_id, v_depot_2, v_prod_vache, 45000, 3000),
        (v_tenant_id, v_depot_2, v_prod_mouton, 20000, 2000),
        (v_tenant_id, v_depot_2, v_prod_luzerne, 800, 100);

    -- Dépôt 3 (Oriental - Zone avicole et ovine)
    INSERT INTO warehouse_stock (tenant_id, warehouse_id, product_id, stock_quantity, low_stock_threshold)
    VALUES 
        (v_tenant_id, v_depot_3, v_prod_poussin, 1200, 200),
        (v_tenant_id, v_depot_3, v_prod_mouton, 35000, 3000),
        (v_tenant_id, v_depot_3, v_prod_mais, 25000, 2000);

    RAISE NOTICE 'JDD Aliment de Bétail inséré avec succès.';
END $$;
