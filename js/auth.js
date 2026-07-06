// ===== АВТОРИЗАЦИЯ =====

function getSupabase() {
    if (typeof window !== 'undefined' && window.supabaseClient) {
        return window.supabaseClient;
    }
    console.error('Supabase client not found!');
    return null;
}

async function signInWithGoogle() {
    const sb = getSupabase();
    if (!sb) return;
    
    const { data, error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/dashboard.html`
        }
    });
    if (error) showToast(error.message, 'error');
}

async function signInWithEmail(email, password) {
    const sb = getSupabase();
    if (!sb) return false;
    
    const { data, error } = await sb.auth.signInWithPassword({
        email,
        password
    });
    if (error) {
        showToast(error.message, 'error');
        return false;
    }
    return true;
}

async function signUpWithEmail(email, password) {
    const sb = getSupabase();
    if (!sb) return false;
    
    const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${window.location.origin}/dashboard.html`
        }
    });
    if (error) {
        showToast(error.message, 'error');
        return false;
    }
    showToast('Проверьте почту для подтверждения!');
    return true;
}

async function signOut() {
    const sb = getSupabase();
    if (!sb) return;
    
    const { error } = await sb.auth.signOut();
    if (error) {
        showToast(error.message, 'error');
        return;
    }
    window.location.href = '/';
}

async function getCurrentUser() {
    const sb = getSupabase();
    if (!sb) return null;
    
    const { data: { user } } = await sb.auth.getUser();
    return user;
}

function initAuthListener() {
    const sb = getSupabase();
    if (!sb) return;
    
    sb.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            updateAuthUI(session?.user);
        } else if (event === 'SIGNED_OUT') {
            updateAuthUI(null);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthListener);
} else {
    initAuthListener();
}

function updateAuthUI(user) {
    document.querySelectorAll('.auth-btn').forEach(btn => {
        if (user) {
            btn.textContent = '👤 Личный кабинет';
            btn.href = '/dashboard.html';
        } else {
            btn.textContent = '🔐 Войти';
            btn.href = '/login.html';
        }
    });
}

window.signInWithGoogle = signInWithGoogle;
window.signInWithEmail = signInWithEmail;
window.signUpWithEmail = signUpWithEmail;
window.signOut = signOut;
window.getCurrentUser = getCurrentUser;
window.updateAuthUI = updateAuthUI;
