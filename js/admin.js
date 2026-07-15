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

// Проверка авторизации и прав админа
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Admin] Page loaded, checking auth...');

    const user = await getCurrentUser();
    console.log('[Admin] User:', user ? user.email : 'none');

    if (!user) {
        console.log('[Admin] No user, redirecting to login...');
        window.location.href = '/login.html?redirect=/admin.html';
        return;
    }

    if (user.email !== ADMIN_EMAIL) {
        console.log('[Admin] Access denied for:', user.email);
        showToast('Доступ запрещён. Только администратор может создавать букеты.', 'error');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
        return;
    }

    console.log('[Admin] Access granted for admin:', user.email);

    const displayNameEl = document.getElementById('displayName');
    const userEmailEl = document.getElementById('userEmail');
    if (displayNameEl) displayNameEl.textContent = 'Администратор';
    if (userEmailEl) userEmailEl.textContent = user.email;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', signOut);
});

// Обновление превью фона при выборе
if (bgStyle) {
    bgStyle.addEventListener('change', (e) => {
        const style = e.target.value;
        if (style === 'custom') return;
        if (step2Preview) {
            step2Preview.src = `images/bouquets/${style}.webp`;
        }
        window.customBgImage = null;
        window.generatedAiImage = null;
    });
}

if (form) {
    form.addEventListener('submit', handleFormSubmit);
    console.log('[Admin] Form submit listener attached');
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
    console.log('[Admin] Form submitted');

    const user = await getCurrentUser();
    console.log('[Admin] Current user:', user ? user.email : 'none');

    if (!user || user.email !== ADMIN_EMAIL) {
        showToast('Доступ запрещён', 'error');
        return;
    }

    const submitBtn = form.querySelector('.btn-create');
    setLoading(submitBtn, true);

    const greetingText = document.getElementById('greetingText').value.trim();
    const recipientName = document.getElementById('recipientName').value.trim();
    const youtubeLink = document.getElementById('youtubeLink').value.trim();
    const yandexLink = document.getElementById('yandexLink').value.trim();
    const mp3Link = document.getElementById('mp3Link').value.trim();

    console.log('[Admin] Form data:', { greetingText, recipientName, youtubeLink, yandexLink, mp3Link });

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

    const bouquetData = {
        title: greetingText.substring(0, 50) || 'Букет',
        description: greetingText,
        greeting_text: greetingText,
        recipient_name: recipientName || null,
        youtube_link: youtubeLink || null,
        yandex_link: yandexLink || null,
        mp3_link: mp3Link || null,
        bouquet_style: selectedStyle,
        custom_image_url: customImageUrl,
        short_id: generateShortId(),
        created_by: user.id,
        is_public: true
    };

    console.log('[Admin] Inserting data:', bouquetData);

    try {
        const { data, error } = await supabaseClient
            .from('bouquets')
            .insert(bouquetData)
            .select()
            .single();

        console.log('[Admin] Insert result:', { data, error });

        if (error) {
            console.error('[Admin] Insert error:', error);
            throw error;
        }

        if (!data || !data.short_id) {
            throw new Error('No data returned from insert');
        }

        const url = `${window.location.origin}/gift.html?id=${data.short_id}`;
        console.log('[Admin] Generated URL:', url);

        giftLink.textContent = url;
        placeholderPreview.style.display = 'none';
        resultPreview.style.display = 'flex';

        if (qrContainer) {
            generateQRCode(url, 'qrContainer');
        }

        showToast('Букет создан! 🌸 Отправьте ссылку получателю.');
        form.reset();

    } catch (err) {
        console.error('[Admin] Error:', err);
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
        if (!prompt) {
            showToast('Введите описание для генерации', 'error');
            return;
        }

        setLoading(aiGenerateBtn, true);

        try {
            const encodedPrompt = encodeURIComponent(`beautiful flower bouquet, ${prompt}, professional photography, high quality, soft lighting`);
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

            showToast('Загруженный фон применён! 🎨', 'success');
        }
    });
}

window.generateShortId = generateShortId;
