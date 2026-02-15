-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE supplier_status AS ENUM ('pending', 'active', 'suspended', 'blacklisted');
CREATE TYPE compliance_status AS ENUM ('pending', 'verified', 'expired', 'rejected');
CREATE TYPE document_type AS ENUM ('certification', 'license', 'insurance', 'financial', 'other');

-- Create suppliers table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    registration_number VARCHAR(100),
    status supplier_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMPTZ,
    CONSTRAINT unique_tax_id UNIQUE (tax_id),
    CONSTRAINT unique_registration_number UNIQUE (registration_number)
);

-- Create supplier_addresses table
CREATE TABLE supplier_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    address_type VARCHAR(50) NOT NULL,
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create supplier_contacts table
CREATE TABLE supplier_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    position VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_email UNIQUE (email)
);

-- Create supplier_documents table
CREATE TABLE supplier_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    status compliance_status DEFAULT 'pending',
    expiry_date DATE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create supplier_categories table
CREATE TABLE supplier_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES supplier_categories(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create supplier_category_mappings table
CREATE TABLE supplier_category_mappings (
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    category_id UUID REFERENCES supplier_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (supplier_id, category_id)
);

-- Create supplier_performance_metrics table
CREATE TABLE supplier_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    measurement_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create supplier_audit_logs table
CREATE TABLE supplier_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    performed_by UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_suppliers_company_name ON suppliers(company_name);
CREATE INDEX idx_supplier_documents_status ON supplier_documents(status);
CREATE INDEX idx_supplier_documents_expiry ON supplier_documents(expiry_date);
CREATE INDEX idx_supplier_performance_metrics_date ON supplier_performance_metrics(measurement_date);
CREATE INDEX idx_supplier_audit_logs_date ON supplier_audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_addresses_updated_at
    BEFORE UPDATE ON supplier_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_contacts_updated_at
    BEFORE UPDATE ON supplier_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_documents_updated_at
    BEFORE UPDATE ON supplier_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_categories_updated_at
    BEFORE UPDATE ON supplier_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_performance_metrics_updated_at
    BEFORE UPDATE ON supplier_performance_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 