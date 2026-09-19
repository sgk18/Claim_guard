-- ============================================================
-- CLAIMGUARD — SUPABASE SEED DATA
-- Organization: ABC Technologies Pvt Ltd (Join Code: CG-7K4P9X)
-- ============================================================

-- 1. Create Organization
INSERT INTO public.organizations (id, name, slug, gstin, currency)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'ABC Technologies Pvt Ltd',
    'abc-tech',
    '27AABCA1234F1Z5',
    'INR'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create Profiles
-- Manager: Priya Sharma
INSERT INTO public.profiles (id, full_name, email, phone)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'Priya Sharma',
    'priya.sharma@abctech.example.com',
    '+919876543210'
) ON CONFLICT (id) DO NOTHING;

-- Employee 1: Rahul Kumar
INSERT INTO public.profiles (id, full_name, email, phone)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    'Rahul Kumar',
    'rahul.kumar@abctech.example.com',
    '+919812345678'
) ON CONFLICT (id) DO NOTHING;

-- Employee 2: Ananya Patel
INSERT INTO public.profiles (id, full_name, email, phone)
VALUES (
    'b0000000-0000-0000-0000-000000000003',
    'Ananya Patel',
    'ananya.patel@abctech.example.com',
    '+919823456789'
) ON CONFLICT (id) DO NOTHING;

-- 3. Create Organization Memberships
INSERT INTO public.organization_members (organization_id, user_id, role, department, status)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'MANAGER', 'Finance & Operations', 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'EMPLOYEE', 'Field Sales', 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'EMPLOYEE', 'Logistics', 'ACTIVE')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 4. Create Active Join Code
INSERT INTO public.join_codes (id, organization_id, code, status, max_uses, times_used, expires_at, created_by)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'CG-7K4P9X',
    'ACTIVE',
    100,
    2,
    NOW() + INTERVAL '30 days',
    'b0000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- 5. Policies
INSERT INTO public.policies (organization_id, category, max_single_claim, daily_cap, requires_gstin, description)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'MEALS', 1500.00, 3000.00, true, 'Daily field client meal allowance'),
    ('a0000000-0000-0000-0000-000000000001', 'FUEL', 3000.00, 5000.00, true, 'Fuel and toll expenses'),
    ('a0000000-0000-0000-0000-000000000001', 'HOTEL', 5000.00, 7500.00, true, 'Tier-2/Tier-3 city accommodation')
ON CONFLICT DO NOTHING;

-- 6. Sample Claims
-- Claim 1: Verified Low Risk Meal Claim
INSERT INTO public.claims (id, organization_id, employee_id, status, amount, currency, category, vendor_name, claim_date, gstin)
VALUES (
    'CLM-4471',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'PENDING',
    1240.00,
    'INR',
    'MEALS',
    'Haldirams Restaurant Pune',
    '2026-09-18',
    '27AABCH1234A1Z1'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.receipts (id, claim_id, file_url, file_name, mime_type, file_size, image_hash, raw_ocr_text, ocr_confidence, line_items)
VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'CLM-4471',
    'https://storage.claimguard.internal/receipts/CLM-4471.jpg',
    'haldirams_pune_20260918.jpg',
    'image/jpeg',
    342120,
    'a1b2c3d4e5f60718',
    'HALDIRAMS RESTAURANT PUNE\nGSTIN: 27AABCH1234A1Z1\nDate: 18/09/2026\nThali Meal: INR 850\nBeverages: INR 200\nCGST 2.5%: INR 26.25\nSGST 2.5%: INR 26.25\nTotal: INR 1240.00',
    '{"vendor": 0.98, "total": 0.99, "gstin": 0.96, "date": 0.95}'::jsonb,
    '[{"item": "Thali Meal", "qty": 2, "rate": 425.00, "amount": 850.00}, {"item": "Beverages", "qty": 2, "rate": 100.00, "amount": 200.00}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.risk_assessments (id, claim_id, score, level, authenticity_state, recommended_action, summary, ai_narrative, rules_triggered)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'CLM-4471',
    12,
    'LOW',
    'VERIFIED',
    'APPROVE',
    'Valid GSTIN, matching line items, amount within policy allowance.',
    'Receipt details from Haldirams Restaurant Pune verified cleanly. Tax calculations match Maharashtra state CGST/SGST rules. No duplicate hashes detected.',
    '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_logs (organization_id, claim_id, actor_type, actor_id, actor_name, action, details)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'CLM-4471',
    'EMPLOYEE',
    'b0000000-0000-0000-0000-000000000002',
    'Rahul Kumar',
    'CLAIM_SUBMITTED',
    '{"amount": 1240.00, "vendor": "Haldirams Restaurant Pune", "category": "MEALS"}'::jsonb
) ON CONFLICT DO NOTHING;
