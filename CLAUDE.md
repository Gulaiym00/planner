# Планер Бипа

Ежедневный планер с 3D-роботом Бипом. Структура проекта, API и запуск описаны в README.md — сверяйся с ним, а при изменении API или структуры обновляй его.

- `backend/` — Express 5 + TypeScript (ESM) + PostgreSQL через Prisma 7, валидация zod. Порт 4000.
- `frontend/` — Next.js 15 (App Router) + React 19 + TypeScript + CSS Modules + SWR + three.js / react-three-fiber. Порт 3000.

## Общие правила

- Отвечай и пиши комментарии по-русски. Тексты интерфейса — тоже на русском.
- Окружение — Windows (PowerShell). Пути и команды пиши с учётом этого.
- Не читай и не выводи содержимое `.env` / `.env.local` — там пароли. Новые переменные добавляй в `.env.example`.

## Проверка перед коммитом

Автотестов пока нет, поэтому после изменений проверяй сборку той части, которую менял:

- backend: `cd backend; npx tsc --noEmit`
- frontend: `cd frontend; npm run build`

Изменения в интерфейсе дополнительно проверяй в браузере (skill `/check-site http://localhost:3000`).

## Стиль кода

- Backend: слои `routes → controllers → services`. Бизнес-логика — только в `services/`, входные данные — через zod-схемы в `schemas/` и middleware `validate`, ошибки — через `HttpError`.
- Изменения БД — только через `prisma/schema.prisma` + `npm run db:migrate`, вручную SQL не править. `src/generated/` не редактировать.
- Frontend: стили — CSS Modules рядом с компонентом, общие элементы — в `ui/`, загрузка данных — через хуки `useData`/`useActions` и api-клиент из `lib/`, без прямых `fetch` в компонентах.
- Не добавляй новые зависимости без необходимости — сначала спроси.
