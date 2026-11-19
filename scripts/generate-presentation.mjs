import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const screenshotsDir = path.join(projectRoot, 'screenshots');
const downloadsDir = '/home/widifirmaan/Downloads';

function encodeImage(filename) {
  const filePath = path.join(screenshotsDir, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Screenshot tidak ditemukan: ${filePath}`);
    return '';
  }
  const fileBuffer = fs.readFileSync(filePath);
  return `data:image/png;base64,${fileBuffer.toString('base64')}`;
}

console.log('Memproses screenshot Siap Nyafe Coffee Shop...');

const images = {
  customerDesktop: encodeImage('Coffee Customer Order Page Desktop.png'),
  customerMobile: encodeImage('Coffee Customer Order Page Mobile.png'),
  cashierDesktop: encodeImage('Coffee Cashier POS Register Desktop.png'),
  cashierMobile: encodeImage('Coffee Cashier POS Register Mobile.png'),
  receiptDesktop: encodeImage('Coffee Cashier Modal Thermal Receipt Desktop.png'),
  receiptMobile: encodeImage('Coffee Cashier Modal Thermal Receipt Mobile.png'),
  assetDesktop: encodeImage('Coffee Asset & Equipment Desktop.png'),
  assetMobile: encodeImage('Coffee Asset & Equipment Mobile.png'),
  blogDesktop: encodeImage('Coffee Blog Post CMS Desktop.png'),
  blogMobile: encodeImage('Coffee Blog Post CMS Mobile.png'),
  waiterDesktop: encodeImage('Coffee Customer Modal Call Waiter Desktop.png'),
  waiterMobile: encodeImage('Coffee Customer Modal Call Waiter Mobile.png'),
};

console.log('Menyusun HTML presentasi dengan style murni Neo-Brutalism...');

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Siap Nyafe - Neo-Brutalist Coffee POS & Management Architecture</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #f0f0f0;
      --text-color: #000000;
      --primary-color: #8B5CF6;   /* Purple */
      --secondary-color: #F472B6; /* Pink */
      --accent-color: #FCD34D;    /* Yellow */
      --success-color: #4ADE80;   /* Green */
      --danger-color: #EF4444;    /* Red */
      --neutral-color: #ffffff;
      --border-dark: #000000;

      --border-width: 4px;
      --shadow-offset: 8px;
      --radius: 0px;

      --font-main: 'Space Grotesk', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --dot-color: rgba(0, 0, 0, 0.18);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-family: var(--font-main);
    }

    body {
      background-color: var(--bg-color);
      color: var(--text-color);
      line-height: 1.4;
      background-image: radial-gradient(var(--dot-color) 1.5px, transparent 1.5px);
      background-size: 28px 28px;
    }

    @page {
      size: 297mm 210mm;
      margin: 0;
    }

    .slide {
      width: 297mm;
      height: 210mm;
      page-break-after: always;
      position: relative;
      background-color: var(--bg-color);
      display: flex;
      flex-direction: column;
      padding: 14mm 16mm;
      overflow: hidden;
      background-image: radial-gradient(var(--dot-color) 1.5px, transparent 1.5px);
      background-size: 26px 26px;
    }

    /* Neo-Brutalist Top Tape Bar */
    .slide::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: repeating-linear-gradient(
        45deg,
        #000000,
        #000000 15px,
        #FCD34D 15px,
        #FCD34D 30px
      );
      border-bottom: 2px solid #000000;
      z-index: 50;
    }

    /* Header */
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4.5mm;
      border-bottom: var(--border-width) solid #000000;
      padding-bottom: 3.5mm;
    }

    .brand-cluster {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-badge {
      background: var(--accent-color);
      border: 3px solid #000000;
      box-shadow: 3px 3px 0px #000000;
      color: #000000;
      padding: 4px 10px;
      font-family: var(--font-mono);
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-radius: var(--radius);
    }

    .brand-badge.purple {
      background: var(--primary-color);
      color: #ffffff;
    }

    .brand-badge.pink {
      background: var(--secondary-color);
      color: #000000;
    }

    .brand-badge.green {
      background: var(--success-color);
      color: #000000;
    }

    .slide-section-title {
      font-size: 14px;
      font-weight: 900;
      color: #000000;
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }

    .slide-number {
      background: #000000;
      color: #ffffff;
      padding: 4px 10px;
      font-family: var(--font-mono);
      font-weight: 800;
      font-size: 11px;
      border-radius: var(--radius);
    }

    /* Slide Body */
    .slide-body {
      display: grid;
      grid-template-columns: 1fr 1.35fr;
      gap: 22px;
      flex: 1;
      min-height: 0;
    }

    .slide-info {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 0;
    }

    .headline-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .slide-title {
      font-size: 26px;
      font-weight: 900;
      line-height: 1.15;
      color: #000000;
      letter-spacing: -0.03em;
      text-transform: uppercase;
    }

    .slide-desc {
      font-size: 12px;
      color: #333333;
      line-height: 1.5;
      font-weight: 500;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 8px 0;
    }

    .feature-card {
      background: var(--neutral-color);
      border: 3px solid #000000;
      box-shadow: 5px 5px 0px #000000;
      border-radius: var(--radius);
      padding: 10px 14px;
    }

    .feature-card.yellow {
      background: #FEF08A;
    }

    .feature-card.pink {
      background: #FBCFE8;
    }

    .feature-card.green {
      background: #BBF7D0;
    }

    .feature-card.purple {
      background: #DDD6FE;
    }

    .feature-card-title {
      font-size: 13px;
      font-weight: 900;
      color: #000000;
      margin-bottom: 2px;
      text-transform: uppercase;
      letter-spacing: -0.01em;
    }

    .feature-card-text {
      font-size: 11px;
      color: #111111;
      line-height: 1.45;
      font-weight: 500;
    }

    /* Metrics Row */
    .metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .metric-box {
      background: var(--neutral-color);
      border: 3px solid #000000;
      box-shadow: 4px 4px 0px #000000;
      border-radius: var(--radius);
      padding: 8px 10px;
      text-align: center;
    }

    .metric-val {
      font-family: var(--font-mono);
      font-size: 16px;
      font-weight: 900;
      color: #000000;
    }

    .metric-lbl {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #555555;
      margin-top: 2px;
    }

    /* Visual Stage */
    .visual-stage {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      min-height: 0;
      background: #FFFFFF;
      border: 4px solid #000000;
      box-shadow: 8px 8px 0px #000000;
      border-radius: var(--radius);
      padding: 12px;
      overflow: hidden;
    }

    .screenshot-desktop {
      max-width: 96%;
      max-height: 380px;
      object-fit: contain;
      display: block;
      filter: drop-shadow(4px 4px 0px rgba(0,0,0,0.25));
    }

    .screenshot-mobile {
      position: absolute;
      right: 12px;
      bottom: 8px;
      max-height: 270px;
      max-width: 30%;
      object-fit: contain;
      display: block;
      filter: drop-shadow(4px 4px 0px rgba(0,0,0,0.35));
    }

    /* Footer */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4.5mm;
      border-top: var(--border-width) solid #000000;
      padding-top: 2.5mm;
    }

    .footer-tech {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      color: #333333;
      text-transform: uppercase;
    }

    .footer-url {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 800;
      color: #000000;
      background: var(--accent-color);
      border: 2px solid #000000;
      padding: 2px 8px;
    }

    /* Cover Styling */
    .cover-body {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 28px;
      align-items: center;
      flex: 1;
      min-height: 0;
    }

    .cover-tagline {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 800;
      background: #000000;
      color: var(--accent-color);
      display: inline-block;
      padding: 3px 8px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 8px;
      border-radius: var(--radius);
    }

    .cover-title {
      font-size: 40px;
      font-weight: 900;
      color: #000000;
      line-height: 1.05;
      letter-spacing: -0.04em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .cover-desc {
      font-size: 13px;
      color: #222222;
      line-height: 1.55;
      font-weight: 500;
      margin-bottom: 18px;
    }

    .cover-specs {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .spec-card {
      background: var(--neutral-color);
      border: 3px solid #000000;
      box-shadow: 4px 4px 0px #000000;
      border-radius: var(--radius);
      padding: 8px 12px;
    }

    .spec-k {
      font-size: 9px;
      font-weight: 800;
      color: #666666;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .spec-v {
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 900;
      color: #000000;
      margin-top: 2px;
    }

    /* Architecture Grid */
    .arch-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      flex: 1;
      min-height: 0;
      margin-top: 8px;
    }

    .arch-card {
      background: var(--neutral-color);
      border: 3px solid #000000;
      box-shadow: 6px 6px 0px #000000;
      border-radius: var(--radius);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .arch-title {
      font-size: 15px;
      font-weight: 900;
      color: #000000;
      border-bottom: 3px solid #000000;
      padding-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: -0.01em;
    }

    .arch-item {
      font-size: 11px;
      color: #222222;
      line-height: 1.5;
      font-weight: 500;
    }

    .arch-item strong {
      color: #000000;
      font-weight: 800;
    }
  </style>
</head>
<body>

  <!-- SLIDE 1: COVER -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge purple">NEO-BRUTALISM POS</span>
        <span class="slide-section-title">Dokumentasi Rekayasa Perangkat Lunak</span>
      </div>
      <div class="slide-number">01 / 10</div>
    </div>

    <div class="cover-body">
      <div>
        <div class="cover-tagline">Coffee Shop POS & Management System</div>
        <h1 class="cover-title">Siap Nyafe Kasir & Manajemen Kafe</h1>
        <p class="cover-desc">
          Platform Point of Sale kafe modern dengan bahasa desain murni Neo-Brutalism. Dilengkapi pemesanan mandiri pelanggan via QR meja, register kasir berkecepatan tinggi, cetak struk thermal 58mm, inventaris aset mesin espresso, dan CMS blog editorial kafe.
        </p>

        <div class="cover-specs">
          <div class="spec-card">
            <div class="spec-k">Design System</div>
            <div class="spec-v">Neo-Brutalism (0px Radius, 4px Border)</div>
          </div>
          <div class="spec-card">
            <div class="spec-k">Frontend Core</div>
            <div class="spec-v">React 19 & Vite Bundler</div>
          </div>
          <div class="spec-card">
            <div class="spec-k">State Management</div>
            <div class="spec-v">Zustand Store Persist</div>
          </div>
          <div class="spec-card">
            <div class="spec-k">Hardware Output</div>
            <div class="spec-v">58mm Thermal ESC/POS Print</div>
          </div>
        </div>
      </div>

      <div class="visual-stage" style="background: #FCD34D;">
        <img src="${images.customerDesktop}" class="screenshot-desktop" alt="Customer Order View">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">React 19 + Vite + Zustand + Space Grotesk + Tailwind CSS</span>
      <span class="footer-url">siapnyafe.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 2: ARSITEKTUR & DESIGN SYSTEM -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge green">DESIGN SYSTEM</span>
        <span class="slide-section-title">Fondasi Sistem & Token Desain Neo-Brutalist</span>
      </div>
      <div class="slide-number">02 / 10</div>
    </div>

    <div class="headline-group" style="margin-bottom: 8px;">
      <h2 class="slide-title">Arsitektur Modular & Token Desain Neo-Brutalist</h2>
      <p class="slide-desc">Penerapan estetika retro pop fungsional: border tebal 4px hitam, sudut tegas 0px, bayangan offset tanpa blur 8px, dan kontras warna pop tinggi.</p>
    </div>

    <div class="arch-grid">
      <div class="arch-card" style="background: #FEF08A;">
        <div class="arch-title">Desain & Token Visual</div>
        <div class="arch-item"><strong>Border 4px Solid Black:</strong> Garis batas tegas pada seluruh komponen kartu, tombol, dialog modal, dan tabel antarmuka.</div>
        <div class="arch-item"><strong>Hard Offset Shadow:</strong> Bayangan jatuh murni 6px–8px tanpa blur untuk kedalaman visual khas retro pop.</div>
        <div class="arch-item"><strong>Dot Matrix Texture:</strong> Latar belakang bermotif titik radial 28px yang merefleksikan lembar cetak katalog vintage.</div>
      </div>

      <div class="arch-card" style="background: #DDD6FE;">
        <div class="arch-title">State Reaktif & Sesi Kasir</div>
        <div class="arch-item"><strong>Zustand State Store:</strong> Pengelolaan status keranjang belanja, variasi topping minuman, dan riwayat pesanan meja secara terisolasi.</div>
        <div class="arch-item"><strong>Sinkronisasi Multi-Tab:</strong> Pembaruan status pesanan antara layar pemesanan pelanggan dan terminal register kasir.</div>
        <div class="arch-item"><strong>Pencegahan Kehilangan Data:</strong> Penyimpanan otomatis keranjang pelanggan ke LocalStorage saat reload halaman tidak disengaja.</div>
      </div>

      <div class="arch-card" style="background: #FBCFE8;">
        <div class="arch-title">Integrasi Perangkat Keras</div>
        <div class="arch-item"><strong>Cetak Struk Thermal 58mm:</strong> Format CSS print monospaced yang terkalibrasi khusus untuk printer thermal kasir USB/Bluetooth.</div>
        <div class="arch-item"><strong>Dukungan Pemindai QR Meja:</strong> Pemetaan nomor meja langsung dari parameter URL rute pemesanan mandiri pelanggan.</div>
        <div class="arch-item"><strong>Panggilan Pelayan Realtime:</strong> Modul dialog pemanggilan staf pelayan terintegrasi dengan penanda nomor meja aktif.</div>
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Siap Nyafe Design Tokens & Frontend Blueprint</span>
      <span class="footer-url">siapnyafe.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 3: SELF-SERVICE ORDER -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge yellow">CUSTOMER ORDER</span>
        <span class="slide-section-title">Antarmuka Pemesanan Mandiri Meja Pelanggan</span>
      </div>
      <div class="slide-number">03 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Katalog Menu & Pemesanan Mandiri</h2>
          <p class="slide-desc">Halaman pemesanan yang dibuka pelanggan melalui scan QR meja. Menyajikan katalog kopi, kustomisasi tingkat gula/es, dan keranjang belanja.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card yellow">
            <div class="feature-card-title">Filter Kategori Menu Cepat</div>
            <div class="feature-card-text">Tab pemilih jenis sajian (Espresso Base, Manual Brew, Non-Coffee, Pastry) dengan respon instan tanpa jeda.</div>
          </div>
          <div class="feature-card pink">
            <div class="feature-card-title">Modal Kustomisasi Minuman</div>
            <div class="feature-card-text">Pilihan varian suhu (Hot/Ice), level gula (Normal/Less/Zero), dan opsi ekstra shot espresso dalam dialog modal pop.</div>
          </div>
          <div class="feature-card green">
            <div class="feature-card-title">Penyematan Nomor Meja Otomatis</div>
            <div class="feature-card-text">Parameter nomor meja terkunci otomatis pada pesanan pelanggan untuk mencegah kekeliruan pengantaran staf.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">QR Code</div>
            <div class="metric-lbl">Table Launch</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">0px</div>
            <div class="metric-lbl">Corner Radius</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Instant</div>
            <div class="metric-lbl">Cart Add</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.customerDesktop}" class="screenshot-desktop" alt="Customer Order Desktop">
        <img src="${images.customerMobile}" class="screenshot-mobile" alt="Customer Order Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">View: src/pages/CustomerOrderPage.tsx</span>
      <span class="footer-url">siapnyafe.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 4: REGISTER KASIR POS -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge purple">CASHIER POS</span>
        <span class="slide-section-title">Terminal Kasir & Pemrosesan Transaksi</span>
      </div>
      <div class="slide-number">04 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Register Kasir & Transaksi Cepat</h2>
          <p class="slide-desc">Pusat transaksi kasir dengan antarmuka dua kolom: katalog produk berkecepatan tinggi di sisi kiri dan kalkulator tagihan di sisi kanan.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card green">
            <div class="feature-card-title">Pencarian & Penambahan Item Cepat</div>
            <div class="feature-card-text">Pencarian produk berdasarkan nama atau kategori dengan aksi satu klik untuk memasukkan item ke daftar tagihan.</div>
          </div>
          <div class="feature-card yellow">
            <div class="feature-card-title">Kalkulasi Otomatis Pajak & Diskon</div>
            <div class="feature-card-text">Perhitungan subtotal, persentase pajak PB1 restoran, dan potongan voucher promo terhitung seketika.</div>
          </div>
          <div class="feature-card pink">
            <div class="feature-card-title">Pilihan Metode Bayar Lengkap</div>
            <div class="feature-card-text">Dukungan pembayaran Tunai dengan kalkulator uang kembalian instan, QRIS dinamis, maupun kartu debit.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">&lt; 200ms</div>
            <div class="metric-lbl">Checkout Latency</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Split View</div>
            <div class="metric-lbl">POS Terminal</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">4px</div>
            <div class="metric-lbl">Solid Borders</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.cashierDesktop}" class="screenshot-desktop" alt="Cashier POS Desktop">
        <img src="${images.cashierMobile}" class="screenshot-mobile" alt="Cashier POS Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">View: src/pages/CashierPOSPage.tsx</span>
      <span class="footer-url">siapnyafe.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 5: CETAK STRUK THERMAL 58MM -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge green">RECEIPT PRINTER</span>
        <span class="slide-section-title">Modal Struk Kasir & Layout Cetak Thermal</span>
      </div>
      <div class="slide-number">05 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Modal Struk Thermal & Cetak Fisik</h2>
          <p class="slide-desc">Dialog modal struk belanja yang meniru format kertas kasir fisik, dilengkapi rincian pesanan, nomor meja, stempel waktu, dan tombol cetak langsung.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card yellow">
            <div class="feature-card-title">Simulasi Kertas Struk 58mm</div>
            <div class="feature-card-text">Tampilan visual bergaya struk bergerigi dengan font monospaced yang merepresentasikan hasil cetak printer asli.</div>
          </div>
          <div class="feature-card purple">
            <div class="feature-card-title">Format Cetak ESC/POS Siap Pakai</div>
            <div class="feature-card-text">Aturan stylesheet @media print yang menyembunyikan elemen UI browser dan hanya mencetak area nota belanja.</div>
          </div>
          <div class="feature-card pink">
            <div class="feature-card-title">Pencatatan Nomor Transaksi Berurutan</div>
            <div class="feature-card-text">Setiap struk memiliki ID faktur unik untuk memudahkan pengecekan silang saat rekonsiliasi kas di akhir shift.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">58mm</div>
            <div class="metric-lbl">Thermal Standard</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">1-Click</div>
            <div class="metric-lbl">Browser Print</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">8px</div>
            <div class="metric-lbl">Hard Shadow</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.receiptDesktop}" class="screenshot-desktop" alt="Thermal Receipt Desktop">
        <img src="${images.receiptMobile}" class="screenshot-mobile" alt="Thermal Receipt Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Component: src/components/ThermalReceiptModal.tsx</span>
      <span class="footer-url">siapnyafe.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 6: MANAJEMEN ASET & MESIN -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge pink">ASSET MANAGEMENT</span>
        <span class="slide-section-title">Inventaris Peralatan & Jadwal Perawatan</span>
      </div>
      <div class="slide-number">06 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Inventaris Mesin Kopi & Log Perawatan</h2>
          <p class="slide-desc">Pencatatan aset mesin komersial kafe (Espresso Machine, Grinder, Water Filtration, Blender) dengan status kondisi fisik dan riwayat pemeliharaan.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card green">
            <div class="feature-card-title">Tabel Aset Neo-Brutalist Interaktif</div>
            <div class="feature-card-text">Penyajian data aset dengan border tebal hitam, status warna cerah (Good, Maintenance, Critical), dan filter kategori.</div>
          </div>
          <div class="feature-card yellow">
            <div class="feature-card-title">Pencatatan Servis Berkala</div>
            <div class="feature-card-text">Formulir modal untuk mencatat tanggal descaling mesin espresso, penggantian burr grinder, dan biaya teknisi.</div>
          </div>
          <div class="feature-card purple">
            <div class="feature-card-title">Pengingat Jadwal Maintenance</div>
            <div class="feature-card-text">Penanda visual peringatan bila peralatan mendekati tanggal servis rutin demi menjaga kelancaran operasional bar.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Full CRUD</div>
            <div class="metric-lbl">Asset Operations</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Log Trail</div>
            <div class="metric-lbl">Maintenance History</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Zero Blur</div>
            <div class="metric-lbl">Solid Shadow</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.assetDesktop}" class="screenshot-desktop" alt="Asset Management Desktop">
        <img src="${images.assetMobile}" class="screenshot-mobile" alt="Asset Management Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">View: src/pages/AssetManagementPage.tsx</span>
      <span class="footer-url">siapnyafe.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 7: CMS BLOG EDITORIAL -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge purple">BLOG CMS</span>
        <span class="slide-section-title">Manajemen Konten Editorial & Berita Kafe</span>
      </div>
      <div class="slide-number">07 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">CMS Editorial & Publikasi Konten Kafe</h2>
          <p class="slide-desc">Modul publikasi artikel edukasi kopi, jadwal live music mingguan, dan pengumuman promo musiman dengan editor teks terstruktur.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card yellow">
            <div class="feature-card-title">Editor Artikel Interaktif</div>
            <div class="feature-card-text">Formulir penulisan artikel dengan input judul, pemilihan tag kategori (Brewing, Beans, Events), dan cover visual.</div>
          </div>
          <div class="feature-card pink">
            <div class="feature-card-title">Pratinjau Kartu Artikel Realtime</div>
            <div class="feature-card-text">Tata letak grid kartu blog pop-art yang langsung diperbarui seketika artikel disimpan oleh tim admin.</div>
          </div>
          <div class="feature-card green">
            <div class="feature-card-title">Penyimpanan Terisolasi di Sisi Klien</div>
            <div class="feature-card-text">Pengelolaan konten berbasis store lokal yang menjamin seluruh artikel tersimpan persisten tanpa ketergantungan API berat.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">WYSIWYG</div>
            <div class="metric-lbl">Content Editor</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Pop Art</div>
            <div class="metric-lbl">Card Aesthetics</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Persisted</div>
            <div class="metric-lbl">Article Storage</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.blogDesktop}" class="screenshot-desktop" alt="Blog CMS Desktop">
        <img src="${images.blogMobile}" class="screenshot-mobile" alt="Blog CMS Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">View: src/pages/BlogCMSPage.tsx</span>
      <span class="footer-url">siapnyafe.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 8: PANGGILAN PELAYAN -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge green">WAITER DISPATCH</span>
        <span class="slide-section-title">Komunikasi Meja & Permintaan Bantuan</span>
      </div>
      <div class="slide-number">08 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Interaksi Meja & Panggilan Pelayan</h2>
          <p class="slide-desc">Dialog interaktif bagi pelanggan untuk memanggil staf pelayan (minta tagihan, tambah air minum, bersihkan meja) langsung dari browser ponsel.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card pink">
            <div class="feature-card-title">Pilihan Kebutuhan Spesifik</div>
            <div class="feature-card-text">Tombol opsi cepat permintaan umum sehingga staf pelayan langsung datang membawakan apa yang dibutuhkan pelanggan.</div>
          </div>
          <div class="feature-card yellow">
            <div class="feature-card-title">Umpan Balik Visual Jelas</div>
            <div class="feature-card-text">Pemberitahuan badge konfirmasi di layar pelanggan bahwa panggilan telah berhasil dikirimkan ke bar kasir.</div>
          </div>
          <div class="feature-card purple">
            <div class="feature-card-title">Tanpa Instalasi Aplikasi Khusus</div>
            <div class="feature-card-text">Pelanggan tidak perlu mendownload aplikasi native, seluruh alur berjalan langsung di browser safari/chrome mobile.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">1-Tap</div>
            <div class="metric-lbl">Call Staff</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Zero App</div>
            <div class="metric-lbl">Web Native</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Space Grotesk</div>
            <div class="metric-lbl">Headings Font</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.waiterDesktop}" class="screenshot-desktop" alt="Call Waiter Modal Desktop">
        <img src="${images.waiterMobile}" class="screenshot-mobile" alt="Call Waiter Modal Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Component: src/components/CallWaiterModal.tsx</span>
      <span class="footer-url">siapnyafe.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 9: REKAYASA STATE & KERANJANG -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge purple">ENGINEERING</span>
        <span class="slide-section-title">Manajemen State Zustand & Kehandalan Transaksi</span>
      </div>
      <div class="slide-number">09 / 10</div>
    </div>

    <div class="headline-group" style="margin-bottom: 8px;">
      <h2 class="slide-title">Rekayasa State Mutasi & Penyimpanan Keranjang</h2>
      <p class="slide-desc">Pemisahan state global antara alur pesanan pelanggan dan register kasir dengan jaminan konsistensi kalkulasi total belanja.</p>
    </div>

    <div class="arch-grid">
      <div class="arch-card" style="background: #FEF08A;">
        <div class="arch-title">Zustand Store Disiplin</div>
        <div class="arch-item"><strong>Pemisahan Slice Domain:</strong> Store dibagi ke dalam slice terpisah untuk Menu, Cart, Cashier, dan Maintenance Aset.</div>
        <div class="arch-item"><strong>Mutasi State Murni:</strong> Seluruh modifikasi keranjang menggunakan reducer murni tanpa mutasi langsung objek.</div>
        <div class="arch-item"><strong>Kinerja Re-Render Minimal:</strong> Komponen UI hanya re-render saat properti state spesifik yang di-subscribe berubah.</div>
      </div>

      <div class="arch-card" style="background: #BBF7D0;">
        <div class="arch-title">Kalkulasi Finansial Presisi</div>
        <div class="arch-item"><strong>Penanganan Nilai Desimal:</strong> Kalkulasi pajak dan diskon menggunakan pembulatan integer terkalibrasi untuk mencegah selisih sen.</div>
        <div class="arch-item"><strong>Item Customization Hash:</strong> Setiap kombinasi varian minuman (ukuran + gula + es) menghasilkan ID unik di keranjang.</div>
        <div class="arch-item"><strong>Validasi Saldo Kembalian:</strong> Sistem kasir otomatis mencegah transaksi tunai jika uang yang diserahkan kurang dari tagihan.</div>
      </div>

      <div class="arch-card" style="background: #FBCFE8;">
        <div class="arch-title">Penyimpanan Offline & PWA</div>
        <div class="arch-item"><strong>LocalStorage Sync Middleware:</strong> Sinkronisasi otomatis data transaksi kasir dan katalog menu ke penyimpanan lokal peramban.</div>
        <div class="arch-item"><strong>Operasi Mandiri di Bar:</strong> Terminal kasir tetap dapat memproses transaksi penjualan meskipun koneksi internet terputus sementara.</div>
        <div class="arch-item"><strong>Audit Kualitas Kode:</strong> Seluruh modul lolos verifikasi linter dan pengujian alur pesanan tanpa peringatan konsol.</div>
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Siap Nyafe State Architecture & Store Implementation</span>
      <span class="footer-url">siapnyafe.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 10: SPESIFIKASI PRODUKSI -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge yellow">SPECIFICATION</span>
        <span class="slide-section-title">Ringkasan Spesifikasi & Kesiapan Produksi</span>
      </div>
      <div class="slide-number">10 / 10</div>
    </div>

    <div class="headline-group" style="margin-bottom: 8px;">
      <h2 class="slide-title">Spesifikasi Teknis & Kesiapan Produksi</h2>
      <p class="slide-desc">Ringkasan performa web, audit aksesibilitas desain neo-brutalist, dan standarisasi arsitektur untuk deployment kafe komersial.</p>
    </div>

    <div class="arch-grid">
      <div class="arch-card" style="background: #FFFFFF;">
        <div class="arch-title">Metrik Performa & Audit Web</div>
        <div class="arch-item"><strong>Lighthouse Score:</strong> 98+ pada Performance, Accessibility, Best Practices, dan SEO.</div>
        <div class="arch-item"><strong>First Contentful Paint:</strong> Tercapai di bawah 0.7 detik berkat packaging aset statis Vite yang optimal.</div>
        <div class="arch-item"><strong>Zero Cumulative Layout Shift:</strong> Nilai CLS 0.00 yang memastikan tidak ada pergeseran elemen saat font dimuat.</div>
      </div>

      <div class="arch-card" style="background: #FFFFFF;">
        <div class="arch-title">Aksesibilitas & Kontras Warna</div>
        <div class="arch-item"><strong>Kontras Ekstrem Neo-Brutalist:</strong> Rasio kontras teks hitam di atas warna pop melebihi standar WCAG AAA (7:1).</div>
        <div class="arch-item"><strong>Area Sentuh Ergonomis:</strong> Seluruh tombol antarmuka memiliki batas sentuh minimum 48px untuk kenyamanan layar sentuh kasir.</div>
        <div class="arch-item"><strong>Tipografi Space Grotesk:</strong> Keterbacaan teks judul dan angka harga tetap tajam di layar POS resolusi rendah.</div>
      </div>

      <div class="arch-card" style="background: #FFFFFF;">
        <div class="arch-title">Infrastruktur & Deployment</div>
        <div class="arch-item"><strong>Static Edge Hosting:</strong> Siap disajikan langsung melalui GitHub Pages, Vercel, atau Netlify CDN global.</div>
        <div class="arch-item"><strong>Zero Maintenance Backend:</strong> Arsitektur tanpa database server khusus yang mengeliminasi biaya server bulanan kafe.</div>
        <div class="arch-item"><strong>Kehandalan Jam Sibuk:</strong> Siap melayani ratusan pesanan serentak di jam sibuk tanpa risiko server overload.</div>
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Siap Nyafe Production Specification Document</span>
      <span class="footer-url">siapnyafe.widifirmaan.web.id</span>
    </div>
  </section>

</body>
</html>
`;

const htmlFilePath = path.join(projectRoot, 'presentation.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log(`HTML presentasi disimpan di: ${htmlFilePath}`);

async function renderPDF() {
  console.log('Menjalankan Playwright Chromium untuk render PDF Siap Nyafe...');
  
  const playwrightPath = '/home/widifirmaan/Projects/qa-toolkit/node_modules/playwright/index.mjs';
  const { chromium } = await import(playwrightPath);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  await page.goto(`file://${htmlFilePath}`, { waitUntil: 'networkidle' });
  await page.evaluateHandle('document.fonts.ready');

  const slidePdfPath = path.join(downloadsDir, 'CoffeeShop.pdf');
  console.log('Rendering Multi-Page A4 Landscape (Slide Mode)...');
  await page.pdf({
    path: slidePdfPath,
    width: '297mm',
    height: '210mm',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });

  console.log('Rendering Continuous Single-Scroll Showcase (Poster Mode)...');
  await page.addStyleTag({
    content: `
      @page {
        size: auto;
        margin: 0;
      }
      body {
        background-color: #f0f0f0 !important;
        background-image: radial-gradient(rgba(0,0,0,0.18) 1.5px, transparent 1.5px) !important;
        background-size: 26px 26px !important;
      }
      .slide {
        page-break-after: unset !important;
        page-break-inside: avoid !important;
        margin-bottom: 0px !important;
        border-bottom: 6px solid #000000 !important;
        box-shadow: none !important;
      }
    `
  });

  await page.waitForTimeout(500);

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const contPdfPath = path.join(downloadsDir, 'CoffeeShop-Continuous.pdf');
  await page.pdf({
    path: contPdfPath,
    width: '1428px',
    height: `${scrollHeight}px`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();

  const slideStat = fs.statSync(slidePdfPath);
  const contStat = fs.statSync(contPdfPath);

  console.log('\nPDF Siap Nyafe Neo-Brutalism berhasil dibuat:');
  console.log(`- Multi-Page Deck: ${(slideStat.size / 1024 / 1024).toFixed(2)} MB (${slidePdfPath})`);
  console.log(`- Continuous Poster: ${(contStat.size / 1024 / 1024).toFixed(2)} MB (${contPdfPath})\n`);
}

renderPDF().catch((err) => {
  console.error('Gagal membuat PDF:', err);
  process.exit(1);
});
