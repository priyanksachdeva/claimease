import pool from "./connection.js";

export async function initializeDatabase() {
  try {
    // Test connection
    const client = await pool.connect();
    console.log("✅ Database connected");
    client.release();

    // Run migrations
    await runMigrations();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

async function runMigrations() {
  try {
    const client = await pool.connect();

    // Create ENUM types
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('patient', 'hospital', 'insurance');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE claim_status AS ENUM ('submitted', 'verification', 'processing', 'approved', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE bill_category AS ENUM ('lab', 'medicine', 'consultation', 'surgery', 'diagnostic', 'other');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role user_role NOT NULL,
        org_id UUID,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Organizations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        registration_number VARCHAR(255) UNIQUE NOT NULL,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        logo_url VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insurance Policies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS insurance_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        insurance_org_id UUID NOT NULL REFERENCES organizations(id),
        policy_number VARCHAR(255) UNIQUE NOT NULL,
        plan_name VARCHAR(255) NOT NULL,
        total_coverage DECIMAL(12, 2) NOT NULL,
        used_coverage DECIMAL(12, 2) DEFAULT 0,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Bills table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        hospital_org_id UUID NOT NULL REFERENCES organizations(id),
        title VARCHAR(255) NOT NULL,
        category bill_category NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        bill_date DATE NOT NULL,
        document_urls TEXT[],
        status VARCHAR(50) DEFAULT 'submitted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Claims table
    await client.query(`
      CREATE TABLE IF NOT EXISTS claims (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        insurance_org_id UUID NOT NULL REFERENCES organizations(id),
        hospital_org_id UUID NOT NULL REFERENCES organizations(id),
        claim_number VARCHAR(255) UNIQUE NOT NULL,
        total_amount DECIMAL(12, 2) NOT NULL,
        status claim_status DEFAULT 'submitted',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified_at TIMESTAMP,
        approved_at TIMESTAMP,
        rejected_at TIMESTAMP,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Claim Events (timeline) table
    await client.query(`
      CREATE TABLE IF NOT EXISTS claim_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
        status claim_status NOT NULL,
        notes TEXT,
        created_by UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NOT NULL REFERENCES users(id),
        recipient_id UUID,
        organization_id UUID,
        claim_id UUID REFERENCES claims(id) ON DELETE SET NULL,
        subject VARCHAR(255),
        body TEXT NOT NULL,
        attachment_urls TEXT[],
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
      CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
      CREATE INDEX IF NOT EXISTS idx_bills_hospital_org_id ON bills(hospital_org_id);
      CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
      CREATE INDEX IF NOT EXISTS idx_claims_insurance_org_id ON claims(insurance_org_id);
      CREATE INDEX IF NOT EXISTS idx_claims_hospital_org_id ON claims(hospital_org_id);
      CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
      CREATE INDEX IF NOT EXISTS idx_policies_user_id ON insurance_policies(user_id);
      CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
    `);

    console.log("✅ All migrations completed");
    client.release();
  } catch (error) {
    console.error("❌ Migration error:", error);
    throw error;
  }
}

export default runMigrations;
