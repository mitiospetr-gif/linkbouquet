// Инициализация Supabase клиента
const supabaseClient = supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey
);

window.supabaseClient = supabaseClient;
