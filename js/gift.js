// ===== СТРАНИЦА ПОДАРКА =====

const giftBgImage = document.getElementById('giftBgImage');
const greetingText = document.getElementById('greetingText');
const youtubeBtn = document.getElementById('youtubeBtn');
const yandexBtn = document.getElementById('yandexBtn');
const mp3Btn = document.getElementById('mp3Btn');
const linksContainer = document.getElementById('linksContainer');
const authorText = document.getElementById('authorText');

async function loadGift() {
    const urlParams = new URLSearchParams(window.location.search);
    const shortId = urlParams.get('id');
    
    if (!shortId) {
        showToast('Букет не найден', 'error');
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
            return;
        }
        
        // Увеличиваем счётчик просмотров
        await supabaseClient.rpc('increment_view_count_by_short_id', { sid: shortId });
        
        // Устанавливаем фон
        if (data.custom_image_url) {
            // Кастомное изображение (AI или загруженное)
            giftBgImage.src = data.custom_image_url;
        } else if (data.bouquet_style && data.bouquet_style !== 'custom') {
            // Готовый стиль из галереи
            giftBgImage.src = `images/bouquets/${data.bouquet_style}.webp`;
        } else {
            // По умолчанию
            giftBgImage.src = 'images/bouquets/romantic1.webp';
        }
        
        // Текст поздравления
        greetingText.textContent = data.greeting_text || 'Для тебя!';
        
        // Ссылки — проверяем и показываем только существующие
        let hasLinks = false;
        
        if (data.youtube_link) {
            youtubeBtn.href = data.youtube_link;
            youtubeBtn.style.display = 'flex';
            hasLinks = true;
        } else {
            youtubeBtn.style.display = 'none';
        }
        
        if (data.yandex_link) {
            yandexBtn.href = data.yandex_link;
            yandexBtn.style.display = 'flex';
            hasLinks = true;
        } else {
            yandexBtn.style.display = 'none';
        }
        
        if (data.mp3_link) {
            mp3Btn.href = data.mp3_link;
            mp3Btn.style.display = 'flex';
            hasLinks = true;
        } else {
            mp3Btn.style.display = 'none';
        }
        
        // Если нет ссылок вообще
        if (!hasLinks) {
            linksContainer.style.display = 'none';
        }
        
        // Автор
        if (data.created_by) {
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('full_name')
                .eq('id', data.created_by)
                .single();
            
            if (profile?.full_name) {
                authorText.textContent = `От ${profile.full_name}`;
            }
        }
        
    } catch (err) {
        console.error('Error loading gift:', err);
        showToast('Ошибка загрузки букета', 'error');
    }
}

// Загружаем при открытии страницы
loadGift();
