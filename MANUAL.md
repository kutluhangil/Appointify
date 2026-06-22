# Appointify — Kurulum Rehberi

Bu dosya **sırayla** yapman gereken her adımı anlatır.
Her adımı bitirince yanındaki kutucuğu işaretle.

---

## Önce Şunu Bil

Şu an site çalışıyor ve demosu yapılabilir durumda. Ama veriler gerçek değil — hepsi sahte örnek data. Kullanıcı girişi Supabase üzerinden gerçek çalışıyor, geri kalan her şey (randevular, müşteriler, personel) demo modunda.

Bu rehberi takip ettiğinde site gerçekten işleyen bir SaaS'a dönüşecek.

**Zorunlu adımlar (önce bunları yap):**
→ Adım 1, 2, 3, 4

**Opsiyonel ama önemli:**
→ Adım 5, 6, 7, 8

**En son bunları yap:**
→ Adım 9, 10

---

## ADIM 1 — Profil Fotoğrafı Depolama Alanı Oluştur

**Ne yapıyoruz?**
Kullanıcılar Ayarlar sayfasından profil fotoğrafı yükleyebiliyor ama fotoğrafın kaydedileceği yer henüz yok. Bu adımda o yeri oluşturuyoruz.

**Nasıl yapılır:**

1. Tarayıcında şu adrese git: **supabase.com/dashboard**
2. Kendi projen açılacak. Sol menüde **Storage** yaz, tıkla.
3. Açılan ekranda **"New bucket"** butonuna tıkla.
4. Şu ayarları yap:
   - **Name:** `avatars` (tam bu şekilde, küçük harf)
   - **Public bucket:** bu seçeneği **AÇ** (toggle'ı yeşil yap)
5. **Save** ya da **Create** butonuna bas.

Bucket oluştu. Şimdi kimin fotoğraf yükleyebileceğini ayarla:

6. Az önce oluşturduğun `avatars` bucket'ına tıkla.
7. Üst menüde **Policies** sekmesine geç.
8. **"New policy"** butonuna tıkla → **"For full customization"** seç.
9. Aşağıdaki ayarları yap:
   - **Policy name:** `Herkes okuyabilir`
   - **Allowed operation:** sadece `SELECT` işaretle
   - **USING expression:** kutucuğa şunu yaz: `true`
10. **Review** → **Save policy** de.
11. Tekrar **"New policy"** → **"For full customization"**:
    - **Policy name:** `Kullanici kendi yukleyebilir`
    - **Allowed operation:** sadece `INSERT` işaretle
    - **USING expression:** kutucuğa şunu yaz:
      ```
      auth.uid()::text = (storage.foldername(name))[1]
      ```
12. **Review** → **Save policy** de.

- [ ] Bu adım tamamlandı

---

## ADIM 2 — Veritabanı Tablolarını Oluştur

**Ne yapıyoruz?**
Şu an veritabanında randevu, müşteri, personel veya hizmet tablosu yok. Sadece kullanıcı profil tablosu var. Bu adımda gerçek verilerin saklanacağı tüm tabloları oluşturuyoruz.

**Nasıl yapılır:**

1. Supabase Dashboard'da sol menüde **SQL Editor**'e tıkla.
2. Sağ üstte **"New query"** butonuna bas.
3. Açılan büyük beyaz metin kutusuna aşağıdaki kodun **tamamını** kopyala-yapıştır:

```sql
-- İşletmeler tablosu
CREATE TABLE IF NOT EXISTS tenants (
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
  settings     JSONB DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Personel tablosu
CREATE TABLE IF NOT EXISTS staff (
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

-- Hizmetler tablosu
CREATE TABLE IF NOT EXISTS services (
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

-- Müşteriler tablosu
CREATE TABLE IF NOT EXISTS customers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID REFERENCES tenants(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  tag          TEXT DEFAULT 'regular',
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Randevular tablosu
CREATE TABLE IF NOT EXISTS appointments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id  UUID REFERENCES customers(id),
  staff_id     UUID REFERENCES staff(id),
  service_id   UUID REFERENCES services(id),
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ NOT NULL,
  status       TEXT DEFAULT 'pending',
  notes        TEXT,
  price        NUMERIC(10,2),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Ödemeler tablosu
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  appointment_id  UUID REFERENCES appointments(id),
  customer_id     UUID REFERENCES customers(id),
  amount          NUMERIC(10,2) NOT NULL,
  currency        TEXT DEFAULT 'TRY',
  method          TEXT,
  status          TEXT DEFAULT 'pending',
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Kullanıcı profillerine işletme bağlantısı ekle
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
  ADD COLUMN IF NOT EXISTS role      TEXT DEFAULT 'owner';
```

4. Sağ üstte **"Run"** butonuna bas (ya da Cmd+Enter).
5. Alt kısımda yeşil "Success" yazısı göreceksin. Hata görürsen bana söyle.

- [ ] Bu adım tamamlandı

---

## ADIM 3 — Güvenlik Kurallarını Aç

**Ne yapıyoruz?**
Az önce oluşturduğun tablolara herkes erişemesin — sadece kendi verilerine yetkili kişiler erişebilsin. Buna "Row Level Security" (RLS) deniyor.

**Nasıl yapılır:**

1. SQL Editor'da tekrar **"New query"** butonuna bas.
2. Aşağıdaki kodu kopyala-yapıştır:

```sql
ALTER TABLE tenants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff        ENABLE ROW LEVEL SECURITY;
ALTER TABLE services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments     ENABLE ROW LEVEL SECURITY;

-- Kendi işletmesini görebilsin
CREATE POLICY "tenant_select" ON tenants
  FOR SELECT USING (
    id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "tenant_insert" ON tenants
  FOR INSERT WITH CHECK (true);

-- Randevulara kendi işletmesi erişebilsin
CREATE POLICY "appointments_all" ON appointments
  USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "customers_all" ON customers
  USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "services_all" ON services
  USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "staff_all" ON staff
  USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "payments_all" ON payments
  USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );
```

3. **Run** butonuna bas. Yeşil success görünce devam et.

- [ ] Bu adım tamamlandı

---

## ADIM 4 — Vercel'e Ortam Değişkenlerini Ekle

**Ne yapıyoruz?**
Projenin Supabase ile konuşabilmesi için bazı gizli anahtarlar gerekiyor. Bu anahtarlar yerel bilgisayarında `.env` dosyasında zaten var. Ama Vercel'deki canlı sitede de bunların tanımlı olması lazım.

**Bu anahtarları nereden bulursun:**

1. **supabase.com/dashboard** → Projen → Sol altta **Project Settings** → **API**
2. Orada 2 şey göreceksin:
   - **Project URL** → `https://xxxxxx.supabase.co` şeklinde
   - **anon / public** anahtarı → `eyJh...` ile başlayan uzun bir kod

**Vercel'e ekleme:**

3. Yeni sekmede **vercel.com/dashboard** aç.
4. Appointify projesine tıkla.
5. Üst menüde **Settings**'e tıkla.
6. Sol menüde **Environment Variables**'a tıkla.
7. Aşağıdaki 2 değişkeni tek tek ekle:

   **Birinci değişken:**
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** Az önce kopyaladığın Project URL (https://... ile başlayan)
   - **Environment:** All (Production, Preview, Development hepsini seç)
   - **Save** bas.

   **İkinci değişken:**
   - **Key:** `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Value:** anon/public anahtarı (eyJh... ile başlayan)
   - **Environment:** All
   - **Save** bas.

8. Sol menüde **Deployments**'a geç.
9. En üstteki deployment'ın sağındaki **üç nokta (...)** menüsüne tıkla.
10. **Redeploy** seç → **Redeploy** butonuna bas.
11. 2-3 dakika bekle. Yeşil "Ready" görünce tamam.

- [ ] Bu adım tamamlandı

---

## ADIM 5 — E-posta Bildirimleri Kur

**Ne yapıyoruz?**
Müşteri randevu aldığında otomatik onay e-postası gitsin. Bunu ücretsiz bir servis olan **Resend** ile yapacağız.

**Nasıl yapılır:**

1. **resend.com** adresine git → **Sign up** ile ücretsiz hesap aç.
2. Sol menüde **API Keys** → **Create API Key** tıkla.
3. Bir isim ver (örn: `Appointify`) → **Add** bas.
4. Çıkan anahtarı kopyala (bir daha göremezsin, kaydet!).

**Vercel'e ekle:**

5. Vercel Dashboard → Appointify → Settings → Environment Variables
6. Yeni değişken ekle:
   - **Key:** `RESEND_API_KEY`
   - **Value:** Az önce kopyaladığın anahtar
   - **Save** bas.
7. Tekrar Redeploy yap (Adım 4'ün 8-11. adımları gibi).

**Önemli not:** Sadece bu anahtarı eklemek yetmez — e-posta gönderecek bir backend fonksiyonu da yazman gerekecek. Bunu geliştirici ile birlikte yapmanı öneririm ya da bana söyle, birlikte yapalım.

- [ ] Bu adım tamamlandı (ya da ertelendi)

---

## ADIM 6 — SMS Bildirimleri Kur

**Ne yapıyoruz?**
Randevu öncesi müşteriye SMS hatırlatması gönderilsin. Türkiye için en uygun seçenek **Netgsm** ya da **Twilio**.

### Seçenek A — Netgsm (Türkiye, daha ucuz)

1. **netgsm.com.tr** adresine git → Kurumsal hesap aç.
2. Hesabına giriş yap → API bilgilerini bul (**API Kullanıcı Adı** ve **Şifre**).
3. Vercel'e ekle:
   - **Key:** `NETGSM_USERCODE` → API kullanıcı adı
   - **Key:** `NETGSM_PASSWORD` → API şifresi
   - **Key:** `NETGSM_MSGHEADER` → SMS başlığın (kayıtlı başlık olmalı, örn: `KUAFOR`)

### Seçenek B — Twilio (Uluslararası)

1. **twilio.com** adresine git → Ücretsiz deneme hesabı aç.
2. Console'da şu bilgileri bul:
   - **Account SID**
   - **Auth Token**
   - Bir Twilio telefon numarası satın al.
3. Vercel'e ekle:
   - **Key:** `TWILIO_ACCOUNT_SID`
   - **Key:** `TWILIO_AUTH_TOKEN`
   - **Key:** `TWILIO_PHONE_NUMBER` → Satın aldığın numara (+1xxx şeklinde)

**Not:** SMS göndermek için de backend fonksiyonu gerekiyor. Bunu da geliştirici yardımıyla kurman lazım.

- [ ] Bu adım tamamlandı (ya da ertelendi)

---

## ADIM 7 — Online Ödeme Entegrasyonu

**Ne yapıyoruz?**
Müşteriler randevu alırken depozito ya da tam ödeme yapabilsin.

### Seçenek A — Iyzico (Türkiye için önerilen)

1. **iyzico.com** adresine git → **İyzipay** bölümüne gir.
2. **Sandbox hesabı** aç (canlıya geçmeden önce test edebilirsin).
3. Merchant Panel'de **API Anahtarları** bölümüne git.
4. **API Key** ve **Secret Key**'i kopyala.
5. Vercel'e ekle:
   - **Key:** `IYZICO_API_KEY`
   - **Key:** `IYZICO_SECRET_KEY`
   - **Key:** `IYZICO_BASE_URL` → Sandbox için: `https://sandbox-api.iyzipay.com`

### Seçenek B — Stripe (Uluslararası)

1. **stripe.com** adresine git → Hesap aç.
2. Dashboard → **Developers** → **API Keys**
3. **Publishable key** ve **Secret key**'i kopyala.
4. Vercel'e ekle:
   - **Key:** `VITE_STRIPE_PUBLISHABLE_KEY` → Publishable key (pk_live_... veya pk_test_...)
   - **Key:** `STRIPE_SECRET_KEY` → Secret key (sk_live_... veya sk_test_...)

**Not:** Ödeme sayfasının gerçekten para alması için ödeme akışının kodlanması gerekiyor. Bu tek başına bir oturumun konusu.

- [ ] Bu adım tamamlandı (ya da ertelendi)

---

## ADIM 8 — Özel Alan Adı (Domain) Bağla

**Ne yapıyoruz?**
Şu an site `appointify-xxx.vercel.app` gibi bir adreste. Kendi alan adını bağlayarak `appointify.com.tr` veya `randevu.isletmeadi.com` gibi bir adres yapacaksın.

**Alan adın yoksa:**

1. **isimtescil.net**, **natro.com** veya **godaddy.com**'dan bir .com.tr veya .com al.
   - Tavsiye: `.com.tr` için isimtescil.net kullan, yıllık ~300-500₺.

**Alan adın varsa:**

2. Vercel Dashboard → Appointify projesi → **Settings** → **Domains**
3. **"Add"** butonuna tıkla → Alan adını yaz (örn: `appointify.com.tr`) → **Add**
4. Vercel sana DNS kayıtları verecek. İki seçenek:

   **Seçenek A (tavsiye edilir) — Nameserver değiştir:**
   - Alan adını aldığın yerde (isimtescil, natro vb.) Nameserver'ları değiştir:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`
   - 10-60 dakika bekle. Vercel otomatik halleder.

   **Seçenek B — DNS kaydı ekle:**
   - Alan adını aldığın yerin DNS yönetimine gir.
   - **A kaydı** ekle: İsim `@`, Değer `76.76.21.21`
   - 10-60 dakika bekle.

5. Vercel'de alan adının yanında yeşil tik görününce SSL sertifikası da otomatik kurulur.

- [ ] Bu adım tamamlandı

---

## ADIM 9 — Demo Veriden Gerçek Veriye Geç

**Ne yapıyoruz?**
Şu an Dashboard, Randevular, Müşteriler, Personel, Hizmetler, Ödemeler sayfaları hep sahte demo datası gösteriyor. Adım 2'de veritabanı tablolarını oluşturdun. Şimdi sayfaların o tabloları okuyacak şekilde güncellenmesi lazım.

**Bu teknik bir geliştirme işidir.** Kod yazman gerekiyor.

**Sırası:**

Her sayfa için şu değişikliği yapacaksın (veya geliştiricinle yapacaksın):

```
Şu an: sampleAppointments (sahte data)
Olması gereken: Supabase'den çekilen gerçek data
```

**Önce bu sayfaları güncelle:**

1. `src/pages/Appointments.tsx` — Randevular listesi
2. `src/pages/Customers.tsx` — Müşteriler listesi
3. `src/pages/Services.tsx` — Hizmetler
4. `src/pages/Staff.tsx` — Personel
5. `src/pages/Payments.tsx` — Ödemeler
6. `src/pages/Dashboard.tsx` — İstatistikler

Her sayfa için bana "Appointments.tsx'i gerçek dataya bağla" dersen birlikte yaparız.

- [ ] Bu adım tamamlandı

---

## ADIM 10 — Canlıya Almadan Önce Kontrol Listesi

Her şey bitti mi? Şunların hepsini kontrol et:

- [ ] Supabase'de `avatars` storage bucket oluşturuldu (Adım 1)
- [ ] Veritabanı tabloları oluşturuldu: tenants, appointments, customers, services, staff, payments (Adım 2)
- [ ] Güvenlik kuralları (RLS) aktif (Adım 3)
- [ ] Vercel'de `VITE_SUPABASE_URL` ve `VITE_SUPABASE_PUBLISHABLE_KEY` tanımlı (Adım 4)
- [ ] Sayfalar gerçek Supabase verisini gösteriyor — sahte data yok (Adım 9)
- [ ] Yeni kayıt olan kullanıcıya otomatik işletme oluşturuluyor
- [ ] Randevu alındığında e-posta gidiyor (Adım 5)
- [ ] Randevu öncesi SMS hatırlatması çalışıyor (Adım 6)
- [ ] Ödeme entegrasyonu sandbox'ta test edildi (Adım 7)
- [ ] Alan adı bağlandı ve SSL aktif (Adım 8)
- [ ] Gizlilik Politikası ve Kullanım Koşulları sayfaları eklendi
- [ ] KVKK uyumluluk metni sitede görünüyor

---

## Sık Sorulan Sorular

**"Supabase'de nereden başlayacağımı bulamıyorum."**
→ sol menüde en üstte projenin adını göreceksin. Tıkla, ana paneli açılır. Storage, SQL Editor, Authentication hepsi sol menüde.

**"SQL çalıştırdım ama hata aldım."**
→ Hatayı bana kopyala. Büyük ihtimalle tablo zaten var ya da bir yazım yanlışı var, düzeltiriz.

**"Vercel'de değişken ekledim ama site hâlâ eskisi gibi görünüyor."**
→ Redeploy yapmayı unutmuş olabilirsin. Adım 4'ün 8-11. adımlarını tekrar yap.

**"Demo data hâlâ görünüyor, gerçek data gelmiyor."**
→ Adım 9 tamamlanmadı. Sayfaların Supabase'e bağlanması gerekiyor, bu kod değişikliği gerektiriyor.

**"Randevu alındığında e-posta gitmiyor."**
→ API anahtarını ekledin ama backend fonksiyonunu yazmadın. Bu Adım 5'in ikinci kısmı. Bana haber ver, yapalım.
