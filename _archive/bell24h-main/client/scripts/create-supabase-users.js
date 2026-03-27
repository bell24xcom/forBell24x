const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zxwfvvkdsgmrambmugkz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDemoUsers() {
  try {
    console.log('👥 Creating demo users in Supabase...');

    // Demo users to create
    const demoUsers = [
      {
        email: 'demo@bell24h.com',
        password: 'demo123',
        user_metadata: {
          role: 'buyer',
          company_name: 'Demo Buyer Corp',
          name: 'Demo Buyer'
        }
      },
      {
        email: 'supplier@bell24h.com',
        password: 'supplier123',
        user_metadata: {
          role: 'supplier',
          company_name: 'Demo Supplier Corp',
          name: 'Demo Supplier'
        }
      },
      {
        email: 'admin@bell24h.com',
        password: 'admin123',
        user_metadata: {
          role: 'admin',
          company_name: 'Bell24h Admin',
          name: 'Demo Admin'
        }
      }
    ];

    for (const user of demoUsers) {
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: user.user_metadata
        });

        if (error) {
          console.error(`❌ Failed to create ${user.email}:`, error.message);
        } else {
          console.log(`✅ Created user: ${user.email}`);
        }
      } catch (err) {
        console.error(`❌ Error creating ${user.email}:`, err.message);
      }
    }

    console.log('🎉 Demo users creation completed!');
  } catch (error) {
    console.error('❌ Error in createDemoUsers:', error);
  }
}

// Run the script
createDemoUsers(); 
