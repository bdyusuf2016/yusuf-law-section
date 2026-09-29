-- ==============================================================================
-- প্রতিষ্ঠান-ভিত্তিক মামলা ব্যবস্থাপনা ও রাজস্ব ড্যাশবোর্ড
-- PRODUCTION DATABASE SCHEMA (PostgreSQL)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ১. প্রতিষ্ঠান পরিচিতি ও প্রোফাইল টেবিল
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    address TEXT,
    bond_license_no VARCHAR(100),
    bin VARCHAR(50),
    circle VARCHAR(20) NOT NULL,
    audit_status VARCHAR(50) DEFAULT 'অডিট অপেক্ষমান',
    audit_year VARCHAR(50),
    commercial_manager_name VARCHAR(150),
    commercial_manager_mobile VARCHAR(50),
    commercial_manager_email VARCHAR(100),
    officer_aro VARCHAR(150),
    officer_ro VARCHAR(150),
    officer_ac_dc VARCHAR(150),
    officer_jc_adc VARCHAR(150),
    arrears_taka NUMERIC(18, 2) DEFAULT 0.00,
    arrears_crore NUMERIC(12, 4) DEFAULT 0.0000,
    linked_case_nos TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ২. কর্মকর্তা ডিরেক্টরি টেবিল
CREATE TABLE IF NOT EXISTS officers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    designation VARCHAR(20) NOT NULL, -- 'ARO', 'RO', 'AC', 'DC', 'JC', 'ADC'
    designation_bangla VARCHAR(100) NOT NULL,
    mobile VARCHAR(50),
    email VARCHAR(100),
    room_no VARCHAR(50),
    assigned_circles TEXT[] DEFAULT '{}',
    assigned_company_ids TEXT[] DEFAULT '{}',
    assigned_company_names TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৩. সার্কেল অ্যাসাইনমেন্ট টেবিল
CREATE TABLE IF NOT EXISTS circle_assignments (
    circle VARCHAR(20) PRIMARY KEY,
    circle_name VARCHAR(100),
    aro_name VARCHAR(150),
    ro_name VARCHAR(150),
    ac_dc_name VARCHAR(150),
    jc_adc_name VARCHAR(150),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৪. মামলা ব্যবস্থাপনা টেবিল
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sl_no INT,
    company_name VARCHAR(255) NOT NULL,
    court_type VARCHAR(100) NOT NULL,
    case_no VARCHAR(150) NOT NULL,
    legal_section VARCHAR(100),
    disputed_amount_taka NUMERIC(18, 2) DEFAULT 0.00,
    disputed_amount_crore NUMERIC(12, 4) DEFAULT 0.0000,
    realized_amount_taka NUMERIC(18, 2) DEFAULT 0.00,
    realized_amount_crore NUMERIC(12, 4) DEFAULT 0.0000,
    current_status VARCHAR(100) NOT NULL,
    last_hearing_date DATE,
    next_hearing_date DATE,
    court_bench VARCHAR(150),
    assigned_lawyer VARCHAR(150),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৫. শুনানির নোটিশ টেবিল
CREATE TABLE IF NOT EXISTS hearing_notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id VARCHAR(100),
    company_name VARCHAR(255) NOT NULL,
    company_address TEXT,
    circle VARCHAR(20) NOT NULL,
    hearing_date DATE NOT NULL,
    hearing_time VARCHAR(50),
    hearing_room VARCHAR(100),
    hearing_type VARCHAR(100),
    memo_no VARCHAR(150),
    subject TEXT,
    hearing_authority VARCHAR(150),
    officer_aro VARCHAR(150),
    officer_ro VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৬. কারণ দর্শাও নোটিশ ও বিচারাদেশ টেবিল
CREATE TABLE IF NOT EXISTS scn_and_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id VARCHAR(100),
    company_name VARCHAR(255) NOT NULL,
    circle VARCHAR(20) NOT NULL,
    scn_no VARCHAR(150) NOT NULL,
    scn_issue_date DATE,
    demand_amount_taka NUMERIC(18, 2) DEFAULT 0.00,
    order_no VARCHAR(150),
    order_date DATE,
    adjudicated_revenue_taka NUMERIC(18, 2) DEFAULT 0.00,
    adjudicated_fine_taka NUMERIC(18, 2) DEFAULT 0.00,
    total_adjudicated_taka NUMERIC(18, 2) DEFAULT 0.00,
    realized_amount_taka NUMERIC(18, 2) DEFAULT 0.00,
    outstanding_amount_taka NUMERIC(18, 2) DEFAULT 0.00,
    order_status VARCHAR(50) DEFAULT 'বিচারাদেশ অপেক্ষমান',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৭. সার্কেল টাস্ক ও চেকলিস্ট টেবিল
CREATE TABLE IF NOT EXISTS circle_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    circle VARCHAR(20) NOT NULL,
    company_id VARCHAR(100),
    company_name VARCHAR(255),
    due_date DATE,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    assigned_to VARCHAR(150),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৮. সার্কেল রিমাইন্ডার টেবিল
CREATE TABLE IF NOT EXISTS circle_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    circle VARCHAR(20) NOT NULL,
    company_id VARCHAR(100),
    company_name VARCHAR(255),
    date DATE NOT NULL,
    time VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'medium',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ইনডেক্সসমূহ
CREATE INDEX IF NOT EXISTS idx_companies_circle ON companies(circle);
CREATE INDEX IF NOT EXISTS idx_cases_court ON cases(court_type);
CREATE INDEX IF NOT EXISTS idx_officers_desig ON officers(designation);
