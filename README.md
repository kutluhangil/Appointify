<div align="center">

```
 █████╗ ██████╗ ██████╗  ██████╗ ██╗███╗   ██╗████████╗██╗███████╗██╗   ██╗
██╔══██╗██╔══██╗██╔══██╗██╔═══██╗██║████╗  ██║╚══██╔══╝██║██╔════╝╚██╗ ██╔╝
███████║██████╔╝██████╔╝██║   ██║██║██╔██╗ ██║   ██║   ██║█████╗   ╚████╔╝ 
██╔══██║██╔═══╝ ██╔═══╝ ██║   ██║██║██║╚██╗██║   ██║   ██║██╔══╝    ╚██╔╝  
██║  ██║██║     ██║     ╚██████╔╝██║██║ ╚████║   ██║   ██║██║        ██║   
╚═╝  ╚═╝╚═╝     ╚═╝      ╚═════╝ ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝        ╚═╝   
```

### Randevu & Müşteri Portalı SaaS Platformu

*Kuaför, dövme stüdyosu, diyetisyen ve güzellik salonları için geliştirilmiş tam kapsamlı randevu yönetim sistemi.*

---

[![Version](https://img.shields.io/badge/version-0.1.0-C8FF00?style=flat-square&labelColor=0A0A0B)](https://github.com/kutluhangil/Appointify)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white&labelColor=0A0A0B)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black&labelColor=0A0A0B)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3FCF8E?style=flat-square&logo=supabase&logoColor=white&labelColor=0A0A0B)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white&labelColor=0A0A0B)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white&labelColor=0A0A0B)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/license-MIT-C8FF00?style=flat-square&labelColor=0A0A0B)](LICENSE)

---

</div>

---

## Proje Nedir?

<details open>
<summary><strong>Türkçe Açıklama</strong></summary>
<br>

Appointify, kuaför, berber, dövme stüdyosu, diyetisyen, güzellik salonu ve fizyoterapist gibi hizmet sektörlerindeki solo çalışanlar ve çoklu lokasyon işletmecileri için tasarlanmış **tam kapsamlı bir randevu yönetim ve müşteri portalı** platformudur.

**Neden Appointify?**
- Müşterileriniz 7/24 kendi randevularını online olarak alabilir — siz uyurken bile doluluk sağlayın.
- SMS, e-posta ve WhatsApp hatırlatmalarıyla no-show oranını %70'e kadar düşürün.
- Online depozito alarak son dakika iptallere karşı işletmenizi koruyun.
- Birden fazla personel ve lokasyonu tek panelden yönetin; çalışma saatleri, izin günleri ve hizmet atamaları hepsi burada.
- Haftalık gelir raporları, en çok tercih edilen hizmetler ve VIP müşteri analizleriyle veriye dayalı kararlar alın.

</details>
<br>

Appointify is a production-grade **appointment management SaaS** built for solo practitioners and multi-location service businesses. It features a polished public booking widget, an intuitive operator dashboard, multi-staff scheduling, deposit collection, automated reminders, and revenue analytics — all in a single platform.

---

## Özellikler

| # | Özellik | Açıklama |
|---|---------|----------|
| 📅 | **Akıllı Randevu Takvimi** | Gün, hafta veya liste görünümüyle tüm randevuları tek ekranda yönetin; çakışmaları otomatik önleyin |
| 🌐 | **Online Booking Widget** | Müşteriye özel `/book/:slug` URL'siyle 5 adımlı rezervasyon sihirbazı — hizmet, personel, tarih, bilgi, onay |
| 👥 | **Müşteri Portalı** | Geçmiş ziyaretler, toplam harcama, VIP etiketleme ve müşteri bazlı randevu geçmişi |
| 💳 | **Depozito & Ödeme** | Online depozito alarak no-show'ları minimize edin; Iyzico ve Stripe entegrasyonu |
| 🔔 | **Otomatik Hatırlatmalar** | Randevu öncesi SMS, e-posta veya WhatsApp bildirimleri; özelleştirilebilir zamanlama |
| 👨‍💼 | **Çoklu Personel Yönetimi** | Her personelin kendi çalışma saatleri, izin günleri, uzmanlık alanları ve performans metrikleri |
| ✂️ | **Hizmet Kataloğu** | Fiyat, süre ve kategoriye göre hizmet tanımı; TR/EN çift dil desteği |
| 📊 | **Gelir & Analitik** | Haftalık/aylık gelir grafikleri, hizmet dağılımı, doluluk oranı ve ortalama randevu değeri |
| ⚙️ | **Kapsamlı Ayarlar** | Slot süresi, tampon süre, iptal politikası, depozito yüzdesi, dil ve para birimi ayarları |
| 🌙 | **Dark / Light Mod** | Sistem temasına uyum sağlayan premium tasarım sistemi; mobil ve masaüstü tam uyumlu |

---

## Teknoloji Yığını

```
Frontend & UI
├── React 18 (Functional Components, Hooks)
├── TypeScript (strict mode)
├── Tailwind CSS 3.4 (Custom design tokens, dark/light theme)
├── shadcn/ui (Radix UI tabanlı accessible bileşenler)
├── Framer Motion (Sayfa geçişleri ve micro-interaction animasyonları)
├── Lucide React (Icon seti)
└── Vite 5 (Ultra-hızlı build ve HMR)

State & Data
├── TanStack Query v5 (Server state yönetimi ve cache)
├── Zustand (Client-side global state)
├── React Hook Form + Zod (Form yönetimi ve şema validasyonu)
└── React Router v6 (Client-side routing)

Backend & Auth
├── Supabase (PostgreSQL veritabanı, Auth, Storage, Realtime)
├── Node.js + Express (API Gateway — yakında)
├── Bull MQ + Redis (Job queue: hatırlatma ve bildirim — yakında)
└── Nodemailer (E-posta gönderimi — yakında)

Ödeme Entegrasyonları
├── Stripe (Global ödeme & depozito)
└── Iyzico (Türkiye sanal POS entegrasyonu)

i18n & Tarih
├── react-i18next (TR/EN tam çoklu dil desteği)
└── date-fns (Tarih işlemleri, TR locale)

Grafikler & Veri Görselleştirme
└── Recharts (Dashboard gelir ve analitik grafikleri)
```

---

## Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser (Client)                    │
│         React 18 + TypeScript + Vite + Zustand              │
│              Framer Motion + TailwindCSS + shadcn/ui        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────┐
│                   Reverse Proxy (Caddy)                     │
│            Auto SSL + Gzip + Rate Limiting                  │
└──────────────┬──────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│              API Gateway (Node.js + Express)                │
│         TypeScript + Helmet + CORS + JWT Auth               │
└────────┬─────────────────┬──────────────┬───────────────────┘
         │                 │              │
┌────────▼──────┐  ┌───────▼──────┐  ┌───▼───────────┐
│   Supabase    │  │    Redis     │  │   Bull MQ     │
│  (DB + Auth + │  │  (Cache +   │  │  (Job Queue:  │
│   Storage +   │  │  Sessions)  │  │   Reminder,   │
│   Realtime)   │  └─────────────┘  │   Follow-up)  │
└───────────────┘                   └───────────────┘
```

---

## Sayfa & Route Yapısı

| Route | Sayfa | Erişim |
|-------|-------|--------|
| `/` | Landing Page | Herkese açık |
| `/auth` | Giriş / Kayıt | Herkese açık |
| `/book/:slug` | Public Booking Widget | Herkese açık |
| `/dashboard` | Ana Panel | Giriş gerekli |
| `/appointments` | Randevu Yönetimi | Giriş gerekli |
| `/customers` | Müşteri Listesi | Giriş gerekli |
| `/services` | Hizmet Kataloğu | Giriş gerekli |
| `/staff` | Personel Yönetimi | Giriş gerekli |
| `/payments` | Ödeme Geçmişi | Giriş gerekli |
| `/settings` | İşletme Ayarları | Giriş gerekli |

---

## Veritabanı Şeması

Appointify çok kiracılı (multi-tenant) bir mimariye sahiptir. Her işletme kendi `tenant` kaydıyla izole edilir.

```
tenants                ← İşletme / workspace
  ├── profiles         ← Kullanıcı profilleri (Supabase Auth ile eşleşir)
  ├── staff            ← Personel kayıtları
  ├── services         ← Hizmet tanımları
  ├── customers        ← Müşteri kayıtları
  ├── appointments     ← Randevular
  ├── payments         ← Ödeme işlemleri
  ├── notifications    ← Bildirim geçmişi
  ├── subscriptions    ← Abonelik planı
  ├── working_hours    ← Çalışma saatleri
  └── holidays         ← Tatil / kapalı günler
```

Tüm tablolarda **Row Level Security (RLS)** politikaları aktiftir; her tenant yalnızca kendi verisine erişebilir.

---

## Abonelik Planları

| Plan | Aylık (₺) | Yıllık (₺) | Personel | Lokasyon | Randevu/ay |
|------|-----------|------------|----------|----------|------------|
| **Solo** | ₺899 | ₺8.630 | 1 | 1 | 200 |
| **Team** | ₺1.499 | ₺14.390 | 5 | 1 | 500 |
| **Business** | ₺2.499 | ₺23.990 | 15 | 3 | 2.000 |
| **Enterprise** | ₺4.999 | ₺47.990 | Sınırsız | Sınırsız | Sınırsız |

Yıllık ödemelerde **%20 indirim** uygulanır. Tüm planlar **14 günlük ücretsiz deneme** ile başlar.

---

## Başlarken

### Gereksinimler

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Supabase** hesabı (veritabanı ve auth için)

### Yerel Geliştirme

```bash
# Repoyu klonla
git clone https://github.com/kutluhangil/Appointify.git
cd Appointify

# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenleyerek Supabase bilgilerinizi girin
```

`.env` dosyasına eklenecek değişkenler:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```bash
# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışır.

### Diğer Komutlar

```bash
npm run build        # Production build oluştur
npm run preview      # Production build'i önizle
npm run type-check   # TypeScript tip kontrolü
npm run lint         # ESLint çalıştır
npm run test         # Vitest ile testleri çalıştır
```

---

## Vercel ile Deployment (Canlıya Alma)

Vercel, React ve Vite projelerini canlıya almak için en hızlı platformlardan biridir. Bu projeyi kendi Vercel hesabınızda canlıya almak için aşağıdaki adımları izleyin.

### Gereksinimler

1. Bir [GitHub](https://github.com/) hesabı.
2. Bir [Vercel](https://vercel.com/) hesabı (GitHub ile giriş yapabilirsiniz).
3. Bir [Supabase](https://supabase.com/) projesi ve API anahtarları.

### Adım Adım Deployment

**Adım 1: Projeyi GitHub'a Yükleyin**

Eğer projeyi henüz kendi GitHub hesabınıza yüklemediyseniz, fork'layın veya yeni bir repository oluşturup push'layın.

**Adım 2: Vercel'e İçe Aktarın**

1. Vercel paneline giriş yapın.
2. **"Add New"** > **"Project"** butonuna tıklayın.
3. GitHub hesabınızı Vercel'e bağlayın.
4. `Appointify` projesini bulun ve **"Import"** butonuna tıklayın.

**Adım 3: Environment Variables**

"Environment Variables" bölümünü açın ve şu değişkenleri ekleyin:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGc...` |

**Adım 4: Deploy**

**"Deploy"** butonuna tıklayın. Vercel projenizi derleyecek ve canlıya alacaktır (genellikle 1-2 dakika).

### Sürekli Entegrasyon (CI/CD)

GitHub deponuzdaki `main` branch'ine yapacağınız her `git push`, Vercel tarafından otomatik olarak algılanır ve yeni versiyonunuz saniyeler içinde canlıya alınır.

```bash
git add .
git commit -m "feat: yeni özellik"
git push origin main
# → Vercel otomatik olarak deploy eder
```

---

## Proje Durumu

| Modül | Durum |
|-------|-------|
| Landing Page | ✅ Tamamlandı |
| Auth (Giriş / Kayıt) | ✅ Tamamlandı |
| Dashboard | ✅ Tamamlandı |
| Randevu Yönetimi | ✅ Tamamlandı |
| Müşteri Portalı | ✅ Tamamlandı |
| Hizmet Kataloğu | ✅ Tamamlandı |
| Personel Yönetimi | ✅ Tamamlandı |
| Ödeme Geçmişi | ✅ Tamamlandı |
| Public Booking Widget | ✅ Tamamlandı |
| Ayarlar (Profil, İşletme, Randevu, Bildirimler) | ✅ Tamamlandı |
| Supabase DB Migration (Appointify şeması) | 🔄 Devam Ediyor |
| Backend API (Node.js + Express) | 📋 Planlandı |
| SMS / WhatsApp Entegrasyonu | 📋 Planlandı |
| Stripe / Iyzico Ödeme | 📋 Planlandı |
| Bull MQ Job Queue (hatırlatmalar) | 📋 Planlandı |
| i18n TR/EN tam çeviri | 📋 Planlandı |

---

## Katkıda Bulunma

1. Bu repoyu fork'layın.
2. Yeni bir feature branch oluşturun: `git checkout -b feat/yeni-ozellik`
3. Değişikliklerinizi commit'leyin: `git commit -m "feat: yeni özellik açıklaması"`
4. Branch'inizi push'layın: `git push origin feat/yeni-ozellik`
5. Pull Request açın.

---

## Lisans

Bu proje [MIT Lisansı](LICENSE) altında dağıtılmaktadır.

---

<div align="center">

**Built with precision by [kutluhangil](https://github.com/kutluhangil/)**

*Randevu yönetimini kolaylaştırmak için tasarlandı.*

[![GitHub](https://img.shields.io/badge/GitHub-kutluhangil-C8FF00?style=flat-square&logo=github&logoColor=white&labelColor=0A0A0B)](https://github.com/kutluhangil)
[![Live Demo](https://img.shields.io/badge/Live_Demo-appointify--mu.vercel.app-C8FF00?style=flat-square&logo=vercel&logoColor=white&labelColor=0A0A0B)](https://appointify-mu.vercel.app)

</div>
