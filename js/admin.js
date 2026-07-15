// ===== АДМИН-ПАНЕЛЬ: СОЗДАНИЕ БУКЕТОВ =====

const ADMIN_EMAIL = 'mitiospetr@gmail.com';

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

// Проверка авторизации
document.addEventListener('DOMContentLoaded', async () => {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = '/login.html?redirect=/admin.html';
        return;
    }
    if (user.email !== ADMIN_EMAIL) {
        showToast('Доступ запрещён', 'error');
        setTimeout(() => window.location.href = '/', 2000);
        return;
    }
    const displayNameEl = document.getElementById('displayName');
    const userEmailEl = document.getElementById('userEmail');
    if (displayNameEl) displayNameEl.textContent = 'Администратор';
    if (userEmailEl) userEmailEl.textContent = user.email;
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', signOut);
});

if (bgStyle) {
    bgStyle.addEventListener('change', (e) => {
        const style = e.target.value;
        if (style === 'custom') return;
        if (step2Preview) step2Preview.src = `images/bouquets/${style}.webp`;
        window.customBgImage = null;
        window.generatedAiImage = null;
    });
}

if (form) form.addEventListener('submit', handleFormSubmit);
if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(giftLink.textContent));
if (copyLinkBtn) copyLinkBtn.addEventListener('click', () => copyToClipboard(giftLink.textContent));
if (openBtn) openBtn.addEventListener('click', () => window.open(giftLink.textContent, '_blank'));

async function handleFormSubmit(e) {
    e.preventDefault();
    const user = await getCurrentUser();
    if (!user || user.email !== ADMIN_EMAIL) {
        showToast('Доступ запрещён', 'error');
        return;
    }
    const submitBtn = form.querySelector('.btn-create');
    setLoading(submitBtn, true);

    const greetingText = document.getElementById('greetingText').value.trim();
        const youtubeLink = document.getElementById('youtubeLink').value.trim();
    const yandexLink = document.getElementById('yandexLink').value.trim();
    const mp3Link = document.getElementById('mp3Link').value.trim();

    if (!greetingText) {
        showToast('Введите текст поздравления', 'error');
        setLoading(submitBtn, false);
        return;
    }
    if (!youtubeLink && !yandexLink && !mp3Link) {
        showToast('Добавьте хотя бы одну ссылку', 'error');
        setLoading(submitBtn, false);
        return;
    }

    let selectedStyle = bgStyle ? bgStyle.value : 'romantic1';
    let customImageUrl = null;
    if (window.customBgImage || window.generatedAiImage) {
        customImageUrl = window.customBgImage || window.generatedAiImage;
        selectedStyle = 'custom';
    }

    // Минимальный набор полей — только то, что точно есть в таблице
    const bouquetData = {
        title: greetingText.substring(0, 100) || 'Букет',
        greeting_text: greetingText,
        youtube_link: youtubeLink || null,
        yandex_link: yandexLink || null,
        mp3_link: mp3Link || null,
        bouquet_style: selectedStyle,
        custom_image_url: customImageUrl,
        short_id: generateShortId(),
        created_by: user.id
    };

    // Добавляем recipient_name только если поле существует

    console.log('[Admin] Sending data:', bouquetData);

    try {
        const { data, error } = await supabaseClient
            .from('bouquets')
            .insert(bouquetData)
            .select();

        console.log('[Admin] Response:', { data, error });

        if (error) {
            console.error('[Admin] ERROR DETAILS:', JSON.stringify(error, null, 2));
            showToast('Ошибка базы: ' + error.message + ' (' + error.code + ')', 'error');
            setLoading(submitBtn, false);
            return;
        }

        if (!data || data.length === 0) {
            showToast('Ошибка: данные не сохранены', 'error');
            setLoading(submitBtn, false);
            return;
        }

        const created = data[0];
        const url = `${window.location.origin}/gift.html?id=${created.short_id}`;

        giftLink.textContent = url;
        placeholderPreview.style.display = 'none';
        resultPreview.style.display = 'flex';

        if (qrContainer) generateQRCode(url, 'qrContainer');

        showToast('Букет создан! 🌸');
        form.reset();

    } catch (err) {
        console.error('[Admin] Catch error:', err);
        showToast('Ошибка: ' + (err.message || 'Неизвестная ошибка'), 'error');
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

// ===== AI ГЕНЕРАЦИЯ И ЗАГРУЗКА =====
const aiGenerateBtn = document.getElementById('aiGenerateBtn');
const aiPrompt = document.getElementById('aiPrompt');
const bgUpload = document.getElementById('bgUpload');
const uploadPreview = document.getElementById('uploadPreview');
const uploadedImage = document.getElementById('uploadedImage');
const useUploadedBtn = document.getElementById('useUploadedBtn');

if (aiGenerateBtn) {
    aiGenerateBtn.addEventListener('click', async () => {
        const prompt = aiPrompt.value.trim();
        if (!prompt) { showToast('Введите описание', 'error'); return; }
        setLoading(aiGenerateBtn, true);
        try {
            const encodedPrompt = encodeURIComponent(`beautiful flower bouquet, ${prompt}, professional photography`);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;
            const img = new Image();
            img.onload = () => {
                if (step2Preview) step2Preview.src = imageUrl;
                if (bgStyle) {
                    let customOption = bgStyle.querySelector('option[value="custom"]');
                    if (!customOption) {
                        customOption = document.createElement('option');
                        customOption.value = 'custom';
                        customOption.textContent = '🎨 AI/Загруженный';
                        bgStyle.appendChild(customOption);
                    }
                    bgStyle.value = 'custom';
                }
                window.generatedAiImage = imageUrl;
                window.customBgImage = null;
                showToast('AI фон сгенерирован! ✨', 'success');
                setLoading(aiGenerateBtn, false);
            };
            img.onerror = () => {
                showToast('Ошибка загрузки AI', 'error');
                setLoading(aiGenerateBtn, false);
            };
            img.src = imageUrl;
        } catch (err) {
            showToast('Ошибка генерации', 'error');
            setLoading(aiGenerateBtn, false);
        }
    });
}

if (bgUpload) {
    bgUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showToast('Файл > 5MB', 'error'); return; }
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
            if (bgStyle) {
                let customOption = bgStyle.querySelector('option[value="custom"]');
                if (!customOption) {
                    customOption = document.createElement('option');
                    customOption.value = 'custom';
                    customOption.textContent = '🎨 AI/Загруженный';
                    bgStyle.appendChild(customOption);
                }
                bgStyle.value = 'custom';
            }
            window.customBgImage = window.uploadedBgImage;
            window.generatedAiImage = null;
            showToast('Фон применён! 🎨', 'success');
        }
    });
}

window.generateShortId = generateShortId;
