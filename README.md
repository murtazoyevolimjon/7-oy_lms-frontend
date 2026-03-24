# LMS Frontend

React + Vite + TypeScript + Tailwind asosida tayyorlangan LMS admin panel skeleti.

## Ishga tushirish

```bash
npm install
cp .env.example .env
npm run dev
```

## Muhim

`.env` ichidagi `VITE_API_URL` ni o'zingizning backend URL'ingizga almashtiring.

## Ulangan modullar

- Login
- Dashboard
- Students CRUD skeleti
- Teachers CRUD skeleti
- Groups list/create/detail/attendance
- Homework list skeleti
- Video upload skeleti
- Courses CRUD skeleti
- Rooms CRUD skeleti
- Employees CRUD skeleti

## Backendga ulash

Hozir endpointlar umumiy nomlar bilan yozilgan. Siz backend route nomlarini moslab almashtirasiz:

- `/auth/login`
- `/students`
- `/teachers`
- `/groups`
- `/courses`
- `/rooms`
- `/employees`
- `/groups/:id/attendance`
- `/groups/:id/homeworks`
- `/groups/:id/videos`

## Eslatma

Agar backend response quyidagicha bo'lsa:

```json
{ "data": [...] }
```

yoki to'g'ridan-to'g'ri array bo'lsa, ikkala holat uchun ham ko'p joyda fallback qo'yilgan.
