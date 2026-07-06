// ===== УТИЛИТЫ =====

function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function generateQRCode(url, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    container.innerHTML = `<img src="${qrUrl}" alt="QR Code" style="width:150px;height:150px;display:block;">`;
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Скопировано!');
        return true;
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Скопировано!');
        return true;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function shareContent(data) {
    if (navigator.share) {
        try {
            await navigator.share(data);
        } catch (err) {
            if (err.name !== 'AbortError') console.error('Share failed:', err);
        }
    } else {
        copyToClipboard(data.url);
    }
}

function setLoading(element, loading) {
    if (loading) {
        element.dataset.originalText = element.textContent;
        element.innerHTML = '<span class="spinner"></span> Загрузка...';
        element.disabled = true;
    } else {
        element.textContent = element.dataset.originalText || element.textContent;
        element.disabled = false;
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

window.showToast = showToast;
window.generateQRCode = generateQRCode;
window.copyToClipboard = copyToClipboard;
window.formatDate = formatDate;
window.shareContent = shareContent;
window.setLoading = setLoading;
window.isValidUrl = isValidUrl;