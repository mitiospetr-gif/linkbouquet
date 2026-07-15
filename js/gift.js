// ===== СТРАНИЦА ПОДАРКА (ПУБЛИЧНАЯ) =====
// Получатель НЕ должен быть авторизован

const giftBgImage = document.getElementById('giftBgImage');
const giftTitle = document.getElementById('giftTitle');
const greetingText = document.getElementById('greetingText');
const youtubeBtn = document.getElementById('youtubeBtn');
const yandexBtn = document.getElementById('yandexBtn');
const mp3Btn = document.getElementById('mp3Btn');
const linksContainer = document.getElementById('linksContainer');
const authorText = document.getElementById('authorText');

const BASE_URL = window.location.origin;

async function loadGift() {
    const urlParams = new URLSearchParams(window.location.search);
    const shortId = urlParams.get('id');

    if (!shortId) {
        showToast('Букет не найден', 'error');
        document.querySelector('.gift-card').innerHTML = `
            <div style="text-align:center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">😕</div>
                <h2 style="color: #e8edf5; margin-bottom: 1rem;">Открытка не найдена</h2>
                <p style="color: #8a9bb8;">Проверьте ссылку или обратитесь к автору</p>
                <a href="/" style="display:inline-block; margin-top: 1.5rem; color: var(--primary);">На главную →</a>
            </div>
        `;
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('bouquets')
            .select('*')
            .eq('short_id', shortId)
            .single();

        if (error || !data) {
            showToast('Букет не найден', 'error');
            document.querySelector('.gift-card').innerHTML = `
                <div style="text-align:center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">😕</div>
                    <h2 style="color: #e8edf5; margin-bottom: 1rem;">Открытка не найдена</h2>
                    <p style="color: #8a9bb8;">Возможно, ссылка устарела или была удалена</p>
                    <a href="/" style="display:inline-block; margin-top: 1.5rem; color: var(--primary);">На главную →</a>
                </div>
            `;
            return;
        }

        // Увеличиваем счётчик просмотров (не требует авторизации)
        try {
            await supabaseClient.rpc('increment_view_count_by_short_id', { sid: shortId });
        } catch (e) {
            // Игнорируем ошибку счётчика
            console.log('View count update failed (non-critical)');
        }

        // Устанавливаем фон
        if (data.custom_image_url) {
            giftBgImage.src = data.custom_image_url;
        } else if (data.bouquet_style && data.bouquet_style !== 'custom') {
            giftBgImage.src = `${BASE_URL}/images/bouquets/${data.bouquet_style}.webp`;
        } else {
            giftBgImage.src = `${BASE_URL}/images/bouquets/romantic1.webp`;
        }

        // Заголовок с именем получателя
        if (data.recipient_name) {
            giftTitle.textContent = `${data.recipient_name}!`;
        } else {
            giftTitle.textContent = 'Для тебя!';
        }

        // Текст поздравления
        greetingText.textContent = data.greeting_text || 'Для тебя!';

        // Ссылки — показываем только существующие
        let hasLinks = false;

        if (data.youtube_link && isValidUrl(data.youtube_link)) {
            youtubeBtn.href = data.youtube_link;
            youtubeBtn.style.display = 'flex';
            hasLinks = true;
        } else {
            youtubeBtn.style.display = 'none';
        }

        if (data.yandex_link && isValidUrl(data.yandex_link)) {
            yandexBtn.href = data.yandex_link;
            yandexBtn.style.display = 'flex';
            hasLinks = true;
        } else {
            yandexBtn.style.display = 'none';
        }

        if (data.mp3_link && isValidUrl(data.mp3_link)) {
            mp3Btn.href = data.mp3_link;
            mp3Btn.style.display = 'flex';
            hasLinks = true;
        } else {
            mp3Btn.style.display = 'none';
        }

        if (!hasLinks) {
            linksContainer.style.display = 'none';
        } else {
            linksContainer.style.display = 'flex';
        }

        // Автор (опционально)
        if (data.created_by) {
            try {
                const { data: profile } = await supabaseClient
                    .from('profiles')
                    .select('full_name')
                    .eq('id', data.created_by)
                    .single();

                if (profile?.full_name) {
                    authorText.textContent = `От ${profile.full_name}`;
                } else {
                    authorText.style.display = 'none';
                }
            } catch (e) {
                authorText.style.display = 'none';
            }
        } else {
            authorText.style.display = 'none';
        }

    } catch (err) {
        console.error('Error loading gift:', err);
        showToast('Ошибка загрузки букета', 'error');
        document.querySelector('.gift-card').innerHTML = `
            <div style="text-align:center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">😔</div>
                <h2 style="color: #e8edf5; margin-bottom: 1rem;">Не удалось загрузить открытку</h2>
                <p style="color: #8a9bb8;">Попробуйте обновить страницу позже</p>
                <a href="/" style="display:inline-block; margin-top: 1.5rem; color: var(--primary);">На главную →</a>
            </div>
        `;
    }
}

// Загружаем при открытии страницы
loadGift();
