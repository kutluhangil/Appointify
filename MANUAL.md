# Appointify — Manuel Kurulum Kılavuzu

Bu dosya, otomatik olarak yapılamayan ve **senin elle yapman gereken** tüm adımları listeler.  
Tamamladıkça kutucukları işaretle.

---

## 1. Supabase — Storage Bucket (Zorunlu)

Profil fotoğrafı yükleme çalışmıyor çünkü "avatars" bucket'ı henüz oluşturulmadı.

**Yapılacaklar:**

- [ ] [Supabase Dashboard](https://supabase.com/dashboard) → Projen → **Storage**
- [ ] **New bucket** → Name: `avatars` → Public: **Açık** → Create
- [ ] Storage Policies sekmesine gir → `avatars` bucket'ı seç → **New policy** ekle:
  - Policy adı: `Users can upload their own avatar`
  - Operation: `INSERT`
  - `USING` expression:
    ```sql
    auth.uid()::text = (storage.foldername(name))[1]
    ```
  - Policy adı: `Avatars are publicly readable`
  - Operation: `SELECT`
  - `USING` expression: `true`

---

## 2. Supabase — Appointify DB Şeması Migration (Zorunlu)

Şu an DB'de sadece bug tracker tabloları var (`bugs`, `profiles`).  
Randevu/müşteri/hizmet/personel verileri sample-data'dan geliyor.  
Gerçek SaaS için aşağıdaki tabloları oluşturman gerekiyor.

**Yapılacaklar:**

- [ ] Supabase Dashboard → **SQL Editor** → New query → Yapıştır ve çalıştır:

```sql
-- Tenants (işletmeler)
CREATE TABLE tenants (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  industry     TEXT,
  phone        TEXT,
  email        TEXT,
  address      TEXT,
  locale       TEXT DEFAULT 'tr',
  currency     TEXT DEFAULT 'TRY',
  timezone     TEXT DEFAULT 'Europe/Istanbul',
  logo_url     TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Staff (personel)
CREATE TABLE staff (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES auth.users(id),
  full_name    TEXT NOT NULL,
  title        TEXT,
  phone        TEXT,
  email        TEXT,
  color        TEXT DEFAULT '#6366f1',
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Services (hizmetler)
CREATE TABLE services (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  duration_min INTEGER NOT NULL DEFAULT 30,
  price        NUMERIC(10,2),
  currency     TEXT DEFAULT 'TRY',
  color        TEXT DEFAULT '#6366f1',
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Customers (müşteriler)
CREATE TABLE customers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID REFERENCES tenants(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  tag          TEXT DEFAULT 'regular',  -- 'VIP' | 'new' | 'regular'
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Appointments (randevular)
CREATE TABLE appointments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id  UUID REFERENCES customers(id),
  staff_id     UUID REFERENCES staff(id),
  service_id   UUID REFERENCES services(id),
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ NOT NULL,
  status       TEXT DEFAULT 'pending',  -- 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  notes        TEXT,
  price        NUMERIC(10,2),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Payments (ödemeler)
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  appointment_id  UUID REFERENCES appointments(id),
  customer_id     UUID REFERENCES customers(id),
  amount          NUMERIC(10,2) NOT NULL,
  currency        TEXT DEFAULT 'TRY',
  method          TEXT,  -- 'card' | 'cash' | 'bank_transfer'
  status          TEXT DEFAULT 'pending',  -- 'pending' | 'paid' | 'refunded'
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## 3. Supabase — Row Level Security (RLS) Politikaları

Migration'dan sonra her tablo için RLS açılmalı.

- [ ] SQL Editor'da çalıştır:

```sql
ALTER TABLE tenants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff        ENABLE ROW LEVEL SECURITY;
ALTER TABLE services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments     ENABLE ROW LEVEL SECURITY;

-- Tenant sahipleri kendi verilerini okuyabilir/yazabilir
-- (Aşağıdaki politikalar tenant_id kontrolü için örnek şablondur;
--  gerçek multi-tenant auth için profiles tablosuna tenant_id kolonu eklemeni öneririm)

CREATE POLICY "tenant_own_data" ON appointments
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ));
```

---

## 4. Vercel — Environment Variables (Zorunlu)

`.env` dosyası sadece local'de çalışır. Vercel'de de ayarlanması gerekiyor.

- [ ] [Vercel Dashboard](https://vercel.com/dashboard) → Appointify projesi → **Settings** → **Environment Variables**
- [ ] Şu değişkenleri ekle (Supabase Dashboard → Project Settings → API'dan al):

| Değişken | Değer |
|---|---|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJh...` (anon/public key) |

- [ ] Değişkenleri ekledikten sonra **Redeploy** yap (Deployments → üç nokta → Redeploy).

---

## 5. Stripe veya Iyzico — Ödeme Entegrasyonu

Şu an ödeme sayfası sadece sample-data gösteriyor; gerçek ödeme akışı bağlı değil.

### Stripe (Uluslararası)

- [ ] [stripe.com](https://stripe.com) hesabı aç
- [ ] API Keys → `STRIPE_SECRET_KEY` ve `VITE_STRIPE_PUBLISHABLE_KEY` al
- [ ] Vercel env vars'a ekle
- [ ] `npm install @stripe/stripe-js @stripe/react-stripe-js` çalıştır
- [ ] Backend'de (Supabase Edge Function veya ayrı Node.js server) `/api/create-payment-intent` endpoint'i oluştur

### Iyzico (TR için)

- [ ] [iyzico.com](https://www.iyzico.com/en/iyzipay) → sandbox hesabı aç
- [ ] API Key + Secret Key al → Vercel env vars'a ekle
- [ ] `npm install iyzipay` çalıştır (backend'de kullanılır)

---

## 6. SMS / WhatsApp Bildirim Servisi

Notification sekmesindeki SMS/WhatsApp switch'leri UI seviyesinde çalışıyor; arkada servis yok.

### Seçenekler:

- [ ] **Twilio** (SMS + WhatsApp): [twilio.com](https://www.twilio.com) → hesap aç → `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` al
- [ ] **Netgsm** (TR SMS, daha ucuz): [netgsm.com.tr](https://www.netgsm.com.tr) → API key al
- [ ] Vercel env vars'a ekle
- [ ] Supabase Edge Function veya cron job ile randevu öncesi bildirim gönder

---

## 7. E-posta Bildirim Servisi

- [ ] **Resend** (önerilen): [resend.com](https://resend.com) → hesap aç → `RESEND_API_KEY` al
- [ ] **SendGrid** alternatif: [sendgrid.com](https://sendgrid.com)
- [ ] Vercel env vars'a ekle
- [ ] Randevu onay/hatırlatma e-postası için Supabase Edge Function oluştur

---

## 8. Redis + BullMQ — Job Queue (Opsiyonel ama önerilen)

Randevu hatırlatıcıları için arka plan işleri.

- [ ] [Upstash](https://upstash.com) → Redis database oluştur (Vercel marketplace'ten de eklenebilir)
- [ ] `UPSTASH_REDIS_URL` ve `UPSTASH_REDIS_TOKEN` al → Vercel env vars'a ekle
- [ ] Backend servis oluştur: `npm install bullmq ioredis`
- [ ] `reminderQueue.ts` dosyası oluştur — randevu 24 saat öncesinde SMS/e-posta job'u zamanla

---

## 9. Özel Domain (Opsiyonel)

- [ ] Domain al (Namecheap, GoDaddy, veya doğrudan Vercel'den)
- [ ] Vercel Dashboard → Appointify → **Settings** → **Domains** → domain ekle
- [ ] DNS ayarları:
  - `A` record → `76.76.21.21` (Vercel IP)
  - veya `CNAME` → `cns.vercel-dns.com`
- [ ] SSL otomatik aktif olur (birkaç dakika bekle)

---

## 10. Supabase — Tenant–User İlişkisi (profiles tablosu güncellemesi)

Multi-tenant mimarinin çalışması için `profiles` tablosuna `tenant_id` kolonu eklenmeli.

- [ ] SQL Editor'da çalıştır:

```sql
ALTER TABLE profiles ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'owner';  -- 'owner' | 'staff'
```

- [ ] Kayıt sırasında yeni kullanıcı için otomatik tenant + profil oluşturan bir Supabase **trigger** veya **Edge Function** yaz.

---

## 11. Production Checklist

Canlıya almadan önce kontrol listesi:

- [ ] Supabase'de "avatars" bucket oluşturuldu
- [ ] DB migration çalıştırıldı (tablolar oluştu)
- [ ] RLS politikaları aktif
- [ ] Vercel env vars ayarlandı (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`)
- [ ] Sample-data yerine gerçek Supabase query'leri bağlandı (her sayfa için)
- [ ] Ödeme entegrasyonu test edildi (sandbox)
- [ ] SMS/e-posta gönderimi test edildi
- [ ] Custom domain ayarlandı
- [ ] GDPR/KVKK uyum metinleri eklendi (Gizlilik Politikası, Kullanım Koşulları)

---

## 12. Geliştirici Notları

### Sample-data'dan Supabase'e Geçiş

Her sayfa şu an `src/lib/sample-data.ts`'den veri çekiyor.  
Gerçek veriyi bağlamak için her sayfada şu değişikliği yapacaksın:

```ts
// ŞU AN (sample-data)
import { sampleAppointments } from "@/lib/sample-data";
const appointments = sampleAppointments;

// OLMASI GEREKEN (Supabase + TanStack Query)
const { data: appointments } = useQuery({
  queryKey: ["appointments", tenantId],
  queryFn: () => supabase.from("appointments").select("*, customers(*), staff(*), services(*)").eq("tenant_id", tenantId),
});
```

Bu değişikliği önce `Appointments.tsx`'ten başla, sonra diğer sayfalara geç.

---

*Bu kılavuz otomatik olarak oluşturulmuştur — Appointify v1.0 kurulum süreci*
