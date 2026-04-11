# ЖУРБА MUSIC - Музичний Лейбл

Вебзастосунок для музичного лейблу з динамічними полями, модерацією та статистикою.

## Технології
- React (Vite)
- Tailwind CSS
- Prisma + PostgreSQL
- Zustand (State Management)
- Recharts (Analytics)

## Деплой на Vercel

1. Створіть проект на Vercel та підключіть репозиторій.
2. Додайте **Vercel Postgres** (Storage -> Create Database).
3. Додайте змінні оточення:
   - `DATABASE_URL`: (автоматично додається Vercel Postgres)
   - `JWT_SECRET`: будь-який довгий рядок для безпеки.
4. У налаштуваннях проекту встановіть команду збірки:
   `prisma generate && prisma db push && vite build`

## Початкові дані (Seed)
Для створення адміна та базових налаштувань виконайте:
`npx prisma db seed`

**Демо дані:**
- Логін: `admin`
- Пароль: `admin2`