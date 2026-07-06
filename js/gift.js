// ===== СТРАНИЦА ПОДАРКА =====

document.addEventListener('DOMContentLoaded', loadGift);

async function loadGift() {
    const urlParams = new URLSearchParams(window.location.search);
    const shortId = urlParams.get('id');
    const encodedData = urlParams.get('data');

    if (!shortId && !encodedData) {
        showError('Ссылка недействительна');
        return;
    }

    // Старые ссылки (обратная совместимость)
    if (encodedData) {
        try {
            const decoded = base64URLDecode(encodedData);
            const data = JSON.parse(decoded);
            displayGiftLegacy(data);
            return;
        } catch (e) {
            showError('Ссылка повреждена');
            return;
        }
    }

    // Новые ссылки через Supabase
    try {
        await supabaseClient.rpc('increment_view_count_by_short_id', { sid: shortId });
        
        const { data, error } = await supabaseClient
            .from('bouquets')
            .select('*')
            .eq('short_id', shortId)
            .single();

        if (error || !data) {
            showError('Букет не найден');
            return;
        }

        displayGift(data);
        
        await supabaseClient.from('bouquet_views').insert({
            bouquet_id: data.id,
            user_agent: navigator.userAgent
        });

    } catch (err) {
        console.error('Error:', err);
        showError('Ошибка загрузки');
    }
}

function displayGift(data) {
    // Устанавливаем фон
    const bgImg = document.getElementById('giftBgImage');
    if (bgImg) {
        bgImg.src = `images/bouquets/${data.bouquet_style}.webp`;
    }

    document.title = `🌸 Букет для тебя - LinkBouquet`;

    const greetingText = document.getElementById('greetingText');
    if (greetingText && data.greeting_text) {
        greetingText.textContent = data.greeting_text;
    }

    const youtubeBtn = document.getElementById('youtubeBtn');
    if (youtubeBtn) {
        if (data.youtube_link) {
            youtubeBtn.href = data.youtube_link;
            youtubeBtn.style.display = 'flex';
        } else {
            youtubeBtn.style.display = 'none';
        }
    }

    const yandexBtn = document.getElementById('yandexBtn');
    if (yandexBtn) {
        if (data.yandex_link) {
            yandexBtn.href = data.yandex_link;
            yandexBtn.style.display = 'flex';
        } else {
            yandexBtn.style.display = 'none';
        }
    }

    const mp3Btn = document.getElementById('mp3Btn');
    if (mp3Btn) {
        if (data.mp3_link) {
            mp3Btn.href = data.mp3_link;
            mp3Btn.style.display = 'flex';
        } else {
            mp3Btn.style.display = 'none';
        }
    }

    const authorText = document.getElementById('authorText');
    if (authorText && data.author) {
        authorText.textContent = data.author;
    } else if (authorText) {
        authorText.style.display = 'none';
    }
}

function displayGiftLegacy(data) {
    const bgImg = document.getElementById('giftBgImage');
    if (bgImg) {
        bgImg.src = `images/bouquets/${data.bouquetStyle || 'romantic1'}.webp`;
    }

    document.title = `🌸 Букет для тебя - LinkBouquet`;

    const greetingText = document.getElementById('greetingText');
    if (greetingText && data.greetingText) {
        greetingText.textContent = data.greetingText;
    }

    const youtubeBtn = document.getElementById('youtubeBtn');
    if (youtubeBtn) {
        if (data.youtubeLink) {
            youtubeBtn.href = data.youtubeLink;
            youtubeBtn.style.display = 'flex';
        } else {
            youtubeBtn.style.display = 'none';
        }
    }

    const yandexBtn = document.getElementById('yandexBtn');
    if (yandexBtn) {
        if (data.yandexLink) {
            yandexBtn.href = data.yandexLink;
            yandexBtn.style.display = 'flex';
        } else {
            yandexBtn.style.display = 'none';
        }
    }

    const mp3Btn = document.getElementById('mp3Btn');
    if (mp3Btn) mp3Btn.style.display = 'none';

    const authorText = document.getElementById('authorText');
    if (authorText && data.author) {
        authorText.textContent = data.author;
    } else if (authorText) {
        authorText.style.display = 'none';
    }
}

function base64URLDecode(str) {
    const padding = '='.repeat((4 - str.length % 4) % 4);
    const base64 = (str + padding)
        .replace(/\-/g, '+')
        .replace(/\_/g, '/');
    return decodeURIComponent(atob(base64));
}

function showError(msg) {
    const container = document.querySelector('.gift-container');
    if (container) {
        container.innerHTML = `
            <div class="gift-card" style="text-align:center;padding:60px 40px;">
                <span style="font-size:3rem;display:block;margin-bottom:16px;">😔</span>
                <h2 style="font-family:'Playfair Display',serif;margin-bottom:16px;">Ошибка</h2>
                <p style="color:var(--text-secondary);margin-bottom:24px;">${msg}</p>
                <a href="/" class="btn-create" style="display:inline-block;text-decoration:none;">Создать новый букет</a>
            </div>
        `;
    }
}