// ===== ГЛАВНАЯ: СОЗДАНИЕ БУКЕТА =====

const form = document.getElementById('bouquetForm');
const resultPreview = document.getElementById('resultPreview');
const placeholderPreview = document.getElementById('placeholderPreview');
const giftLink = document.getElementById('giftLink');
const copyBtn = document.getElementById('copyBtn');
const openBtn = document.getElementById('openBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const qrContainer = document.getElementById('qrContainer');
const bgStyle = document.getElementById('bgStyle');
const step2Preview = document.getElementById('step2Preview');
const heroBgImg = document.getElementById('heroBgImg');

// Обновление превью фона при выборе
if (bgStyle) {
    bgStyle.addEventListener('change', (e) => {
        const style = e.target.value;
        if (step2Preview) {
            step2Preview.src = `images/bouquets/${style}.webp`;
        }
        if (heroBgImg) {
            heroBgImg.src = `images/bouquets/${style}.webp`;
        }
    });
}

// Выбор фона из карточек
document.querySelectorAll('.bg-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.bg-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const bg = card.dataset.bg;
        if (bgStyle) bgStyle.value = bg;
        if (step2Preview) step2Preview.src = `images/bouquets/${bg}.webp`;
        if (heroBgImg) heroBgImg.src = `images/bouquets/${bg}.webp`;
    });
});

if (form) {
    form.addEventListener('submit', handleFormSubmit);
}

if (copyBtn) {
    copyBtn.addEventListener('click', () => copyToClipboard(giftLink.textContent));
}

if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => copyToClipboard(giftLink.textContent));
}

if (openBtn) {
    openBtn.addEventListener('click', () => window.open(giftLink.textContent, '_blank'));
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = form.querySelector('.btn-create');
    setLoading(submitBtn, true);

    const youtubeLink = document.getElementById('youtubeLink').value.trim();
    const yandexLink = document.getElementById('yandexLink').value.trim();
    const mp3Link = document.getElementById('mp3Link').value.trim();

    if (!youtubeLink && !yandexLink && !mp3Link) {
        showToast('Добавьте хотя бы одну ссылку', 'error');
        setLoading(submitBtn, false);
        return;
    }

    const bouquetData = {
        greeting_text: document.getElementById('greetingText').value.trim(),
        youtube_link: youtubeLink || null,
        yandex_link: yandexLink || null,
        mp3_link: mp3Link || null,
        bouquet_style: bgStyle ? bgStyle.value : 'romantic1',
        short_id: generateShortId()
    };

    try {
        const { data, error } = await supabaseClient
            .from('bouquets')
            .insert(bouquetData)
            .select()
            .single();

        if (error) throw error;

        const url = `${window.location.origin}/gift.html?id=${data.short_id}`;
        
        giftLink.textContent = url;
        placeholderPreview.style.display = 'none';
        resultPreview.style.display = 'flex';
        
        if (qrContainer) {
            generateQRCode(url, 'qrContainer');
        }

        showToast('Букет создан! 🌸');

    } catch (err) {
        console.error('Error:', err);
        showToast('Ошибка: ' + err.message, 'error');
    } finally {
        setLoading(submitBtn, false);
    }
}

function generateShortId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// AI генерация (заглушка)
const aiGenerateBtn = document.getElementById('aiGenerateBtn');
if (aiGenerateBtn) {
    aiGenerateBtn.addEventListener('click', () => {
        const prompt = document.getElementById('aiPrompt').value;
        if (!prompt) {
            showToast('Введите описание для генерации', 'error');
            return;
        }
        showToast('AI генерация скоро будет доступна! ✨', 'info');
    });
}
