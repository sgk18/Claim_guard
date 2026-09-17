-- ============================================================
-- CLAIMGUARD — SUPABASE SEED DATA
-- Seed: supabase/seed/seed.sql
-- ============================================================

-- Insert Primary Company
INSERT INTO public.companies (id, name, gstin, currency)
VALUES ('e7b1a2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'Apex Logistics & Field Solutions India Pvt Ltd', '29AAACI1681G1ZS', 'INR')
ON CONFLICT (id) DO NOTHING;

-- Insert Employees
INSERT INTO public.employees (id, company_id, name, email, phone, role, department, historical_claim_count, historical_claim_avg)
VALUES 
('11111111-1111-1111-1111-111111111102', 'e7b1a2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'Rahul Kumar', 'rahul.k@apexlogistics.in', '+919876543210', 'Senior Field Sales Executive', 'South Sales', 38, 1650.00),
('11111111-1111-1111-1111-111111111103', 'e7b1a2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'Amit Verma', 'amit.v@apexlogistics.in', '+919876543211', 'Territory Service Engineer', 'Field Engineering', 45, 1950.00),
('11111111-1111-1111-1111-111111111104', 'e7b1a2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'Sneha Patel', 'sneha.p@apexlogistics.in', '+919876543212', 'Client Account Manager', 'West Sales', 29, 2200.00),
('11111111-1111-1111-1111-111111111105', 'e7b1a2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'Vikram Singh', 'vikram.s@apexlogistics.in', '+919876543213', 'Fleet Maintenance Inspector', 'Fleet Operations', 52, 1800.00),
('11111111-1111-1111-1111-111111111106', 'e7b1a2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'Pooja Reddy', 'pooja.r@apexlogistics.in', '+919876543214', 'Site Operations Supervisor', 'Site Deployment', 31, 1400.00)
ON CONFLICT (id) DO NOTHING;

-- Insert Policies
INSERT INTO public.policies (id, company_id, category, max_single_claim, daily_cap, requires_gstin, description)
VALUES 
('22222222-2222-2222-2222-222222222201', 'e7b1a2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'fuel', 5000.00, 6000.00, true, 'Daily fuel limit for field transit. Max Rs 5,000 per receipt with valid GSTIN.'),
('22222222-2222-2222-2222-222222222202', 'e7b1a2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'food', 1200.00, 2000.00, false, 'Daily food and meal allowance on business travel. Max Rs 1,200 per receipt.'),
('22222222-2222-2222-2222-222222222203', 'e7b1a2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'travel', 8000.00, 10000.00, true, 'Inter-city bus/train/taxi travel vouchers. Max Rs 8,000 with authorized ticket.')
ON CONFLICT (id) DO NOTHING;

-- Insert Benchmark Trips
INSERT INTO public.trips (id, employee_id, title, origin, destination, start_date, end_date, status)
VALUES 
('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111102', 'Bengaluru to Mysuru Regional Tour', 'Bengaluru', 'Mysuru', '2026-09-15', '2026-09-19', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Insert Key Benchmark Claim (Duplicate comparison target CLM-3902)
INSERT INTO public.claims (id, company_id, employee_id, status, amount, currency, category, vendor_name, claim_date, gstin)
VALUES ('CLM-3902', 'e7b1a2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c', '11111111-1111-1111-1111-111111111103', 'APPROVED', 3850.00, 'INR', 'fuel', 'Indian Oil Corporation Ltd', '2026-08-14', '29AAACI1681G1ZS')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.receipts (id, claim_id, file_url, file_name, mime_type, file_size, image_hash, ocr_confidence)
VALUES ('44444444-4444-4444-4444-444444444401', 'CLM-3902', '/receipts/demo_indian_oil.jpg', 'amit_fuel_aug14.jpg', 'image/jpeg', 312500, 'hash_dup_ioc_3850', '{"amount": 0.99, "vendorName": 0.98}'::jsonb)
ON CONFLICT (id) DO NOTHING;
