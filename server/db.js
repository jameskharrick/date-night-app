const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    'Warning: SUPABASE_URL or SUPABASE_SERVICE_KEY is not set. Database calls will fail until these are configured in server/.env'
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
