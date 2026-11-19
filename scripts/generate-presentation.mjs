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
    console.warn(`Warning: Screenshot not found: ${filePath}`);
    return '';
  }
  const fileBuffer = fs.readFileSync(filePath);
  return `data:image/png;base64,${fileBuffer.toString('base64')}`;
}

console.log('Encoding Siap Nyafe screenshots...');

const images = {
  coverDesktop: encodeImage('Coffee Landing CMS Hero Desktop.png'),
  coverMobile: encodeImage('Coffee Landing CMS Hero Mobile.png'),
  customerOrderDesktop: encodeImage('Coffee Customer Order Page Desktop.png'),
  customerOrderMobile: encodeImage('Coffee Customer Order Page Mobile.png'),
  cashierPOSDesktop: encodeImage('Coffee Cashier POS Register Desktop.png'),
  cashierPOSMobile: encodeImage('Coffee Cashier POS Register Mobile.png'),
  kitchenKDSDesktop: encodeImage('Coffee Kitchen Display System Desktop.png'),
  kitchenKDSMobile: encodeImage('Coffee Kitchen Display System Mobile.png'),
  waiterQueueDesktop: encodeImage('Coffee Waiter Service Queue Desktop.png'),
  waiterQueueMobile: encodeImage('Coffee Waiter Service Queue Mobile.png'),
  inventoryDesktop: encodeImage('Coffee Inventory Stock Control Desktop.png'),
  inventoryMobile: encodeImage('Coffee Inventory Stock Control Mobile.png'),
  staffDesktop: encodeImage('Coffee Staff Roster Management Desktop.png'),
  staffMobile: encodeImage('Coffee Staff Roster Management Mobile.png'),
  assetDesktop: encodeImage('Coffee Asset & Equipment Desktop.png'),
  assetMobile: encodeImage('Coffee Asset & Equipment Mobile.png'),
};

console.log('Constructing clean Siap Nyafe Presentation Deck HTML...');

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Siap Nyafe POS - Web Architecture Showcase</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-cream: #FFFDF8;
      --bg-card: #FFFFFF;
      --border-dark: #121212;
      --accent-amber: #D97706;
      --accent-yellow: #FCD34D;
      --accent-emerald: #059669;
      --text-main: #121212;
      --text-muted: #4B5563;
      --shadow-brutal: 4px 4px 0px #121212;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      background-color: var(--bg-cream);
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: var(--text-main);
      line-height: 1.45;
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
      background: var(--bg-cream);
      display: flex;
      flex-direction: column;
      padding: 16mm 18mm;
      overflow: hidden;
      background-image: 
        radial-gradient(circle at 1px 1px, rgba(18, 18, 18, 0.06) 1px, transparent 0);
      background-size: 24px 24px;
    }

    .slide::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: repeating-linear-gradient(45deg, #F59E0B, #F59E0B 12px, #121212 12px, #121212 24px);
      z-index: 50;
    }

    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5mm;
      border-bottom: 2.5px solid var(--border-dark);
      padding-bottom: 3.5mm;
    }

    .header-tag {
      background: var(--accent-yellow);
      border: 2px solid var(--border-dark);
      box-shadow: 2px 2px 0px var(--border-dark);
      padding: 3px 10px;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 800;
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .slide-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      background: #FFFFFF;
      border: 2px solid var(--border-dark);
      box-shadow: 2px 2px 0px var(--border-dark);
      padding: 3px 10px;
    }

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
      gap: 8px;
    }

    .slide-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      font-weight: 900;
      line-height: 1.2;
      color: var(--border-dark);
      letter-spacing: -0.02em;
    }

    .slide-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 10px 0;
    }

    .brutal-card {
      background: #FFFFFF;
      border: 2px solid var(--border-dark);
      box-shadow: var(--shadow-brutal);
      padding: 12px 14px;
    }

    .brutal-card.amber {
      background: #FEF3C7;
    }

    .feature-card-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 12px;
      font-weight: 800;
      color: var(--border-dark);
      margin-bottom: 4px;
    }

    .feature-card-text {
      font-size: 11px;
      color: #374151;
      line-height: 1.45;
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .metric-box {
      background: #FFFFFF;
      border: 2px solid var(--border-dark);
      box-shadow: 2px 2px 0px var(--border-dark);
      padding: 8px 10px;
      text-align: center;
    }

    .metric-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 15px;
      font-weight: 900;
      color: var(--border-dark);
    }

    .metric-lbl {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Clean Direct Screenshot Display without nested mockup frames */
    .visual-stage {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      min-height: 0;
    }

    .screenshot-desktop {
      max-width: 95%;
      max-height: 380px;
      object-fit: contain;
      display: block;
      filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.15));
    }

    .screenshot-mobile {
      position: absolute;
      right: 0px;
      bottom: -8px;
      max-height: 280px;
      max-width: 28%;
      object-fit: contain;
      display: block;
      filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.2));
    }

    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 2px solid var(--border-dark);
      padding-top: 3.5mm;
      margin-top: 4mm;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: var(--text-muted);
      font-weight: 700;
    }

    /* Cover Slide */
    .cover-slide {
      background: #FEF3C7;
      justify-content: space-between;
      padding: 18mm 20mm;
    }

    .cover-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 46px;
      font-weight: 900;
      line-height: 1.05;
      color: var(--border-dark);
      margin-bottom: 12px;
    }

    .cover-title span {
      background: #F59E0B;
      border: 2px solid var(--border-dark);
      box-shadow: 3px 3px 0px var(--border-dark);
      padding: 2px 10px;
      display: inline-block;
      margin-bottom: 4px;
    }

    .cover-desc {
      font-size: 15px;
      line-height: 1.5;
      color: #374151;
      max-width: 680px;
    }

    .cover-split {
      display: grid;
      grid-template-columns: 1fr 1.1fr;
      gap: 28px;
      align-items: center;
      margin: 10px 0;
    }

    .cover-specs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .spec-card {
      background: #FFFFFF;
      border: 2px solid var(--border-dark);
      box-shadow: var(--shadow-brutal);
      padding: 12px 14px;
    }

    .spec-k {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      font-weight: 800;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 3px;
    }

    .spec-v {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 13.5px;
      font-weight: 800;
      color: var(--border-dark);
    }

    /* Tech Stack Grid */
    .tech-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 10px;
      flex: 1;
    }

    .tech-col {
      background: #FFFFFF;
      border: 2px solid var(--border-dark);
      box-shadow: var(--shadow-brutal);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .tech-col-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding-bottom: 6px;
      border-bottom: 2px solid var(--border-dark);
      color: var(--border-dark);
    }

    .tech-item {
      background: #F9FAFB;
      border: 1.5px solid var(--border-dark);
      padding: 8px 10px;
      font-size: 11px;
    }

    .tech-item-name {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      color: var(--border-dark);
      margin-bottom: 2px;
    }

    .tech-item-desc {
      font-size: 10px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* Closing Slide */
    .closing-slide {
      background: #FFFBEB;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20mm;
      gap: 18px;
    }

    .closing-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 36px;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: var(--border-dark);
    }

    .closing-card {
      background: #FFFFFF;
      border: 2.5px solid var(--border-dark);
      box-shadow: 5px 5px 0px var(--border-dark);
      padding: 16px 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
    }

    .closing-url {
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px;
      font-weight: 800;
      color: var(--accent-amber);
    }
  </style>
</head>
<body>

  <!-- SLIDE 01: COVER -->
  <div class="slide cover-slide">
    <div>
      <div style="display:flex; gap:12px; align-items:center;">
        <div class="header-tag">POINT-OF-SALE SISTEM</div>
        <div class="header-tag" style="background:#10B981; color:#fff;">PRODUCTION READY</div>
      </div>
      <div style="margin-top: 20px; max-width: 80%;">
        <div class="cover-title">
          <span>SIAP NYAFE</span> POS & KITCHEN SYSTEM
        </div>
        <p class="cover-desc">
          Aplikasi web point-of-sale kedai kopi, pemesanan mandiri pelanggan, kitchen display system (KDS), dan manajemen inventaris bahan baku berbasis React 18 dan Cloudflare Workers.
        </p>
      </div>
    </div>

    <div class="cover-split">
      <div class="cover-specs">
        <div class="spec-card">
          <div class="spec-k">FRAMEWORK</div>
          <div class="spec-v">React 18 + Vite 5 SPA</div>
        </div>
        <div class="spec-card">
          <div class="spec-k">BACKEND EDGE</div>
          <div class="spec-v">Cloudflare Workers</div>
        </div>
        <div class="spec-card">
          <div class="spec-k">DATABASE</div>
          <div class="spec-v">Cloudflare D1 SQLite</div>
        </div>
        <div class="spec-card">
          <div class="spec-k">DESIGN SYSTEM</div>
          <div class="spec-v">Neo-Brutalism Tokens</div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.coverDesktop}" class="screenshot-desktop" alt="Siap Nyafe Cover">
      </div>
    </div>

    <div class="slide-footer">
      <div>WIDI FIRMANSYAH</div>
      <div>REACTJS COFFEE SHOP MANAGEMENT</div>
      <div>01 / 10</div>
    </div>
  </div>

  <!-- SLIDE 02: CUSTOMER ORDER -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">MENU PELANGGAN</div>
      <div class="slide-num">02 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Pemesanan Mandiri & Kustomisasi Menu</h2>
          <p class="slide-desc">
            Katalog pemesanan bagi pelanggan dengan filter tab kategori, pemilihan varian minuman (kadar gula, es, dan jenis susu), serta keranjang belanja reaktif.
          </p>
        </div>

        <div class="feature-list">
          <div class="brutal-card amber">
            <div class="feature-card-title">Kustomisasi Minuman</div>
            <div class="feature-card-text">
              Modal pilihan parameter minuman yang langsung menyesuaikan penambahan harga satuan ke dalam keranjang.
            </div>
          </div>
          <div class="brutal-card">
            <div class="feature-card-title">Keranjang Belanja Reaktif</div>
            <div class="feature-card-text">
              Manajemen state keranjang lokal dengan validasi kuantitas item dan kalkulasi total biaya pesanan.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">React 18</div>
            <div class="metric-lbl">State</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">16+</div>
            <div class="metric-lbl">Menu Varian</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">0 ms</div>
            <div class="metric-lbl">Cart Delay</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.customerOrderDesktop}" class="screenshot-desktop" alt="Customer Order Desktop">
        <img src="${images.customerOrderMobile}" class="screenshot-mobile" alt="Customer Order Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <div>MENU PEMESANAN MANDIRI</div>
      <div>KATALOG & KERANJANG KASIR</div>
      <div>02 / 10</div>
    </div>
  </div>

  <!-- SLIDE 03: CASHIER POS -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">TERMINAL KASIR</div>
      <div class="slide-num">03 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Terminal Kasir POS & Hitung Kembalian</h2>
          <p class="slide-desc">
            Terminal kasir transaksi cepat dengan pemilihan produk langsung, kalkulasi nominal uang kembalian otomatis, dan cetak struk belanja modal.
          </p>
        </div>

        <div class="feature-list">
          <div class="brutal-card">
            <div class="feature-card-title">Kalkulasi Kembalian Tunai</div>
            <div class="feature-card-text">
              Memvalidasi uang tunai yang dibayarkan dan menghitung kembalian otomatis dengan penanda warna jika uang kurang.
            </div>
          </div>
          <div class="brutal-card amber">
            <div class="feature-card-title">Modal Cetak Struk Termal</div>
            <div class="feature-card-text">
              Tampilan struk belanja terformat yang siap dicetak ke printer kasir melalui fungsi window.print() peramban.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">&lt; 3 Detik</div>
            <div class="metric-lbl">Waktu Checkout</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">100%</div>
            <div class="metric-lbl">Akurasi Nilai</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">58/80mm</div>
            <div class="metric-lbl">Layout Struk</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.cashierPOSDesktop}" class="screenshot-desktop" alt="Cashier POS Desktop">
        <img src="${images.cashierPOSMobile}" class="screenshot-mobile" alt="Cashier POS Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <div>TERMINAL KASIR POS</div>
      <div>TRANSAKSI & HITUNG KEMBALIAN</div>
      <div>03 / 10</div>
    </div>
  </div>

  <!-- SLIDE 04: KITCHEN KDS -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">KITCHEN KDS</div>
      <div class="slide-num">04 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Kitchen Display System (KDS) & Antrian</h2>
          <p class="slide-desc">
            Antarmuka operasional dapur dan stasiun barista untuk memantau tiket pesanan masuk secara berurutan dengan penghitung waktu tunggu otomatis.
          </p>
        </div>

        <div class="feature-list">
          <div class="brutal-card">
            <div class="feature-card-title">Penghitung Durasi Tiket</div>
            <div class="feature-card-text">
              Setiap tiket order menampilkan lama waktu tunggu sejak order dibuat untuk menjaga standar waktu penyajian.
            </div>
          </div>
          <div class="brutal-card amber">
            <div class="feature-card-title">Perubahan Status Satu Klik</div>
            <div class="feature-card-text">
              Tombol cepat bagi barista untuk memperbarui status pesanan dari Sedang Diracik menjadi Siap Disajikan.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">3 Tahap</div>
            <div class="metric-lbl">Alur Tiket</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Timer</div>
            <div class="metric-lbl">Lama Racik</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">0</div>
            <div class="metric-lbl">Order Terlewat</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.kitchenKDSDesktop}" class="screenshot-desktop" alt="Kitchen KDS Desktop">
        <img src="${images.kitchenKDSMobile}" class="screenshot-mobile" alt="Kitchen KDS Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <div>KITCHEN DISPLAY SYSTEM</div>
      <div>ALUR PREPARASI MINUMAN</div>
      <div>04 / 10</div>
    </div>
  </div>

  <!-- SLIDE 05: WAITER QUEUE -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">PELAYANAN MEJA</div>
      <div class="slide-num">05 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Antrian Pramusaji & Bantuan Meja</h2>
          <p class="slide-desc">
            Pusat koordinasi pramusaji untuk menyajikan pesanan yang telah selesai diracik serta merespons panggilan bantuan meja tamu secara real-time.
          </p>
        </div>

        <div class="feature-list">
          <div class="brutal-card">
            <div class="feature-card-title">Notifikasi Panggilan Tamu</div>
            <div class="feature-card-text">
              Menerima sinyal panggilan meja tamu dari portal self-order lengkap dengan tombol konfirmasi penyelesaian bantuan.
            </div>
          </div>
          <div class="brutal-card amber">
            <div class="feature-card-title">Daftar Antar Pesanan</div>
            <div class="feature-card-text">
              Daftar tiket minuman siap antar ke nomor meja bersangkutan dengan validasi status terkirim.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Realtime</div>
            <div class="metric-lbl">Panggilan</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">100%</div>
            <div class="metric-lbl">Area Meja</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">1-Tap</div>
            <div class="metric-lbl">Selesai</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.waiterQueueDesktop}" class="screenshot-desktop" alt="Waiter Queue Desktop">
        <img src="${images.waiterQueueMobile}" class="screenshot-mobile" alt="Waiter Queue Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <div>PELAYANAN PRAMUSAJI</div>
      <div>DISPATCH & PANGGILAN MEJA</div>
      <div>05 / 10</div>
    </div>
  </div>

  <!-- SLIDE 06: INVENTORY -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">STOK BAHAN BAKU</div>
      <div class="slide-num">06 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Inventaris Bahan Baku & Pemotongan Resep</h2>
          <p class="slide-desc">
            Pencatatan persediaan bahan baku (biji kopi, susu, sirup) yang terhubung langsung dengan resep menu untuk pemotongan stok otomatis per transaksi.
          </p>
        </div>

        <div class="feature-list">
          <div class="brutal-card amber">
            <div class="feature-card-title">Pemotongan Stok Berbasis Resep</div>
            <div class="feature-card-text">
              Setiap cangkir kopi yang terjual otomatis memotong kuantitas gram biji kopi dan mililiter susu di database D1 SQLite.
            </div>
          </div>
          <div class="brutal-card">
            <div class="feature-card-title">Peringatan Stok Minimum</div>
            <div class="feature-card-text">
              Highlight otomatis saat stok bahan berada di bawah batas minimum agar pengelola dapat segera melakukan restock.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Otomatis</div>
            <div class="metric-lbl">Potong Stok</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">D1 SQLite</div>
            <div class="metric-lbl">Database</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">100%</div>
            <div class="metric-lbl">Lacak Resep</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.inventoryDesktop}" class="screenshot-desktop" alt="Inventory Stock Desktop">
        <img src="${images.inventoryMobile}" class="screenshot-mobile" alt="Inventory Stock Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <div>INVENTARIS BAHAN BAKU</div>
      <div>PEMOTONGAN OTOMATIS PER RESEP</div>
      <div>06 / 10</div>
    </div>
  </div>

  <!-- SLIDE 07: STAFF ROSTER -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">MANAJEMEN STAF</div>
      <div class="slide-num">07 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Jadwal Shift & Hak Akses Berbasis Peran</h2>
          <p class="slide-desc">
            Pengaturan jadwal shift kerja karyawan kedai kopi dan pembagian izin akses (Role-Based Access Control) untuk menjaga keamanan sistem.
          </p>
        </div>

        <div class="feature-list">
          <div class="brutal-card">
            <div class="feature-card-title">Pembagian Peran (RBAC)</div>
            <div class="feature-card-text">
              Pemisahan rute aplikasi untuk Admin (semua akses), Kasir (terminal POS), Barista (KDS), dan Waiter (pelayanan meja).
            </div>
          </div>
          <div class="brutal-card amber">
            <div class="feature-card-title">Riwayat Kehadiran Staf</div>
            <div class="feature-card-text">
              Pencatatan waktu presensi kerja karyawan untuk memudahkan audit absensi dan evaluasi jadwal operasional outlet.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">4 Peran</div>
            <div class="metric-lbl">Hak Akses</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">JWT</div>
            <div class="metric-lbl">Token Auth</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Aman</div>
            <div class="metric-lbl">Proteksi Rute</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.staffDesktop}" class="screenshot-desktop" alt="Staff Roster Desktop">
        <img src="${images.staffMobile}" class="screenshot-mobile" alt="Staff Roster Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <div>MANAJEMEN STAF & AKSES</div>
      <div>HAK AKSES BERBASIS PERAN</div>
      <div>07 / 10</div>
    </div>
  </div>

  <!-- SLIDE 08: ASSET MAINTENANCE -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">ASET PERALATAN</div>
      <div class="slide-num">08 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Pencatatan Aset & Jadwal Perawatan</h2>
          <p class="slide-desc">
            Registrasi mesin komersial (mesin espresso, coffee grinder, penyaring air) beserta jadwal servis berkala untuk mencegah kerusakan operasional.
          </p>
        </div>

        <div class="feature-list">
          <div class="brutal-card amber">
            <div class="feature-card-title">Jadwal Perawatan Berkala</div>
            <div class="feature-card-text">
              Pengingat servis rutin descaling boiler mesin espresso dan penggantian mata pisau grinder tepat waktu.
            </div>
          </div>
          <div class="brutal-card">
            <div class="feature-card-title">Status Kondisi Operasional</div>
            <div class="feature-card-text">
              Penanda kondisi fisik peralatan (Optimal, Perlu Servis, Dalam Perbaikan) untuk menjaga mutu seduhan kopi.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">100%</div>
            <div class="metric-lbl">Aset Tercatat</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Rutin</div>
            <div class="metric-lbl">Servis Mesin</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Minimal</div>
            <div class="metric-lbl">Downtime</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.assetDesktop}" class="screenshot-desktop" alt="Asset Maintenance Desktop">
        <img src="${images.assetMobile}" class="screenshot-mobile" alt="Asset Maintenance Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <div>ASET MESIN & PERALATAN</div>
      <div>JADWAL PERAWATAN BERKALA</div>
      <div>08 / 10</div>
    </div>
  </div>

  <!-- SLIDE 09: TECH STACK -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">TEKNOLOGI</div>
      <div class="slide-num">09 / 10</div>
    </div>

    <div style="margin-bottom: 8px;">
      <h2 class="slide-title">Susunan Teknologi & Dependensi</h2>
      <p class="slide-desc">
        Aplikasi web dibangun menggunakan React 18 SPA dengan backend serverless Cloudflare Workers dan database SQL terdistribusi Cloudflare D1.
      </p>
    </div>

    <div class="tech-grid">
      <div class="tech-col">
        <div class="tech-col-title">01. FRONTEND CORE</div>
        <div class="tech-item">
          <div class="tech-item-name">React 18.2</div>
          <div class="tech-item-desc">Framework antarmuka dengan manajemen state terisolasi per modul.</div>
        </div>
        <div class="tech-item">
          <div class="tech-item-name">Vite 5</div>
          <div class="tech-item-desc">Build tool modern untuk kompilasi cepat dan output bundel teroptimasi.</div>
        </div>
        <div class="tech-item">
          <div class="tech-item-name">React Router v6</div>
          <div class="tech-item-desc">Navigasi rute client-side dengan pelindung akses berbasis peran.</div>
        </div>
      </div>

      <div class="tech-col">
        <div class="tech-col-title">02. BACKEND SERVERLESS</div>
        <div class="tech-item">
          <div class="tech-item-name">Cloudflare Workers</div>
          <div class="tech-item-desc">Runtime edge serverless V8 untuk endpoint API kasir dan dapur.</div>
        </div>
        <div class="tech-item">
          <div class="tech-item-name">Cloudflare D1 SQLite</div>
          <div class="tech-item-desc">Basis data relasional SQL terdistribusi dengan transaksi atomik.</div>
        </div>
        <div class="tech-item">
          <div class="tech-item-name">Bcrypt & JWT</div>
          <div class="tech-item-desc">Autentikasi kredensial staf dan pengelolaan sesi pengguna.</div>
        </div>
      </div>

      <div class="tech-col">
        <div class="tech-col-title">03. DESAIN & PENGUJIAN</div>
        <div class="tech-item">
          <div class="tech-item-name">Neo-Brutalism CSS</div>
          <div class="tech-item-desc">Gaya visual tegas dengan border tebal dan drop shadow solid.</div>
        </div>
        <div class="tech-item">
          <div class="tech-item-name">Lucide Icons</div>
          <div class="tech-item-desc">Ikon SVG monokromatis ringan untuk tombol kasir dan navigasi.</div>
        </div>
        <div class="tech-item">
          <div class="tech-item-name">Playwright E2E</div>
          <div class="tech-item-desc">Pengujian otomatis alur kasir, pesanan, dan dapur.</div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SUSUNAN TEKNOLOGI</div>
      <div>ARSITEKTUR & DEPENDENSI</div>
      <div>09 / 10</div>
    </div>
  </div>

  <!-- SLIDE 10: CLOSING -->
  <div class="slide closing-slide">
    <div class="header-tag" style="padding: 5px 16px; font-size: 11px;">SIAP NYAFE COFFEE POS PLATFORM</div>
    <h1 class="closing-title">COFFEE SHOP POINT-OF-SALE & KITCHEN SYSTEM</h1>
    
    <p style="font-size: 14.5px; color: var(--text-muted); max-width: 650px; line-height: 1.5;">
      Solusi sistem kasir dan operasional kedai kopi yang mengintegrasikan pesanan mandiri pelanggan, ketepatan transaksi kasir, antrean dapur barista, dan inventaris bahan baku.
    </p>

    <div class="closing-card">
      <div style="font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em;">
        DEMO PRODUKSI
      </div>
      <div class="closing-url">https://siapnyafe.widifirmaan.web.id</div>
      <div style="font-size:11px; color:var(--text-muted);">
        React 18 • Cloudflare Workers • Cloudflare D1 SQLite
      </div>
    </div>

    <div class="slide-footer" style="width: 100%; margin-top: 15px;">
      <div>WIDI FIRMANSYAH</div>
      <div>PENGEMBANG UTAMA</div>
      <div>10 / 10</div>
    </div>
  </div>

</body>
</html>
`;

const htmlFilePath = path.join(projectRoot, 'presentation.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log(`Presentation HTML written to: ${htmlFilePath}`);

console.log('Launching Chromium with Playwright to render Siap Nyafe PDF...');

async function renderPDF() {
  const playwrightPath = '/home/widifirmaan/Projects/qa-toolkit/node_modules/playwright/index.mjs';
  const { chromium } = await import(playwrightPath);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  await page.goto(`file://${htmlFilePath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const slidePdfPath = path.join(downloadsDir, 'CoffeeShop.pdf');
  const continuousPdfPath = path.join(downloadsDir, 'CoffeeShop-Continuous.pdf');

  // 1. Multi-Page Deck Mode (10 Slides A4 Landscape)
  console.log('Rendering Multi-Page A4 Landscape Presentation PDF (Slide Mode)...');
  await page.pdf({
    path: slidePdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
  });

  // 2. Continuous Poster Mode (Single tall scroll)
  console.log('Rendering Continuous Single-Scroll Showcase PDF (Poster Mode)...');
  await page.addStyleTag({
    content: `
      @page {
        size: auto;
        margin: 0;
      }
      body {
        background: #FFFDF8 !important;
      }
      .slide {
        page-break-after: unset !important;
        page-break-inside: avoid !important;
        margin-bottom: 0px !important;
        box-shadow: none !important;
      }
    `
  });

  await page.waitForTimeout(500);

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.pdf({
    path: continuousPdfPath,
    width: '1428px',
    height: `${scrollHeight}px`,
    printBackground: true,
    pageRanges: '1',
  });

  await browser.close();

  const slideStat = fs.statSync(slidePdfPath);
  const contStat = fs.statSync(continuousPdfPath);

  console.log('\nSiap Nyafe PDFs successfully generated:');
  console.log(`- Multi-Page Deck: ${(slideStat.size / 1024 / 1024).toFixed(2)} MB (${slidePdfPath})`);
  console.log(`- Continuous Poster: ${(contStat.size / 1024 / 1024).toFixed(2)} MB (${continuousPdfPath})\n`);
}

renderPDF().catch((err) => {
  console.error('Error during PDF generation:', err);
  process.exit(1);
});
