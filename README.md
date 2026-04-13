# Soil Moisture Dashboard

Dashboard Next.js untuk monitoring data sensor kelembaban tanah dari Google Sheets (Google Apps Script Web App).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env.local
   ```
3. Run development server:
   ```bash
   npm run dev
   ```

## Environment Variable

Gunakan endpoint berikut di `.env.local`:

```env
NEXT_PUBLIC_SHEET_API_URL=https://script.google.com/macros/s/AKfycbwQ68p78OrkbVzLWX9sfZN7k7bZ6Isjps3EI8HvFMwKrT9kjXs-s6Dk74SyOWNvU9CN/exec
```

## Deployment (Vercel)

- Import repository ini ke Vercel.
- Tambahkan environment variable `NEXT_PUBLIC_SHEET_API_URL` di Project Settings > Environment Variables.
- Gunakan command default:
  - Build: `npm run build`
  - Output: `.next` (otomatis Next.js)
