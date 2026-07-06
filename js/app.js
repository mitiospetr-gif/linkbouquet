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
    
    // Проверяем авторизацию
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        showToast('Пожалуйста, войдите в систему', 'error');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);
        return;
    }
    
    const submitBtn = form.querySelector('.btn-create');
    setLoading(submitBtn, true);

    const greetingText = document.getElementById('greetingText').value.trim();
    const youtubeLink = document.getElementById('youtubeLink').value.trim();
    const yandexLink = document.getElementById('yandexLink').value.trim();
    const mp3Link = document.getElementById('mp3Link').value.trim();

    if (!youtubeLink && !yandexLink && !mp3Link) {
        showToast('Добавьте хотя бы одну ссылку', 'error');
        setLoading(submitBtn, false);
        return;
    }

    const bouquetData = {
        title: greetingText || 'Букет без названия',
        url: youtubeLink || yandexLink || mp3Link || 'https://example.com',
        description: greetingText,
        greeting_text: greetingText,
        youtube_link: youtubeLink || null,
        yandex_link: yandexLink || null,
        mp3_link: mp3Link || null,
        bouquet_style: bgStyle ? bgStyle.value : 'romantic1',
        short_id: generateShortId(),
        created_by: user.id
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

// ===== AI ГЕНЕРАЦИЯ, ЗАГРУЗКА И ГАЛЕРЕЯ =====

const aiGenerateBtn = document.getElementById('aiGenerateBtn');
const aiPrompt = document.getElementById('aiPrompt');
const bgUpload = document.getElementById('bgUpload');
const uploadPreview = document.getElementById('uploadPreview');
const uploadedImage = document.getElementById('uploadedImage');
const useUploadedBtn = document.getElementById('useUploadedBtn');

// AI генерация через Pollinations.ai
if (aiGenerateBtn) {
    aiGenerateBtn.addEventListener('click', async () => {
        const prompt = aiPrompt.value.trim();
        if (!prompt) {
            showToast('Введите описание для генерации', 'error');
            return;
        }
        
        setLoading(aiGenerateBtn, true);
        
        try {
            const encodedPrompt = encodeURIComponent(`beautiful flower bouquet, ${prompt}, professional photography, high quality, soft lighting`);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;
            
            // Предзагрузка изображения
            const img = new Image();
            img.onload = () => {
                if (step2Preview) step2Preview.src = imageUrl;
                if (heroBgImg) heroBgImg.src = imageUrl;
                if (bgStyle) bgStyle.value = 'custom';
                
                window.customBgImage = imageUrl;
                window.generatedAiImage = imageUrl;
                
                // Снимаем выделение с галереи
                document.querySelectorAll('.ai-result').forEach(el => el.classList.remove('selected'));
                
                showToast('AI фон сгенерирован! ✨', 'success');
                setLoading(aiGenerateBtn, false);
            };
            img.onerror = () => {
                showToast('Ошибка загрузки AI изображения', 'error');
                setLoading(aiGenerateBtn, false);
            };
            img.src = imageUrl;
            
        } catch (err) {
            console.error('AI Error:', err);
            showToast('Ошибка генерации, попробуйте позже', 'error');
            setLoading(aiGenerateBtn, false);
        }
    });
}

// Загрузка файла
if (bgUpload) {
    bgUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            showToast('Файл слишком большой (макс 5MB)', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            uploadedImage.src = event.target.result;
            uploadPreview.style.display = 'block';
            window.uploadedBgImage = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

if (useUploadedBtn) {
    useUploadedBtn.addEventListener('click', () => {
        if (window.uploadedBgImage) {
            if (step2Preview) step2Preview.src = window.uploadedBgImage;
            if (heroBgImg) heroBgImg.src = window.uploadedBgImage;
            if (bgStyle) bgStyle.value = 'custom';
            
            window.customBgImage = window.uploadedBgImage;
            
            // Снимаем выделение с галереи
            document.querySelectorAll('.ai-result').forEach(el => el.classList.remove('selected'));
            
            showToast('Загруженный фон применён! 🎨', 'success');
        }
    });
}

// Выбор из галереи
document.querySelectorAll('.ai-result').forEach(item => {
    item.addEventListener('click', () => {
        // Снимаем выделение со всех
        document.querySelectorAll('.ai-result').forEach(el => el.classList.remove('selected'));
        // Выделяем текущий
        item.classList.add('selected');
        
        const bg = item.dataset.bg;
        if (step2Preview) step2Preview.src = `images/bouquets/${bg}.webp`;
        if (heroBgImg) heroBgImg.src = `images/bouquets/${bg}.webp`;
        if (bgStyle) bgStyle.value = bg;
        
        window.customBgImage = null;
        window.generatedAiImage = null;
    });
});
