# Планер Бипа

Ежедневный планер для компьютера: учёба, курсы, спорт, дом и встречи с друзьями — вместе с 3D-роботом Бипом.

- `backend/` — Express + TypeScript + PostgreSQL (Prisma 7)
- `frontend/` — Next.js (App Router) + TypeScript + CSS Modules + three.js

## Что уже есть (этап 1)

- **Сферы** (Учёба, Курсы, Спорт, Дом, Друзья по умолчанию) — можно создавать свои, менять иконку и цвет, архивировать, удалять с переносом содержимого.
- **Группы внутри сфер** — предметы, курсы и т.п., сколько угодно; тоже с архивом и удалением/переносом.
- **Задачи** со сроком, сферой и группой.
- **Встречи** с датой, временем, местом, участниками и заметкой; отметки «состоялась» / «отменена».
- **Экран «Сегодня»**: встречи по времени, просроченное, задачи на сегодня, ближайшие 7 дней, без срока, сделано сегодня.
- **Страница сферы**: карточки групп с задачами и ближайшие встречи.
- Горячие клавиши: `N` — новая задача, `M` — новая встреча.

## Первый запуск

Нужен установленный и запущенный PostgreSQL.

```bash
cd backend
npm install
cp .env.example .env      # впишите пароль в DATABASE_URL
npm run db:migrate        # создаст базу task_manager и таблицы
npm run db:seed           # сферы по умолчанию (только в пустой базе)
npm run db:import-json    # (необязательно) перенос задач из старого data/tasks.json
npm run dev               # http://localhost:4000

cd ../frontend
npm install
npm run dev               # http://localhost:3000
```

Если в пароле есть символы `@ : / ? # %` — их нужно закодировать в URL (например, `@` → `%40`).

Полезное: `npm run db:studio` — просмотр базы в браузере.

## Структура backend

```
backend/
├── prisma/
│   ├── schema.prisma     модели: Sphere, Group, Task, Event
│   ├── migrations/       SQL-миграции
│   ├── seed.ts           сферы по умолчанию
│   └── import-json.ts    перенос задач из старого JSON
├── prisma.config.ts      конфиг Prisma (DATABASE_URL из .env)
└── src/
    ├── index.ts          запуск сервера
    ├── server/           Express-приложение
    ├── config/           переменные окружения
    ├── db/               Prisma Client
    ├── routes/           /api/spheres, /groups, /tasks, /events
    ├── controllers/      разбор запроса и ответ
    ├── services/         логика: перенос при удалении, согласование сферы и группы
    ├── schemas/          валидация входных данных (zod)
    ├── middleware/       validate, обработка ошибок
    ├── types/            DTO
    ├── utils/            HttpError, даты
    └── generated/        Prisma Client (генерируется, не в git)
```

## Структура frontend

```
frontend/src/
├── app/                  роуты: / (Сегодня), /spheres/[id]; layout.tsx, globals.css
├── components/
│   ├── layout/           AppShell (сайдбар | страница | Бип), RobotProvider
│   └── pages/            TodayPage, SpherePage
├── widgets/
│   ├── Sidebar/          навигация по сферам и группам
│   ├── LiveBackground/   живой фон: серебристые волны, луч, частицы (WebGL-шейдер)
│   ├── RobotHero/        3D-робот Бип, хромированный (react-three-fiber)
│   ├── RobotPanel/       реплики Бипа
│   ├── TaskList/, EventList/, GroupCard/
│   ├── Editors/          окна: задача, встреча, сфера, группа
│   └── OwnerSelect/      выбор сферы/группы и метка
├── ui/                   Button, Input, Select, Modal, Chip, Section, пикеры…
├── hooks/                useData (SWR), useActions, useRobot, useToday, useHotkey…
├── lib/                  api-клиент, даты
└── types/
```

## API

| Метод  | Путь                 | Описание |
|--------|----------------------|----------|
| GET    | /api/spheres         | сферы с группами и счётчиками активных задач (`?includeArchived=true`) |
| POST   | /api/spheres         | `{ name, icon?, color? }` |
| PATCH  | /api/spheres/:id     | `{ name?, icon?, color?, archived? }` |
| DELETE | /api/spheres/:id     | `?moveTo=<sphereId>` — перенести содержимое, без него — удалить всё |
| POST   | /api/groups          | `{ sphereId, name, color? }` |
| PATCH  | /api/groups/:id      | `{ name?, color?, sphereId?, archived? }` |
| DELETE | /api/groups/:id      | `?moveTo=<groupId>` |
| GET    | /api/tasks           | `?status=active\|done\|all&doneSince=ISO&sphereId&groupId` |
| POST   | /api/tasks           | `{ title, description?, sphereId?, groupId?, dueDate? (ГГГГ-ММ-ДД) }` |
| PATCH  | /api/tasks/:id       | то же + `completed` |
| DELETE | /api/tasks/:id       | |
| GET    | /api/events          | `?from=ISO&to=ISO&sphereId&groupId` |
| POST   | /api/events          | `{ title, startsAt, endsAt?, location?, people?, note?, sphereId?, groupId? }` |
| PATCH  | /api/events/:id      | то же + `status: planned\|done\|cancelled` |
| DELETE | /api/events/:id      | |

## Дальше по плану

2. Регулярные дела (зал, уборка, готовка), галочки по дням, экран «Неделя».
3. Итоги за день / неделю / месяц / год, тепловая карта, серии, комментарии Бипа.
4. Напоминания (по желанию).
