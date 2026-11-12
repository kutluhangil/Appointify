<div align="center">

<img src="docs/media/hero.svg" alt="Appointify — appointment and client portal SaaS" width="100%">

<p>
  <a href="https://appointify-mu.vercel.app/"><img alt="Live" src="https://img.shields.io/badge/live-open%20Appointify-5b8cff?style=for-the-badge&labelColor=070c18"></a>
  <img alt="React" src="https://img.shields.io/badge/React-shadcn%2Fui-4ee6b0?style=for-the-badge&labelColor=070c18">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-backend-ffb547?style=for-the-badge&labelColor=070c18">
  <img alt="Languages" src="https://img.shields.io/badge/UI-TR%20%2F%20EN-5b8cff?style=for-the-badge&labelColor=070c18">
</p>

<p><em>Appointment management for hairdressers, barbers, tattoo studios, dietitians, beauty salons and physiotherapists,<br>
from a solo practitioner to a business with several locations.</em></p>

</div>

<img src="docs/media/divider.svg" width="100%" alt="">

## What it is

Appointify gives service businesses a polished public booking page, an operator dashboard and a client portal in one product. Clients book themselves through a five-step wizard; the business sees the calendar, collects deposits to cut no-shows and sends reminders automatically.

<img src="docs/media/divider.svg" width="100%" alt="">

## Features

| | |
|---|---|
| **Smart calendar** | Day, week and list views with automatic clash prevention. |
| **Booking widget** | A per-business `/book/:slug` page: service, staff, date, details, confirmation. |
| **Client portal** | Visit history, total spend, VIP tags and per-client bookings. |
| **Deposits** | Take a deposit online to reduce no-shows, with iyzico and Stripe. |
| **Reminders** | SMS, email or WhatsApp before each appointment, on a schedule you set. |
| **Staff** | Working hours, days off, specialties and performance per staff member. |
| **Service catalogue** | Price, duration and category, in Turkish and English. |
| **Analytics** | Weekly and monthly revenue, service mix, occupancy and average booking value. |
| **Settings** | Slot length, buffers, cancellation policy, deposit percentage, language and currency. |

```mermaid
flowchart LR
  C[Client] --> W[/book/:slug<br/>5-step wizard/]
  W --> DB[(Supabase)]
  W --> PAY[Deposit · iyzico / Stripe]
  DB --> OP[Operator dashboard<br/>calendar · staff · analytics]
  DB --> R[Reminders · SMS / email / WhatsApp]
  DB --> P[Client portal]
```

<img src="docs/media/divider.svg" width="100%" alt="">

## Türkçe özet

**Appointify**, kuaför, berber, dövme stüdyosu, diyetisyen, güzellik salonu ve fizyoterapist gibi hizmet işletmeleri için uçtan uca bir randevu ve müşteri portalı. Müşteriler işletmeye özel sayfadan beş adımda randevu alıyor; işletme takvimi, personeli ve gelir analizlerini tek panelden yönetiyor, online depozito ile gelmeyen müşteri sayısını azaltıyor ve otomatik hatırlatmalar gönderiyor.

<img src="docs/media/divider.svg" width="100%" alt="">

## Development

```sh
npm install
npm run dev          # http://localhost:8080
npm test             # vitest
npm run type-check
npm run build
```

<div align="center">
<br>
<a href="https://github.com/kutluhangil"><img src="docs/media/signature.svg" width="100%" alt="Built by kutluhangil"></a>
<sub>Fewer no-shows, fuller days.</sub>
</div>
