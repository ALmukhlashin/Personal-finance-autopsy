# Personal Finance Autopsy

**Ketahui ke mana uangmu benar-benar pergi.**

Aplikasi analisis keuangan pribadi — bukan buku kas digital. Fokus pada insight otomatis dari pola pengeluaran.

## Stack

- Next.js 15 (App Router)
- Prisma + PostgreSQL
- JWT (httpOnly cookie)
- Tailwind CSS + Recharts

## Setup Lokal

### 1. Environment

```bash
cp .env.example .env
```

Pastikan `JWT_SECRET` minimal 32 karakter.

Default memakai **SQLite** (`prisma/dev.db`) — tidak perlu Docker.

### 2. Install & Database

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

### PostgreSQL (opsional)

Jika ingin PostgreSQL: install Docker, ubah `provider` di `prisma/schema.prisma` ke `postgresql`, set `DATABASE_URL` di `.env`, lalu `docker compose up -d` dan migrasi ulang.

Buka [http://localhost:3000](http://localhost:3000)

## Menu Utama

1. **Dashboard** — ringkasan keuangan, health score, quick insights
2. **Transactions** — CRUD transaksi
3. **Autopsy Report** — analisis otomatis pola pengeluaran
4. **Statistics** — grafik dan ranking kategori

## Autopsy Insight Engine

Analisis deterministik (tanpa AI):

- Spending analysis
- Weekend analysis
- Impulse spending
- Monthly trend
- Largest expense
- Savings opportunity
