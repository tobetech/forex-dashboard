# Forex Dashboard

Trading performance dashboard สร้างด้วย Next.js + Supabase + Recharts

## Stack

- **Next.js 14** (App Router)
- **Supabase** — ดึงข้อมูลจากตาราง `forex`
- **Recharts** — Equity curve, Win rate, Symbol P&L
- **Tailwind CSS** — Dark mode UI

## วิธี Deploy บน Vercel

### 1. Push ขึ้น GitHub

```bash
cd forex-dashboard
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/forex-dashboard.git
git push -u origin main
```

### 2. Import ใน Vercel

1. ไปที่ [vercel.com](https://vercel.com) → **Add New Project**
2. เลือก repo `forex-dashboard`
3. ไปที่ **Environment Variables** ใส่:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://henhksozqbpacmptiaoh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |

4. กด **Deploy** — เสร็จภายใน 1-2 นาที

### 3. รันในเครื่อง (Optional)

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## Schema ตาราง forex

| Column | Type | คำอธิบาย |
|--------|------|----------|
| id | int8 | Primary key |
| time | timestamptz | เวลา trade |
| symbol | text | Currency pair เช่น XAUUSD |
| type | text | buy / sell |
| direction | text | in (open) / out (close) |
| volume | float8 | ขนาด lot |
| price | float8 | ราคา |
| profit | float8 | กำไร/ขาดทุน |
| balance | float8 | ยอดคงเหลือ |
| order_type | text | Strategy เช่น BUY PAT1 |
| comment | text | SL price |

## Features

- ✅ Total P&L, Balance, Win Rate, R:R, Profit Factor, Max Drawdown
- ✅ Equity Curve chart
- ✅ Win/Loss donut chart
- ✅ Performance by strategy (order_type)
- ✅ P&L by symbol
- ✅ Trade history table (100 รายการล่าสุด)
- ✅ Filter 7D / 30D / 90D / All
- ✅ Dark mode
