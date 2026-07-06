// Инициализация Supabase клиента
const { createClient } = supabase;

const supabaseClient = createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey
);

window.supabaseClient = supabaseClient;