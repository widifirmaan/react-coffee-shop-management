import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const screenshotsDir = path.join(projectRoot, 'screenshots');
const downloadsDir = '/home/widifirmaan/Downloads';

// Helper to base64 encode screenshot images
function encodeImage(filename) {
  const filePath = path.join(screenshotsDir, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Warning: Screenshot not found: ${filePath}`);
    return '';
  }
  const fileBuffer = fs.readFileSync(filePath);
  return `data:image/png;base64,${fileBuffer.toString('base64')}`;
}

console.log('☕ Encoding Siap Nyafe POS screenshots into high-resolution base64 data URIs...');

const images = {
  coverDesktop: encodeImage('Coffee Landing CMS Hero Desktop.png'),
  coverMobile: encodeImage('Coffee Landing CMS Hero Mobile.png'),
  customerOrderDesktop: encodeImage('Coffee Customer Order Page Desktop.png'),
  customerOrderMobile: encodeImage('Coffee Customer Order Page Mobile.png'),
  cashierPOSDesktop: encodeImage('Coffee Cashier POS Register Desktop.png'),
  cashierPOSMobile: encodeImage('Coffee Cashier POS Register Mobile.png'),
  cashierReceiptDesktop: encodeImage('Coffee Cashier Modal Thermal Receipt Desktop.png'),
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

console.log('🎨 Constructing Siap Nyafe Neo-Brutalist Presentation Deck HTML...');

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Siap Nyafe POS - Web Architecture & Technical Showcase</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-cream: #FFFDF8;
      --bg-surface: #FFFFFF;
      --border-dark: #121212;
      --accent-amber: #F59E0B;
      --accent-yellow: #FCD34D;
      --accent-orange: #EA580C;
      --accent-emerald: #10B981;
      --accent-rose: #F43F5E;
      --accent-blue: #2563EB;
      --accent-purple: #8B5CF6;
      --shadow-brutal: 4px 4px 0px #121212;
      --shadow-brutal-lg: 6px 6px 0px #121212;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      background-color: #E2E8F0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #121212;
      line-height: 1.4;
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
        radial-gradient(circle at 1px 1px, rgba(18, 18, 18, 0.08) 1px, transparent 0);
      background-size: 24px 24px;
    }

    /* Neo-Brutalist Frame Decor */
    .slide::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: repeating-linear-gradient(
        45deg,
        var(--accent-amber),
        var(--accent-amber) 14px,
        var(--border-dark) 14px,
        var(--border-dark) 28px
      );
      z-index: 50;
    }

    /* Slide Header */
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5mm;
      border-bottom: 3px solid var(--border-dark);
      padding-bottom: 3mm;
    }

    .brand-cluster {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-badge {
      background: var(--accent-yellow);
      border: 2px solid var(--border-dark);
      box-shadow: 2px 2px 0px var(--border-dark);
      padding: 4px 10px;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .slide-section-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 14px;
      font-weight: 800;
      color: var(--border-dark);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .slide-page-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 800;
      background: #FFFFFF;
      border: 2px solid var(--border-dark);
      box-shadow: 2px 2px 0px var(--border-dark);
      padding: 3px 10px;
    }

    /* Slide Main Content Layout */
    .slide-body {
      display: grid;
      grid-template-columns: 1fr 1.35fr;
      gap: 20px;
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

    .route-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FFFFFF;
      border: 2px solid var(--border-dark);
      box-shadow: 2px 2px 0px var(--border-dark);
      padding: 3px 8px;
      width: fit-content;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      color: var(--accent-orange);
    }

    .slide-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      font-weight: 900;
      line-height: 1.15;
      color: var(--border-dark);
      letter-spacing: -0.02em;
    }

    .slide-subtitle {
      font-size: 13px;
      color: #374151;
      font-weight: 500;
      line-height: 1.45;
    }

    /* Spec & Feature Cards */
    .feature-blocks {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 10px 0;
    }

    .brutal-card {
      background: #FFFFFF;
      border: 2.5px solid var(--border-dark);
      box-shadow: var(--shadow-brutal);
      padding: 10px 14px;
    }

    .brutal-card.amber-tint {
      background: #FEF3C7;
    }

    .brutal-card.emerald-tint {
      background: #D1FAE5;
    }

    .brutal-card.blue-tint {
      background: #DBEAFE;
    }

    .brutal-card.purple-tint {
      background: #EDE9FE;
    }

    .card-label {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-text {
      font-size: 11px;
      line-height: 1.4;
      color: #1F2937;
      font-weight: 500;
    }

    /* Key Metrics Grid */
    .metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .metric-box {
      background: #FFFFFF;
      border: 2px solid var(--border-dark);
      box-shadow: 2px 2px 0px var(--border-dark);
      padding: 6px 10px;
      text-align: center;
    }

    .metric-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 16px;
      font-weight: 900;
      color: var(--border-dark);
    }

    .metric-desc {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #4B5563;
    }

    /* Media Mockup Frame */
    .slide-visual {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 0;
    }

    .device-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .desktop-frame {
      width: 88%;
      background: #FFFFFF;
      border: 3px solid var(--border-dark);
      box-shadow: var(--shadow-brutal-lg);
      border-radius: 6px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .frame-bar {
      height: 22px;
      background: #F3F4F6;
      border-bottom: 2.5px solid var(--border-dark);
      display: flex;
      align-items: center;
      padding: 0 10px;
      gap: 6px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 1.5px solid var(--border-dark);
    }
    .dot.red { background: #EF4444; }
    .dot.yellow { background: #F59E0B; }
    .dot.green { background: #10B981; }

    .url-chip {
      margin-left: 12px;
      background: #FFFFFF;
      border: 1.5px solid var(--border-dark);
      padding: 1px 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      font-weight: 700;
      color: #4B5563;
      border-radius: 3px;
    }

    .desktop-img {
      width: 100%;
      height: auto;
      max-height: 380px;
      object-fit: contain;
      background: #FAFAFA;
      display: block;
    }

    .mobile-frame {
      position: absolute;
      right: -10px;
      bottom: -15px;
      width: 28%;
      background: #FFFFFF;
      border: 3px solid var(--border-dark);
      box-shadow: 5px 5px 0px var(--border-dark);
      border-radius: 12px;
      overflow: hidden;
      z-index: 10;
    }

    .mobile-notch {
      height: 14px;
      background: #121212;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .notch-speaker {
      width: 32px;
      height: 3px;
      background: #4B5563;
      border-radius: 2px;
    }

    .mobile-img {
      width: 100%;
      height: auto;
      display: block;
    }

    /* Footer Meta */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 2px solid var(--border-dark);
      padding-top: 3mm;
      margin-top: 4mm;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: #6B7280;
      font-weight: 700;
    }

    /* Cover Slide Specifics */
    .cover-slide {
      background: #FEF3C7;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 18mm 20mm;
    }

    .cover-badge-row {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .cover-title-group {
      margin-top: 20px;
      max-width: 85%;
    }

    .cover-giant-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 52px;
      font-weight: 900;
      line-height: 1.0;
      letter-spacing: -0.04em;
      color: var(--border-dark);
      text-transform: uppercase;
      margin-bottom: 14px;
    }

    .cover-giant-title span {
      background: var(--accent-amber);
      border: 3px solid var(--border-dark);
      box-shadow: 4px 4px 0px var(--border-dark);
      padding: 2px 12px;
      display: inline-block;
      margin-bottom: 6px;
    }

    .cover-desc {
      font-size: 16px;
      line-height: 1.45;
      color: #374151;
      font-weight: 600;
      max-width: 720px;
    }

    .cover-split {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 30px;
      align-items: center;
      margin: 10px 0;
    }

    .cover-specs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .cover-spec-card {
      background: #FFFFFF;
      border: 2.5px solid var(--border-dark);
      box-shadow: 3px 3px 0px var(--border-dark);
      padding: 10px 14px;
    }

    .cover-spec-k {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: #6B7280;
      margin-bottom: 2px;
    }

    .cover-spec-v {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 13px;
      font-weight: 800;
      color: var(--border-dark);
    }

    /* Tech Stack Architecture Matrix */
    .arch-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 10px;
      flex: 1;
    }

    .arch-col {
      background: #FFFFFF;
      border: 3px solid var(--border-dark);
      box-shadow: var(--shadow-brutal);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .arch-col-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      padding-bottom: 6px;
      border-bottom: 2px solid var(--border-dark);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .arch-item {
      background: #F9FAFB;
      border: 1.5px solid var(--border-dark);
      padding: 8px 10px;
      font-size: 11px;
    }

    .arch-item-name {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      color: #111827;
      margin-bottom: 2px;
    }

    .arch-item-detail {
      font-size: 10px;
      color: #4B5563;
      line-height: 1.35;
    }

    /* Final Slide */
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
      font-size: 38px;
      font-weight: 900;
      letter-spacing: -0.03em;
      text-transform: uppercase;
    }

    .closing-pills {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
      max-width: 780px;
    }

    .live-hero-card {
      background: #FFFFFF;
      border: 3px solid var(--border-dark);
      box-shadow: 6px 6px 0px var(--border-dark);
      padding: 16px 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
    }

    .live-url-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 18px;
      font-weight: 800;
      color: var(--accent-orange);
    }
  </style>
</head>
<body>

  <!-- ==================== SLIDE 01: COVER ==================== -->
  <div class="slide cover-slide">
    <div>
      <div class="cover-badge-row">
        <div class="brand-badge">SIAP NYAFE POS SYSTEM</div>
        <div class="route-pill">EDGE CLOUD RUNTIME • REACT 18 + D1</div>
        <div class="brand-badge" style="background:#10B981; color:#fff;">PRODUCTION DEPLOYED</div>
      </div>
      <div class="cover-title-group">
        <div class="cover-giant-title">
          <span>SIAP NYAFE POS</span><br>
          ENTERPRISE POINT-OF-SALE & KITCHEN SYSTEM
        </div>
        <p class="cover-desc">
          Arsitektur web point-of-sale fullstack, portal customer self-ordering, real-time Kitchen Display System (KDS), waiter floor dispatch, dan sistem inventaris terdistribusi berbasis serverless edge computing.
        </p>
      </div>
    </div>

    <div class="cover-split">
      <div class="cover-specs-grid">
        <div class="cover-spec-card">
          <div class="cover-spec-k">CORE FRAMEWORK</div>
          <div class="cover-spec-v">React 18 + Vite 5 SPA</div>
        </div>
        <div class="cover-spec-card">
          <div class="cover-spec-k">SERVERLESS BACKEND</div>
          <div class="cover-spec-v">Cloudflare Workers Edge</div>
        </div>
        <div class="cover-spec-card">
          <div class="cover-spec-k">EDGE DATABASE</div>
          <div class="cover-spec-v">Cloudflare D1 SQLite Engine</div>
        </div>
        <div class="cover-spec-card">
          <div class="cover-spec-k">DESIGN SPECIFICATION</div>
          <div class="cover-spec-v">Neo-Brutalist Hard Shadows</div>
        </div>
      </div>

      <div style="position: relative;">
        <div class="desktop-frame" style="width: 100%;">
          <div class="frame-bar">
            <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
            <div class="url-chip">https://siapnyafe.widifirmaan.web.id</div>
          </div>
          <img src="${images.coverDesktop}" class="desktop-img" alt="Siap Nyafe Cover">
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>AUTHOR: WIDI FIRMANSYAH</div>
      <div>PROJECT: SIAP NYAFE COFFEE POS PLATFORM</div>
      <div>PAGE 01 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 02: CUSTOMER SELF-ORDER ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge">CUSTOMER PORTAL</div>
        <div class="slide-section-title">SELF-ORDERING MENU & BEVERAGE CUSTOMIZATION</div>
      </div>
      <div class="slide-page-badge">SLIDE 02</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <div class="route-pill">GET /order • PUBLIC ROUTE</div>
          <h2 class="slide-title">Digital Self-Order & Dynamic Customizer</h2>
          <p class="slide-subtitle">
            Katalog pemesanan mandiri responsif dengan sticky category pill navigation, modal kustomisasi parameter minuman (sweetness, ice ratio, espresso shots), dan keranjang belanja reaktif.
          </p>
        </div>

        <div class="feature-blocks">
          <div class="brutal-card amber-tint">
            <div class="card-label">⚡ Reactive Cart Mutation State</div>
            <div class="card-text">
              Manajemen state keranjang berbasis in-memory React state dengan sanitasi otomatis, validasi kuantitas item, kalkulasi pajak PPN dinamis, dan persistensi sesi lokal.
            </div>
          </div>
          <div class="brutal-card">
            <div class="card-label">🎛️ Addon & Ingredient Matrix</div>
            <div class="card-text">
              Modal konfigurasi pilihan opsi suhu (hot/iced), ukuran cup, level gula, hingga varian susu oat/dairy dengan penyesuaian delta harga satuan secara instan.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">100%</div>
            <div class="metric-desc">Client-Side State</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">0 ms</div>
            <div class="metric-desc">Cart Latency</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">16+</div>
            <div class="metric-desc">Menu Variants</div>
          </div>
        </div>
      </div>

      <div class="slide-visual">
        <div class="device-container">
          <div class="desktop-frame">
            <div class="frame-bar">
              <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
              <div class="url-chip">siapnyafe.widifirmaan.web.id/order</div>
            </div>
            <img src="${images.customerOrderDesktop}" class="desktop-img" alt="Customer Order Desktop">
          </div>
          <div class="mobile-frame">
            <div class="mobile-notch"><div class="notch-speaker"></div></div>
            <img src="${images.customerOrderMobile}" class="mobile-img" alt="Customer Order Mobile">
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE WEB ARCHITECTURE</div>
      <div>CLIENT MENU COMPONENT LIFECYCLE</div>
      <div>PAGE 02 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 03: CASHIER POS ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge" style="background:#10B981; color:#fff;">CASHIER WORKFLOW</div>
        <div class="slide-section-title">POS REGISTER & INSTANT CHANGE MATH ENGINE</div>
      </div>
      <div class="slide-page-badge">SLIDE 03</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <div class="route-pill">POST /api/orders • ROLE: CASHIER</div>
          <h2 class="slide-title">Cashier Register & Change Math Engine</h2>
          <p class="slide-subtitle">
            Terminal kasir kas berkecepatan tinggi dengan navigasi multi-kategori, kalkulator kembalian otomatis, deteksi nominal uang tunai kurang, dan cetak struk termal modal.
          </p>
        </div>

        <div class="feature-blocks">
          <div class="brutal-card emerald-tint">
            <div class="card-label">💰 Real-Time Change Calculation</div>
            <div class="card-text">
              Algoritma kalkulasi nilai tender tunai terhadap grand total. Menampilkan peringatan warna merah saat nominal kurang, dan otomatis mengkalkulasi nominal uang kembalian.
            </div>
          </div>
          <div class="brutal-card">
            <div class="card-label">🖨️ Thermal Receipt Print Engine</div>
            <div class="card-text">
              Modal struk belanja bergaya monospace 58mm/80mm siap cetak melalui browser window.print() dengan detail nomor order, rincian item, dan stempel waktu transaksi.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">&lt; 3s</div>
            <div class="metric-desc">Checkout Speed</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">100%</div>
            <div class="metric-desc">Tender Accuracy</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">58/80mm</div>
            <div class="metric-desc">Thermal Layout</div>
          </div>
        </div>
      </div>

      <div class="slide-visual">
        <div class="device-container">
          <div class="desktop-frame">
            <div class="frame-bar">
              <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
              <div class="url-chip">siapnyafe.widifirmaan.web.id/cashier</div>
            </div>
            <img src="${images.cashierPOSDesktop}" class="desktop-img" alt="Cashier POS Desktop">
          </div>
          <div class="mobile-frame">
            <div class="mobile-notch"><div class="notch-speaker"></div></div>
            <img src="${images.cashierPOSMobile}" class="mobile-img" alt="Cashier POS Mobile">
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE WEB ARCHITECTURE</div>
      <div>TRANSACTION DISPATCH & CHANGE ALGORITHM</div>
      <div>PAGE 03 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 04: KITCHEN DISPLAY SYSTEM ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge" style="background:#F43F5E; color:#fff;">BARISTA & KITCHEN</div>
        <div class="slide-section-title">REAL-TIME KITCHEN DISPLAY SYSTEM (KDS)</div>
      </div>
      <div class="slide-page-badge">SLIDE 04</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <div class="route-pill">GET /kitchen • WEBSOCKET / POLLING</div>
          <h2 class="slide-title">Kanban Order Ticket & Preparation Queue</h2>
          <p class="slide-subtitle">
            Antarmuka operasional dapur dan stasiun barista untuk memantau tiket pesanan masuk secara berurutan dengan penghitung waktu tunggu (order age counter) otomatis.
          </p>
        </div>

        <div class="feature-blocks">
          <div class="brutal-card">
            <div class="card-label">⏱️ Dynamic Elapsed Time Counter</div>
            <div class="card-text">
              Setiap tiket order menghitung durasi tunggu sejak masuk ke sistem (menit:detik). Indikator warna kartu berubah otomatis menjadi merah jika waktu racik melampaui batas SLA.
            </div>
          </div>
          <div class="brutal-card amber-tint">
            <div class="card-label">🔄 State Pipeline: Pending ➔ Cooking ➔ Ready</div>
            <div class="card-text">
              Transisi status satu klik bagi barista untuk memindahkan pesanan dari antrian persiapan ke status siap saji, otomatis memicu notifikasi ke antrian pramusaji.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">3 Stage</div>
            <div class="metric-desc">Kanban Pipeline</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Auto</div>
            <div class="metric-desc">Aging Timer</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">0</div>
            <div class="metric-desc">Missed Tickets</div>
          </div>
        </div>
      </div>

      <div class="slide-visual">
        <div class="device-container">
          <div class="desktop-frame">
            <div class="frame-bar">
              <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
              <div class="url-chip">siapnyafe.widifirmaan.web.id/kitchen</div>
            </div>
            <img src="${images.kitchenKDSDesktop}" class="desktop-img" alt="Kitchen KDS Desktop">
          </div>
          <div class="mobile-frame">
            <div class="mobile-notch"><div class="notch-speaker"></div></div>
            <img src="${images.kitchenKDSMobile}" class="mobile-img" alt="Kitchen KDS Mobile">
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE WEB ARCHITECTURE</div>
      <div>KITCHEN QUEUE LIFECYCLE & STATE MACHINE</div>
      <div>PAGE 04 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 05: WAITER SERVICE QUEUE ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge" style="background:#2563EB; color:#fff;">FLOOR OPS</div>
        <div class="slide-section-title">WAITER SERVICE QUEUE & TABLE DISPATCH</div>
      </div>
      <div class="slide-page-badge">SLIDE 05</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <div class="route-pill">GET /waiter • TABLE DISPATCH MATRIX</div>
          <h2 class="slide-title">Waiter Floor Queue & Customer Assistance</h2>
          <p class="slide-subtitle">
            Pusat koordinasi pramusaji untuk menyajikan pesanan yang telah selesai diracik di dapur dan merespons panggilan meja (call waiter) secara real-time.
          </p>
        </div>

        <div class="feature-blocks">
          <div class="brutal-card blue-tint">
            <div class="card-label">🔔 Table Assistance Request Hub</div>
            <div class="card-text">
              Menerima pemicu panggilan meja dari portal self-order customer (misal: "Meja 04 butuh bantuan / sendok"). Pramusaji mengonfirmasi penyelesaian tugas via tombol aksi cepat.
            </div>
          </div>
          <div class="brutal-card">
            <div class="card-label">📦 Order Delivery Confirmation</div>
            <div class="card-text">
              Daftar tiket minuman siap antar ke meja tamu. Setelah minuman diantar, pramusaji memvalidasi status pesanan menjadi 'Served' untuk merapikan antrian.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Realtime</div>
            <div class="metric-desc">Table Calls</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">100%</div>
            <div class="metric-desc">Floor Coverage</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">1-Tap</div>
            <div class="metric-desc">Status Resolve</div>
          </div>
        </div>
      </div>

      <div class="slide-visual">
        <div class="device-container">
          <div class="desktop-frame">
            <div class="frame-bar">
              <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
              <div class="url-chip">siapnyafe.widifirmaan.web.id/waiter</div>
            </div>
            <img src="${images.waiterQueueDesktop}" class="desktop-img" alt="Waiter Service Queue Desktop">
          </div>
          <div class="mobile-frame">
            <div class="mobile-notch"><div class="notch-speaker"></div></div>
            <img src="${images.waiterQueueMobile}" class="mobile-img" alt="Waiter Service Queue Mobile">
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE WEB ARCHITECTURE</div>
      <div>FLOOR LOGISTICS & TABLE COORDINATION</div>
      <div>PAGE 05 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 06: INVENTORY STOCK CONTROL ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge" style="background:#D97706; color:#fff;">STOCK ENGINE</div>
        <div class="slide-section-title">RAW INGREDIENT DEDUCTION & STOCK CONTROL</div>
      </div>
      <div class="slide-page-badge">SLIDE 06</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <div class="route-pill">CRUD /api/inventory • D1 SQLITE LEDGER</div>
          <h2 class="slide-title">Recipe-Linked Inventory & Restock Ledger</h2>
          <p class="slide-subtitle">
            Manajemen stok bahan baku (biji kopi, susu segar, sirup, cup take-away) yang terhubung langsung dengan resep menu untuk pemotongan otomatis per transaksi kasir.
          </p>
        </div>

        <div class="feature-blocks">
          <div class="brutal-card amber-tint">
            <div class="card-label">📊 Automatic Bill of Materials (BOM)</div>
            <div class="card-text">
              Setiap cangkir Latte yang terjual otomatis memotong 18 gram biji espresso dan 150ml susu pada basis data Cloudflare D1 secara atomik dalam transaksi SQL.
            </div>
          </div>
          <div class="brutal-card">
            <div class="card-label">🚨 Critical Low-Stock Warning Threshold</div>
            <div class="card-text">
              Threshold peringatan otomatis saat kuantitas bahan baku berada di bawah safety stock, dilengkapi modal restock cepat dan histori penyesuaian opname barang.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Atomic</div>
            <div class="metric-desc">SQL Deductions</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Auto</div>
            <div class="metric-desc">Low-Stock Alert</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">100%</div>
            <div class="metric-desc">BOM Tracking</div>
          </div>
        </div>
      </div>

      <div class="slide-visual">
        <div class="device-container">
          <div class="desktop-frame">
            <div class="frame-bar">
              <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
              <div class="url-chip">siapnyafe.widifirmaan.web.id/inventory</div>
            </div>
            <img src="${images.inventoryDesktop}" class="desktop-img" alt="Inventory Stock Desktop">
          </div>
          <div class="mobile-frame">
            <div class="mobile-notch"><div class="notch-speaker"></div></div>
            <img src="${images.inventoryMobile}" class="mobile-img" alt="Inventory Stock Mobile">
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE WEB ARCHITECTURE</div>
      <div>INVENTORY LEDGER & ATOMIC D1 TRANSACTIONS</div>
      <div>PAGE 06 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 07: STAFF ROSTER ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge" style="background:#8B5CF6; color:#fff;">HUMAN RESOURCES</div>
        <div class="slide-section-title">STAFF ROSTER & ROLE-BASED ACCESS CONTROL</div>
      </div>
      <div class="slide-page-badge">SLIDE 07</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <div class="route-pill">GET /staff • RBAC SECURITY MODEL</div>
          <h2 class="slide-title">Shift Roster & Employee Access Control</h2>
          <p class="slide-subtitle">
            Manajemen penjadwalan shift kerja staf kedai kopi, pencatatan histori absensi, pembekuan akun keamanan, dan segmentasi hak akses berbasis peran (RBAC).
          </p>
        </div>

        <div class="feature-blocks">
          <div class="brutal-card purple-tint">
            <div class="card-label">🛡️ Role-Based Routing Matrix</div>
            <div class="card-text">
              Guard navigasi ketat untuk 4 peran: Admin (akses penuh), Cashier (akses POS), Barista (akses KDS), dan Waiter (akses Floor Queue), mencegah penyalahgunaan terminal.
            </div>
          </div>
          <div class="brutal-card">
            <div class="card-label">📅 Shift Scheduling & Account Lifecycle</div>
            <div class="card-text">
              Manajemen rekrutmen staf baru, perubahan status aktif/beku (freeze account), dan monitoring log presensi kerja karyawan secara transparan.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">4 Roles</div>
            <div class="metric-desc">RBAC Hierarchy</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">JWT</div>
            <div class="metric-desc">Edge Token Auth</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">100%</div>
            <div class="metric-desc">Route Guarding</div>
          </div>
        </div>
      </div>

      <div class="slide-visual">
        <div class="device-container">
          <div class="desktop-frame">
            <div class="frame-bar">
              <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
              <div class="url-chip">siapnyafe.widifirmaan.web.id/staff</div>
            </div>
            <img src="${images.staffDesktop}" class="desktop-img" alt="Staff Roster Desktop">
          </div>
          <div class="mobile-frame">
            <div class="mobile-notch"><div class="notch-speaker"></div></div>
            <img src="${images.staffMobile}" class="mobile-img" alt="Staff Roster Mobile">
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE WEB ARCHITECTURE</div>
      <div>IDENTITY LIFECYCLE & ACCESS POLICIES</div>
      <div>PAGE 07 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 08: ASSET & EQUIPMENT ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge">HARDWARE ASSETS</div>
        <div class="slide-section-title">ASSET LIFECYCLE & MAINTENANCE LOGS</div>
      </div>
      <div class="slide-page-badge">SLIDE 08</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <div class="route-pill">GET /asset • ASSET REGISTRY & DEPRECIATION</div>
          <h2 class="slide-title">Asset Registry & Maintenance Tracking</h2>
          <p class="slide-subtitle">
            Pencatatan aset mesin komersial (espresso machine, coffee grinder, water filtration system, ice maker) beserta jadwal servis rutin dan riwayat kondisi operasional.
          </p>
        </div>

        <div class="feature-blocks">
          <div class="brutal-card amber-tint">
            <div class="card-label">🔧 Preventive Maintenance Scheduling</div>
            <div class="card-text">
              Pelacak jadwal descaling rutin, penggantian burr grinder, kalibrasi suhu boiler, dan pencatatan teknisi servis pihak ketiga untuk meminimalisir downtime outlet.
            </div>
          </div>
          <div class="brutal-card">
            <div class="card-label">📋 Asset Condition State Matrix</div>
            <div class="card-text">
              Badge status kondisi visual (Optimal, Needs Service, Maintenance Active) dengan validasi modal konfirmasi perubahan kondisi fisik mesin operasional.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">100%</div>
            <div class="metric-desc">Asset Audit Trail</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Proactive</div>
            <div class="metric-desc">Service Schedule</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Zero</div>
            <div class="metric-desc">Unlogged Outage</div>
          </div>
        </div>
      </div>

      <div class="slide-visual">
        <div class="device-container">
          <div class="desktop-frame">
            <div class="frame-bar">
              <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
              <div class="url-chip">siapnyafe.widifirmaan.web.id/asset</div>
            </div>
            <img src="${images.assetDesktop}" class="desktop-img" alt="Asset & Equipment Desktop">
          </div>
          <div class="mobile-frame">
            <div class="mobile-notch"><div class="notch-speaker"></div></div>
            <img src="${images.assetMobile}" class="mobile-img" alt="Asset & Equipment Mobile">
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE WEB ARCHITECTURE</div>
      <div>EQUIPMENT PREVENTIVE MAINTENANCE LOGGING</div>
      <div>PAGE 08 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 09: TECH STACK & SYSTEM ARCHITECTURE ==================== -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge" style="background:#F59E0B;">TECH STACK MATRIX</div>
        <div class="slide-section-title">FULLSTACK EDGE SYSTEM ARCHITECTURE</div>
      </div>
      <div class="slide-page-badge">SLIDE 09</div>
    </div>

    <div style="margin-bottom: 8px;">
      <h2 class="slide-title">Serverless Edge Architecture & Frontend Topology</h2>
      <p class="slide-subtitle">
        Kombinasi teknologi React 18 SPA pada edge CDN, didukung Cloudflare Workers serverless runtime dan Cloudflare D1 distributed SQLite database untuk latensi ultra-rendah.
      </p>
    </div>

    <div class="arch-grid">
      <!-- Frontend Tier -->
      <div class="arch-col">
        <div class="arch-col-title">
          <span>01. FRONTEND TIER</span>
          <span style="color:#F59E0B;">●</span>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">React 18.2 SPA</div>
          <div class="arch-item-detail">Arsitektur komponen modular dengan client-side state management terisolasi untuk tiap modul operasional.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Vite 5 Bundler</div>
          <div class="arch-item-detail">Build tool modern dengan modul HMR instan dan output bundle teroptimasi untuk caching CDN global.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">React Router v6</div>
          <div class="arch-item-detail">Client-side routing deklaratif dengan guard proteksi rute berbasis peran (Role-Based Guards).</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Neo-Brutalist CSS Tokens</div>
          <div class="arch-item-detail">Sistem visual presisi tinggi dengan hard borders 3px, offset shadow 4-6px, dan tipografi ekspresif.</div>
        </div>
      </div>

      <!-- Edge Backend Tier -->
      <div class="arch-col">
        <div class="arch-col-title">
          <span>02. SERVERLESS RUNTIME</span>
          <span style="color:#EA580C;">●</span>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Cloudflare Workers</div>
          <div class="arch-item-detail">V8 serverless isolate running pada 300+ edge locations di seluruh dunia dengan cold-start nol milidetik.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">RESTful Edge API</div>
          <div class="arch-item-detail">Routing endpoint terpadu untuk transaksi POS, tiket kitchen, inventory updates, dan shift management.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Bcrypt & JWT Auth</div>
          <div class="arch-item-detail">Hashing kredensial aman di edge dengan validasi token JWT stateless tanpa overhead session server.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Cloudflare R2 Storage</div>
          <div class="arch-item-detail">Penyimpanan objek S3-compatible tanpa biaya egress bandwidth untuk aset foto menu dan roastery.</div>
        </div>
      </div>

      <!-- Database Tier -->
      <div class="arch-col">
        <div class="arch-col-title">
          <span>03. PERSISTENCE & OPS</span>
          <span style="color:#10B981;">●</span>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Cloudflare D1 SQLite</div>
          <div class="arch-item-detail">Basis data SQL relasional terdistribusi dengan transaksi ACID atomik untuk integritas stok dan uang kasir.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Relational Schema</div>
          <div class="arch-item-detail">Tabel terindeks mencakup orders, order_items, recipes, inventory_stocks, staff_roster, dan assets.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Lucide Icon Suite</div>
          <div class="arch-item-detail">Set ikon SVG monokromatis yang ringan dan konsisten dengan estetika teknis Neo-Brutalism.</div>
        </div>
        <div class="arch-item">
          <div class="arch-item-name">Automated Testing</div>
          <div class="arch-item-detail">Pengujian integrasi end-to-end menyeluruh memastikan seluruh flow transaksi kasir dan kitchen lulus uji.</div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE WEB ARCHITECTURE</div>
      <div>ENTERPRISE TECH STACK & SYSTEM TOPOLOGY</div>
      <div>PAGE 09 / 10</div>
    </div>
  </div>

  <!-- ==================== SLIDE 10: CLOSING ==================== -->
  <div class="slide closing-slide">
    <div class="brand-badge" style="background:#F59E0B; font-size:12px; padding:6px 14px;">SIAP NYAFE COFFEE POS PLATFORM</div>
    <h1 class="closing-title">ENTERPRISE COFFEE SHOP<br>OPERATIONAL EXCELLENCE</h1>
    
    <p style="font-size: 15px; color: #4B5563; max-width: 680px; font-weight: 600; line-height: 1.5;">
      Solusi web point-of-sale modern yang mengintegrasikan pengalaman pesan mandiri pelanggan, ketepatan transaksi kasir, efisiensi stasiun dapur barista, hingga kepatuhan inventaris bahan baku dalam satu platform serverless edge terpadu.
    </p>

    <div class="closing-pills">
      <div class="brutal-card amber-tint" style="padding: 6px 14px; font-weight: 800; font-size: 11px;">☕ SELF-ORDER PORTAL</div>
      <div class="brutal-card emerald-tint" style="padding: 6px 14px; font-weight: 800; font-size: 11px;">💵 CASHIER TERMINAL</div>
      <div class="brutal-card" style="padding: 6px 14px; font-weight: 800; font-size: 11px;">🍳 KITCHEN KDS QUEUE</div>
      <div class="brutal-card blue-tint" style="padding: 6px 14px; font-weight: 800; font-size: 11px;">🔔 WAITER DISPATCH</div>
      <div class="brutal-card purple-tint" style="padding: 6px 14px; font-weight: 800; font-size: 11px;">📦 INVENTORY LEDGER</div>
      <div class="brutal-card" style="background:#FCE7F3; padding: 6px 14px; font-weight: 800; font-size: 11px;">👥 STAFF ROSTER RBAC</div>
    </div>

    <div class="live-hero-card">
      <div style="font-family:'Space Grotesk',sans-serif; font-size:11px; font-weight:800; color:#6B7280; letter-spacing:0.08em; text-transform:uppercase;">
        LIVE PRODUCTION ENVIRONMENT
      </div>
      <div class="live-url-text">https://siapnyafe.widifirmaan.web.id</div>
      <div style="font-size:11px; color:#6B7280; font-weight:600;">
        Powered by React 18 • Cloudflare Workers • Cloudflare D1 Distributed SQLite
      </div>
    </div>

    <div class="slide-footer" style="width: 100%; margin-top: 15px;">
      <div>ENGINEERED BY WIDI FIRMANSYAH</div>
      <div>PRODUCTION-READY WEB PLATFORM</div>
      <div>PAGE 10 / 10</div>
    </div>
  </div>

</body>
</html>
`;

const htmlFilePath = path.join(projectRoot, 'presentation.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log(`📄 Presentation HTML written to: ${htmlFilePath}`);

console.log('🚀 Launching Chromium with Playwright to render Siap Nyafe POS PDF...');

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
  console.log('🖨️  Rendering Multi-Page A4 Landscape Presentation PDF (Slide Mode)...');
  await page.pdf({
    path: slidePdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
  });

  // 2. Continuous Poster Mode (Single tall scroll)
  console.log('📜 Rendering Continuous Single-Scroll Showcase PDF (Poster Mode)...');
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

  console.log('\n================================================================================');
  console.log('🎉 SIAP NYAFE POS ARCHITECTURE PDFS SUCCESSFULLY GENERATED!');
  console.log(`📦 Multi-Page Deck (Slides)   : ${(slideStat.size / 1024 / 1024).toFixed(2)} MB (10 Pages A4 Landscape)`);
  console.log(`   -> Saved: ${slidePdfPath}`);
  console.log(`📦 Continuous Poster (Scroll) : ${(contStat.size / 1024 / 1024).toFixed(2)} MB (1 Long Showcase Page)`);
  console.log(`   -> Saved: ${continuousPdfPath}`);
  console.log('================================================================================\n');
}

renderPDF().catch((err) => {
  console.error('❌ Error during PDF generation:', err);
  process.exit(1);
});
