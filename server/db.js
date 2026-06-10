const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    'Warning: SUPABASE_URL or SUPABASE_SERVICE_KEY is not set. Database calls will fail until these are configured in server/.env'
  );
}

// Node < 22 lacks native WebSocket support, which @supabase/supabase-js's
// realtime client requires at construction time even though we don't use it.
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  realtime: {
    transport: WebSocket,
  },
});

module.exports = supabase;
