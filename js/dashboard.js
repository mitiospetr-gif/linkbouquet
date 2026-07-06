// ===== ЛИЧНЫЙ КАБИНЕТ =====

document.addEventListener('DOMContentLoaded', initDashboard);

async function initDashboard() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = '/login.html';
        return;
    }

    await loadProfile(user);
    await loadBouquets(user.id);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', signOut);
}

async function loadProfile(user) {
    const displayNameEl = document.getElementById('displayName');
    const userEmailEl = document.getElementById('userEmail');

    if (userEmailEl) userEmailEl.textContent = user.email;

    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const name = profile?.display_name || user.email.split('@')[0];
    if (displayNameEl) displayNameEl.textContent = name;
}

async function loadBouquets(userId) {
    const container = document.getElementById('bouquetsList');
    const emptyState = document.getElementById('emptyState');
    const statsTotal = document.getElementById('statsTotal');
    const statsViews = document.getElementById('statsViews');

    if (!container) return;

    try {
        const { data: bouquets, error } = await supabaseClient
            .from('bouquets')
            .select('*')
            .eq('created_by', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!bouquets || bouquets.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            if (statsTotal) statsTotal.textContent = '0';
            if (statsViews) statsViews.textContent = '0';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        if (statsTotal) statsTotal.textContent = bouquets.length;

        const totalViews = bouquets.reduce((sum, b) => sum + (b.view_count || 0), 0);
        if (statsViews) statsViews.textContent = totalViews;

        container.innerHTML = bouquets.map(b => createCard(b)).join('');

        // Обработчики
        container.querySelectorAll('.btn-copy-link').forEach(btn => {
            btn.addEventListener('click', e => copyToClipboard(e.currentTarget.dataset.url));
        });

        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', e => deleteBouquet(e.currentTarget.dataset.id));
        });

        container.querySelectorAll('.btn-share').forEach(btn => {
            btn.addEventListener('click', e => {
                shareContent({
                    title: 'LinkBouquet',
                    text: e.currentTarget.dataset.title,
                    url: e.currentTarget.dataset.url
                });
            });
        });

    } catch (err) {
        console.error('Error:', err);
        showToast('Ошибка загрузки букетов', 'error');
    }
}

function createCard(b) {
    const url = `${window.location.origin}/gift.html?id=${b.short_id}`;
    const img = `images/bouquets/${b.bouquet_style}.webp`;

    return `
        <div class="bouquet-card">
            <div class="bouquet-card-image">
                <img src="${img}" alt="${esc(b.greeting_text || 'Букет')}" loading="lazy">
            </div>
            <div class="bouquet-card-content">
                <h4 class="bouquet-card-title">${esc(b.greeting_text?.substring(0, 30) || 'Букет')}${b.greeting_text?.length > 30 ? '...' : ''}</h4>
                <p class="bouquet-card-text">${esc(b.greeting_text?.substring(0, 60) || '')}${b.greeting_text?.length > 60 ? '...' : ''}</p>
                <div class="bouquet-card-meta">
                    <span>👁 ${b.view_count || 0}</span>
                    <span>${formatDate(b.created_at)}</span>
                </div>
                <div class="bouquet-card-actions">
                    <button class="btn-card btn-copy-link" data-url="${url}" title="Копировать">📋</button>
                    <button class="btn-card btn-share" data-url="${url}" data-title="${esc(b.greeting_text || 'Букет')}" title="Поделиться">📤</button>
                    <button class="btn-card btn-delete" data-id="${b.id}" title="Удалить">🗑️</button>
                </div>
            </div>
        </div>
    `;
}

function esc(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
}

async function deleteBouquet(id) {
    if (!confirm('Удалить букет?')) return;

    try {
        const { error } = await supabaseClient
            .from('bouquets')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showToast('Букет удалён');
        const user = await getCurrentUser();
        await loadBouquets(user.id);

    } catch (err) {
        showToast('Ошибка удаления', 'error');
    }
}

window.deleteBouquet = deleteBouquet;