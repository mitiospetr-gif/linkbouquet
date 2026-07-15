// ===== АВТОРИЗАЦИЯ (ТОЛЬКО ВХОД) =====
// Регистрация отключена — только админ входит

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
            btn.textContent = '👤 Админ';
            btn.href = '/dashboard.html';
        } else {
            btn.textContent = '🔐 Войти как автор';
            btn.href = '/login.html';
        }
    });
}

window.signInWithEmail = signInWithEmail;
window.signOut = signOut;
window.getCurrentUser = getCurrentUser;
