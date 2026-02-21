CREATE OR REPLACE FUNCTION process_sale(
  p_tenant_id UUID,
  p_cashier_id UUID,
  p_customer_id UUID,
  p_payment_method text,
  p_items JSONB, -- Array of {product_id, quantity, unit_price, total_price}
  p_discount DECIMAL(12, 2) DEFAULT 0.0
) RETURNS UUID AS $$
DECLARE
  v_sale_id UUID;
  v_subtotal DECIMAL(12, 2) := 0;
  v_total DECIMAL(12, 2) := 0;
  v_item JSONB;
  v_receipt_number TEXT;
  v_stock_quantity INT;
BEGIN
  -- Generate receipt number
  v_receipt_number := 'RCP-' || to_char(NOW(), 'YYYYMMDDHH24MISS');

  -- Calculate subtotal
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_subtotal := v_subtotal + (v_item->>'total_price')::DECIMAL;
  END LOOP;

  -- Calculate grand total (subtotal minus discount)
  v_total := v_subtotal - p_discount;
  IF v_total < 0 THEN
      v_total := 0;
  END IF;

  -- Create sale
  INSERT INTO sales (tenant_id, receipt_number, customer_id, cashier_id, subtotal, discount, total, amount_paid, payment_method)
  VALUES (p_tenant_id, v_receipt_number, p_customer_id, p_cashier_id, v_subtotal, p_discount, v_total, v_total, p_payment_method::payment_method)
  RETURNING id INTO v_sale_id;

  -- Process items and update stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Verify stock
    SELECT stock_quantity INTO v_stock_quantity FROM products WHERE id = (v_item->>'product_id')::UUID AND tenant_id = p_tenant_id FOR UPDATE;
    
    IF v_stock_quantity < (v_item->>'quantity')::INT THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item->>'product_id';
    END IF;

    -- Insert sale item
    INSERT INTO sale_items (tenant_id, sale_id, product_id, quantity, unit_price, total_price)
    VALUES (
      p_tenant_id, 
      v_sale_id, 
      (v_item->>'product_id')::UUID, 
      (v_item->>'quantity')::INT, 
      (v_item->>'unit_price')::DECIMAL, 
      (v_item->>'total_price')::DECIMAL
    );

    -- Reduce product stock
    UPDATE products 
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INT 
    WHERE id = (v_item->>'product_id')::UUID AND tenant_id = p_tenant_id;

    -- Record stock movement
    INSERT INTO stock_movements (tenant_id, product_id, type, quantity, reference_id, created_by)
    VALUES (
      p_tenant_id,
      (v_item->>'product_id')::UUID,
      'sale'::movement_type,
      -(v_item->>'quantity')::INT,
      v_sale_id,
      p_cashier_id
    );
  END LOOP;

  -- Update customer credit if it's a credit sale
  IF p_payment_method = 'credit' AND p_customer_id IS NOT NULL THEN
    UPDATE customers 
    SET credit_balance = credit_balance + v_total 
    WHERE id = p_customer_id AND tenant_id = p_tenant_id;
  END IF;

  RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;