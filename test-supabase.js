const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://vqirisbdwkrzqsofqtlb.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxaXJpc2Jkd2tyenFzb2ZxdGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNzkxMDQsImV4cCI6MjA5Njk1NTEwNH0.HK3rn1CGT2xeoOETPNji9jHUkqosFruZyflZ5M4PvP4");
async function test() {
  const { data, error } = await supabase.from('tracks').select('title');
  if (error) console.error(error);
  console.log("Tracks in Supabase:", data.map(t => t.title));
}
test();
