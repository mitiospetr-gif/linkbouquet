# 🌸 LinkBouquet v2

Музыкальные букеты с настроением. Создавайте красивые цифровые открытки с фото-фонами и делитесь ими.

## 🚀 Быстрый старт

### 1. Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. В SQL Editor выполните скрипты из `sql/` по порядку

### 2. Конфигурация

В `js/config.js` замените:
- `url` — Project URL из Supabase
- `anonKey` — `anon` public key

### 3. Изображения

Поместите фото букетов в `images/`:
- `romantic.jpg` — розовые пионы
- `moody.jpg` — тёплые тона
- `dark.jpg` — тёмный фон
- `white.jpg` — белые цветы
- `lavender.jpg` — лаванда
- `vibrant.jpg` — яркий микс

### 4. Деплой

```bash
# Vercel
npm i -g vercel
vercel