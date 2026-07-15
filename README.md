LinkBouquet — Музыкальные букеты с настроением
Сервис для создания и отправки персональных музыкальных открыток. Автор (администратор) создаёт красивые букеты с текстом, ссылками на YouTube, Яндекс.Диск и MP3. Получатели просматривают открытки по ссылке без регистрации.
________________________________________
Архитектура
Роль	Что может
Администратор	Создавать, редактировать, удалять букеты. Доступ к admin-панели.
Получатель	Только просматривать открытку по ссылке. Не может создавать.
________________________________________
Страницы
Страница	Назначение	Доступ
/	Публичная витрина — примеры букетов	Все
/gift.html?id=XXX	Просмотр открытки	Все (без авторизации)
/login.html	Вход для администратора	Все
/admin.html	Создание нового букета	Только админ
/dashboard.html	Список всех букетов админа	Только админ
________________________________________
Технологии
•	Frontend: HTML, CSS, Vanilla JS
•	Backend/DB: Supabase (PostgreSQL + Auth)
•	Хостинг: Vercel
•	AI-генерация фонов: Pollinations.ai
•	QR-коды: qrserver.com API
________________________________________
Структура проекта
linkbouquet/
├── index.html              # Публичная витрина
├── admin.html              # Создание букетов (только админ)
├── dashboard.html          # Список букетов админа
├── gift.html               # Просмотр открытки
├── login.html              # Вход для администратора
├── vercel.json             # Маршруты Vercel
├── css/
│   └── style.css           # Стили
├── js/
│   ├── config.js           # Supabase конфигурация
│   ├── supabase.js         # Инициализация клиента
│   ├── utils.js            # Утилиты (toast, QR, clipboard)
│   ├── auth.js             # Авторизация (только вход)
│   ├── admin.js            # Логика создания букетов
│   ├── dashboard.js        # Логика списка букетов
│   └── gift.js             # Просмотр без авторизации
└── images/
    └── bouquets/           # Фоновые изображения
________________________________________
Настройка
1. Supabase
1.	Создайте проект в Supabase
2.	Создайте таблицу bouquets:
CREATE TABLE bouquets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    title text NOT NULL,
    url text NOT NULL,
    description text,
    greeting_text text,
    youtube_link text,
    yandex_link text,
    mp3_link text,
    bouquet_style text DEFAULT 'romantic1',
    custom_image_url text,
    short_id text UNIQUE NOT NULL,
    created_by uuid REFERENCES auth.users(id),
    view_count integer DEFAULT 0,
    is_public boolean DEFAULT true
);
3.	Включите RLS и создайте политики:
ALTER TABLE bouquets ENABLE ROW LEVEL SECURITY;

-- Функция проверки админа
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email = 'YOUR_EMAIL@gmail.com'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;

-- Политики
CREATE POLICY "Public read" ON bouquets FOR SELECT USING (true);
CREATE POLICY "Admin insert" ON bouquets FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update" ON bouquets FOR UPDATE USING (created_by = auth.uid() AND is_admin());
CREATE POLICY "Admin delete" ON bouquets FOR DELETE USING (created_by = auth.uid() AND is_admin());
4.	Создайте функцию для счётчика просмотров:
CREATE OR REPLACE FUNCTION increment_view_count_by_short_id(sid text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE bouquets SET view_count = view_count + 1 WHERE short_id = sid;
END;
$$;
2. Настройка email администратора
В файлах js/admin.js и js/dashboard.js замените:
const ADMIN_EMAIL = 'YOUR_EMAIL@gmail.com';
3. Vercel
1.	Подключите репозиторий к Vercel
2.	Загрузите все файлы проекта
3.	Проверьте vercel.json — маршруты настроены
________________________________________
Использование
Для администратора
1.	Перейдите на /login.html
2.	Войдите под своим email (только админ имеет доступ)
3.	Нажмите «Создать новый» → заполните форму
4.	Получите ссылку вида: https://yoursite.com/gift.html?id=AbCdEfGh
5.	Отправьте ссылку получателю
Для получателя
1.	Открывает ссылку — видит красивую открытку
2.	Нажимает на ссылки (YouTube, Яндекс.Диск, MP3)
3.	Не может создать свою открытку — только просмотр
________________________________________
Функции
•	✅ Создание открыток с текстом и ссылками
•	✅ 6 готовых фонов + AI-генерация + загрузка своего
•	✅ QR-код для каждой открытки
•	✅ Счётчик просмотров
•	✅ Адаптивный дизайн (мобильные/десктоп)
•	✅ Тёмная тема
•	✅ Работа без регистрации для получателей
________________________________________
Лицензия
MIT
