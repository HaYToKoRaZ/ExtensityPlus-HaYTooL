<p align="center">
  <img src="public/images/icon128.png" alt="Extensity+ HaYTooL Logo" width="110" style="border-radius: 50%; box-shadow: 0 8px 24px rgba(0,0,0,0.35);"/>
</p>

# <p align="center">⚡ Extensity+ HaYTooL (v3.1.0)</p>

<p align="center">
  <b>The Ultimate Browser Extension Manager: Instant Toggling, Custom Profiles, Rich Themes & Multi-Language Support</b><br/>
  <i>Tarayıcı Uzantılarınızı Zahmetsizce Yönetin: Anında Aç/Kapat, Özel Profiller, Zengin Temalar ve Çoklu Dil Desteği</i>
</p>

<p align="center">
  <a href="#-english-version"><b>🇬🇧 English Version</b></a> | <a href="#-türkçe-versiyon"><b>🇹🇷 Türkçe Versiyon</b></a> | <a href="https://haytokoraz.github.io/" target="_blank"><b>🌐 HaYTooL Portal (Diğer Uygulamalar / More Apps)</b></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Platform-Chrome%20%7C%20Edge%20%7C%20Helium%20%7C%20Brave-blue?style=for-the-badge" alt="Platform" />
  <img src="https://img.shields.io/badge/Language-TypeScript%20%7C%20React%2018-F7DF1E?style=for-the-badge&logo=typescript&logoColor=black" alt="Language" />
  <img src="https://img.shields.io/badge/Database-Chrome%20Storage%20Sync-red?style=for-the-badge&logo=googlechrome" alt="Database" />
  <br>
  <img src="https://img.shields.io/badge/UI-Tailwind%20CSS%20%7C%20Lucide%20Icons-1572B6?style=for-the-badge&logo=tailwindcss" alt="UI" />
  <img src="https://img.shields.io/badge/Themes-YouTube%20%7C%20Discord%20%7C%20Matrix%20%7C%20Dark-ff0000?style=for-the-badge" alt="Themes" />
  <img src="https://img.shields.io/badge/Locales-7%20Languages%20Auto--Detect-4af626?style=for-the-badge" alt="Locales" />
  <img src="https://img.shields.io/badge/Version-v3.1.0-purple?style=for-the-badge&logo=git" alt="Version" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  <a href="https://github.com/HaYToKoRaZ/ExtensityPlus-HaYTooL/releases/latest"><img src="https://img.shields.io/github/downloads/HaYToKoRaZ/ExtensityPlus-HaYTooL/latest/total?style=for-the-badge&color=blueviolet" alt="GitHub Downloads (latest release)" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-orange?style=flat-square&logo=googlechrome" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Vite-8.x_Blazing_Fast-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Bundle_Size-~308_KB-brightgreen?style=flat-square" alt="Bundle Size" />
  <img src="https://img.shields.io/badge/Zero_Telemetry-100%25_Private-success?style=flat-square" alt="Zero Telemetry" />
</p>

---

<p align="center">
  <b>📸 Application Screenshots / Uygulama Ekran Görüntüleri</b>
</p>
<p align="center">
  <img src="screenshots/1.jpeg" width="32%" alt="Options Page - Discord Theme & Languages" style="border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);" />
  <img src="screenshots/2.jpeg" width="32%" alt="Profiles & Always-On Manager" style="border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);" />
  <img src="screenshots/3.jpeg" width="32%" alt="Backup & Cloud Sync - GitHub Gist" style="border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);" />
</p>

---
---

# 🇬🇧 English Version

## 🎯 Overview & Philosophy

Modern web development and daily browsing quickly lead to "extension bloat." Dozens of active extensions consume hundreds of megabytes of RAM, clutter your browser toolbar, and degrade page load performance.

**Extensity+ HaYTooL** is a modern, high-performance rewrite of the classic extension switcher. Rebuilt from the ground up using **React 18**, **TypeScript**, **Tailwind CSS**, and **Manifest V3**, it empowers you to instantly enable, disable, and organize extensions with zero lag and total privacy.

---

## 🚀 Key Features

* **⚡ One-Click Master Switch:** Instantly turn off all extensions when you need maximum speed or battery life, then restore them with a single click.
* **📂 Custom Work Profiles:** Group your extensions into custom contexts (e.g. *Dev Work*, *Shopping*, *Design*, *Media*). Activating a profile enables only the required tools and disables the rest.
* **🔒 "Always On" Protection:** Mark critical extensions (password managers, ad blockers) as *Always On* so they never get disabled by the master switch or profile changes.
* **⭐ Pinned Favorites:** Keep your most frequently used extensions pinned at the top of your popup for instant access.
* **🎨 Custom Themes & Aesthetics:**
  - 💻 **Match System:** Seamlessly follows your operating system's dark/light preference.
  - ☀️ **Light & 🌙 Dark:** Hand-crafted, balanced color palettes.
  - 🔴 **YouTube Theme:** True black background with signature red accents.
  - 🎮 **Discord Theme:** Deep indigo-slate palette with Discord blurple styling.
  - 🟢 **Matrix Theme:** Hacker-terminal black with phosphor green glow and monospace typography.
* **🌍 Multi-Language & Auto-Detection (7 Languages):**
  - Includes full native translations: 🇹🇷 Türkçe, 🇬🇧 English, 🇩🇪 Deutsch, 🇪🇸 Español, 🇫🇷 Français, 🇷🇺 Русский, 🇸🇦 العربية.
  - Automatically identifies your browser's language on first launch.
  - Quick language switching with clean, crisp SVG country flag badges.
* **☁️ Cloud Backup & GitHub Gist Sync (`backup.html`):**
  - **Smart Gist Discovery:** Easily recover after a fresh OS install or device change. Simply provide a new GitHub token and Extensity+ will auto-locate and link your existing secret backup vault.
  - **Multi-Device & Browser Slots:** Maintain isolated backup profiles for different setups (e.g. `Edge / Windows`, `Helium / Windows`, `Chrome / macOS`).
  - **⏳ Time Machine (Version History):** Step backward in time and restore previous extension and profile configurations.
  - **🌐 Universal Store Resolver (Cross-Browser Migration):** Migrating between Edge, Helium, and Chrome? Store URLs and search paths are automatically adapted.
  - **⚡ Missing Extensions Assistant:** An interactive modal detects uninstalled extensions from your backup, opens store pages in one click, and confirms live installations instantly.
  - **💾 Offline JSON & Clipboard Mode:** Full offline privacy support — export and import `.json` files or copy/paste directly from your clipboard without any tokens or network calls.
  - **🔒 Security & Zero-Leak Architecture:** Your GitHub Token is saved solely in your local browser's storage (`chrome.storage.local`). It is NEVER packaged into the extension zip, NEVER committed to Git, and NEVER transmitted to third parties. Only the minimal `gist` scope is requested.
* **🚀 Lightweight & Privacy First:** Zero external network calls (direct communication with `api.github.com` only when cloud sync is explicitly enabled), zero tracking/telemetry, and under 310 KB total bundle size.

---

## 🛠️ Installation & Setup

### Option 1: Direct Download from GitHub Releases (Recommended)
1. Go to the [Latest Releases](https://github.com/HaYToKoRaZ/ExtensityPlus-HaYTooL/releases/latest) page.
2. Download `ExtensityPlus-HaYTooL-v3.1.0-WebStore.zip` and unzip it.
3. Open your browser's extension page (`chrome://extensions` or `edge://extensions`).
4. Turn on **Developer Mode** (top-right toggle).
5. Click **Load unpacked** and select the unzipped folder.

### Option 2: Build from Source
```bash
# Clone the repository
git clone https://github.com/HaYToKoRaZ/ExtensityPlus-HaYTooL.git
cd ExtensityPlus-HaYTooL/ExtensityPlus-HaYTooL

# Install dependencies
npm install

# Build the project
npm run build
```
The compiled, production-ready extension will be inside the `dist/` directory.

---

## ⌨️ Keyboard Shortcuts & Quick Access
- Open the extension popup from anywhere using your browser's shortcut manager (`chrome://extensions/shortcuts`).
- Instant search filter: start typing immediately upon opening the popup.

---

## 🌐 Ecosystem & More Apps
Explore other browser extensions, start pages, and web tools by HaYTo:
* **HaYTooL Portal:** [haytokoraz.github.io](https://haytokoraz.github.io/)
* **Official Website:** [Extensity+ Landing Page](https://haytokoraz.github.io/ExtensityPlus-HaYTooL/)
* **GitHub Profile:** [@HaYToKoRaZ](https://github.com/HaYToKoRaZ)

---
---

# 🇹🇷 Türkçe Versiyon

## 🎯 Genel Bakış ve Felsefe

Günlük web gezintisi ve geliştirme süreçlerinde onlarca eklenti kurarız. Ancak açık kalan her eklenti yüksek miktarda RAM tüketir, tarayıcıyı hantallaştırır ve pil ömrünü kısaltır.

**Extensity+ HaYTooL**, efsanevi eklenti yöneticisinin modern web teknolojileriyle baştan yaratılmış, yüksek performanslı ve gizlilik odaklı sürümüdür. **React 18**, **TypeScript**, **Tailwind CSS** ve **Manifest V3** mimarisiyle yeniden inşa edilen bu araç, tarayıcınızın tam kontrolünü parmaklarınızın ucuna getirir.

---

## 🚀 Öne Çıkan Özellikler

* **⚡ Tek Tıkla Ana Şalter:** Performans veya oyun modu gerektiğinde tek tıkla tüm eklentileri kapatın, işiniz bittiğinde aynı tek tıkla eski haline döndürün.
* **📂 Akıllı Profiller:** Eklentilerinizi kullanım alanlarına göre gruplayın (*Yazılım*, *Alışveriş*, *Tasarım*, *Sosyal Medya*). Bir profile geçtiğinizde yalnızca o profildeki eklentiler açılır, diğerleri otomatik kapatılır.
* **🔒 "Daima Açık" Güvencesi:** Şifre yöneticisi veya reklam engelleyici gibi hayati eklentileri *Daima Açık* olarak işaretleyin; ana şalter kapansa bile bu eklentiler asla kapanmaz.
* **⭐ Favorileri Sabitle:** En çok kullandığınız uzantıları listenin en tepesine sabitleyerek anında erişin.
* **🎨 6 Farklı Tema Seçeneği:**
  - 💻 **Sistemle Eşle:** İşletim sisteminizin açık/koyu modunu otomatik takip eder.
  - ☀️ **Açık & 🌙 Koyu:** Gözü yormayan modern kontrast paletleri.
  - 🔴 **YouTube Teması:** Saf sinematik siyah arka plan ve YouTube kırmızı vurguları.
  - 🎮 **Discord Teması:** Koyu lacivert/gri tonlar ve resmi Discord moru (Blurple).
  - 🟢 **Matrix Teması:** Hacker terminali siyahı, fosforlu Matrix yeşili ve monospace yazı tipi.
* **🌍 7 Dil ve Otomatik Dil Algılama:**
  - Tam yerelleştirme desteği: 🇹🇷 Türkçe, 🇬🇧 English, 🇩🇪 Deutsch, 🇪🇸 Español, 🇫🇷 Français, 🇷🇺 Русский, 🇸🇦 العربية.
  - Tarayıcınız hangi dildeyse ilk açılışta otomatik olarak o dili seçer.
  - Vektörel gerçek SVG ülke bayrakları ile Ayarlar sayfasından anında dil değiştirilebilir.
* **☁️ Bulut Yedekleme & GitHub Gist Senkronizasyonu (`backup.html`):**
  - **Akıllı Gist Keşfi (Format ve Cihaz Kurtarma):** Bilgisayarınıza format attıysanız veya yeni bir cihaza geçtiyseniz endişelenmeyin! GitHub'dan yeni bir belirteç (PAT) girdiğinizde, Extensity+ hesabınızdaki gizli yedek kasasını otomatik olarak bulur ve bağlar.
  - **Çoklu Cihaz ve Yuva Desteği (Multi-Slot):** Farklı tarayıcı ve cihazlarınız için ayrı yedek yuvaları oluşturun (ör. `Edge / Windows`, `Helium / Windows`, `Chrome / macOS`).
  - **⏳ Zaman Makinesi (Sürüm Geçmişi):** Geçmiş commit tarihlerine göz atın ve dilediğiniz bir tarihteki eklenti ve profil düzeninize tek tıkla geri dönün.
  - **🌐 Evrensel Mağaza Çözümleyicisi (Edge ⇄ Helium ⇄ Chrome Köprüsü):** Edge'den aldığınız yedeği Helium veya Chrome'a aktarırken mağaza bağlantıları otomatik olarak evrensel linklere dönüştürülür.
  - **⚡ Eksik Eklenti Kurulum Asistanı:** Yedeğinizdeki kurulu olmayan eklentileri listeleyen akıllı asistan; tek tıkla mağaza sayfalarını açar ve siz kurdukça canlı olarak yeşil rozetle onaylar.
  - **💾 Çevrimdışı JSON ve Pano Modu:** İnternetsiz veya tokensiz kullanım: `.json` dosyası indirin/yükleyin ya da panoya kopyalayıp yapıştırın.
  - **🔒 Güvenlik & Sıfır Sızıntı Garantisi:** Girilen GitHub token'ı yalnızca kullanıcının kendi yerel tarayıcı belleğinde (`chrome.storage.local`) saklanır. Asla kaynak kodlara, Git deposuna veya dağıtım ZIP paketine dahil olmaz; üçüncü taraf sunucularla paylaşılmaz.
* **🛡️ Sıfır Telemetri & %100 Gizlilik:** Dış sunuculara hiçbir veri göndermez (yalnızca kullanıcı bulut yedeklemeyi açtığında doğrudan `api.github.com` ile iletişim kurulur), izleme kodu içermez ve ~310 KB ultra hafif boyuta sahiptir.

---

## 🛠️ Kurulum

### Yöntem 1: GitHub Releases Üzerinden (Hızlı Kurulum)
1. [En Son Sürümler (Releases)](https://github.com/HaYToKoRaZ/ExtensityPlus-HaYTooL/releases/latest) sayfasına gidin.
2. `ExtensityPlus-HaYTooL-v3.1.0-WebStore.zip` dosyasını indirin ve bir klasöre çıkartın.
3. Tarayıcınızda eklentiler sayfasına gidin (`chrome://extensions` veya `edge://extensions`).
4. Sağ üst köşedeki **Geliştirici Modu (Developer Mode)** anahtarını açın.
5. **Paketlenmemiş öge yükle (Load unpacked)** butonuna tıklayın ve çıkarttığınız klasörü seçin.

### Yöntem 2: Kaynak Koddan Derleme
```bash
git clone https://github.com/HaYToKoRaZ/ExtensityPlus-HaYTooL.git
cd ExtensityPlus-HaYTooL/ExtensityPlus-HaYTooL
npm install
npm run build
```
Derlenen eklenti `dist/` klasöründe hazır olacaktır.

---

## 📞 Destek, Ekosistem ve İletişim

* **🌐 Diğer Uygulamalarım (HaYTooL Portal):** [haytokoraz.github.io](https://haytokoraz.github.io/) *(Tüm açık kaynaklı tarayıcı araçları, başlangıç sayfaları ve uygulamalarım)*
* **Web Sitesi:** [Extensity+ Tanıtım & Bilgi Sayfası](https://haytokoraz.github.io/ExtensityPlus-HaYTooL/)
* **GitHub:** [HaYToKoRaZ/ExtensityPlus-HaYTooL](https://github.com/HaYToKoRaZ/ExtensityPlus-HaYTooL)
* **E-posta:** `korazhayto@gmail.com`

*Geliştirici:* **HaYTo**
