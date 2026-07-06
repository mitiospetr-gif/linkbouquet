// ===== АВТОРИЗАЦИЯ =====

// Используем глобальный supabaseClient из supabase.js

async function signInWithGoogle() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/dashboard.html`
        }
    });
    if (error) showToast(error.message, 'error');
}

async function signInWithEmail(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
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
    const { data, error } = await supabaseClient.auth.signUp({
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
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        showToast(error.message, 'error');
        return;
    }
    window.location.href = '/';
}

async function getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        updateAuthUI(session?.user);
    } else if (event === 'SIGNED_OUT') {
        updateAuthUI(null);
    }
});

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
