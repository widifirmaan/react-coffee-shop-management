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

console.log('Encoding Siap Nyafe Coffee Shop screenshots...');

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

console.log('Assembling English Neo-Brutalist Presentation Deck HTML...');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
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
    }

    .brand-title {
      font-size: 16px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.02em;
    }

    .brand-subtitle {
      font-size: 12px;
      font-weight: 700;
      color: #333333;
      border-left: 2px solid #000000;
      padding-left: 10px;
    }

    .slide-pill {
      background: #000000;
      color: #ffffff;
      padding: 5px 14px;
      font-family: var(--font-mono);
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 0.05em;
      border: 2px solid #000000;
      box-shadow: 3px 3px 0px var(--secondary-color);
    }

    /* Content Area */
    .slide-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .title-banner {
      background: #ffffff;
      border: var(--border-width) solid #000000;
      box-shadow: 5px 5px 0px #000000;
      padding: 10px 18px;
      margin-bottom: 4.5mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .title-banner-text h2 {
      font-size: 20px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.02em;
      color: #000000;
      line-height: 1.1;
    }

    .title-banner-text p {
      font-size: 12px;
      font-weight: 700;
      color: #444444;
      margin-top: 2px;
    }

    .section-badge {
      background: var(--primary-color);
      color: #ffffff;
      border: 3px solid #000000;
      box-shadow: 3px 3px 0px #000000;
      font-family: var(--font-mono);
      font-weight: 800;
      font-size: 10px;
      padding: 4px 10px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    /* Split Layouts */
    .layout-split {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 16px;
      align-items: stretch;
      flex: 1;
    }

    .layout-split-reversed {
      display: grid;
      grid-template-columns: 0.95fr 1.05fr;
      gap: 16px;
      align-items: stretch;
      flex: 1;
    }

    .layout-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      flex: 1;
    }

    .layout-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      flex: 1;
    }

    /* Visual Stage */
    .visual-stage {
      background: #ffffff;
      border: var(--border-width) solid #000000;
      box-shadow: 6px 6px 0px #000000;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      height: 100%;
      min-height: 290px;
      padding: 10px;
    }

    .visual-stage img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      filter: drop-shadow(4px 4px 0px rgba(0,0,0,0.4));
    }

    /* Brutalist Cards */
    .brutalist-card {
      background: #ffffff;
      border: var(--border-width) solid #000000;
      box-shadow: 5px 5px 0px #000000;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }

    .brutalist-card.accent-yellow {
      background: #FEF08A;
    }

    .brutalist-card.accent-pink {
      background: #FBCFE8;
    }

    .brutalist-card.accent-green {
      background: #BBF7D0;
    }

    .brutalist-card.accent-purple {
      background: #DDD6FE;
    }

    .card-header-tag {
      display: inline-block;
      align-self: flex-start;
      background: #000000;
      color: #ffffff;
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .card-title {
      font-size: 15px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      margin-bottom: 6px;
      color: #000000;
    }

    .card-desc {
      font-size: 12px;
      color: #222222;
      line-height: 1.45;
      font-weight: 500;
    }

    /* Feature List */
    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      justify-content: center;
    }

    .feature-box {
      background: #ffffff;
      border: 3px solid #000000;
      box-shadow: 4px 4px 0px #000000;
      padding: 10px 14px;
    }

    .feature-box-title {
      font-size: 13.5px;
      font-weight: 900;
      text-transform: uppercase;
      color: #000000;
      margin-bottom: 3px;
    }

    .feature-box-desc {
      font-size: 11.5px;
      color: #333333;
      line-height: 1.4;
      font-weight: 500;
    }

    /* Footer */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4.5mm;
      padding-top: 3mm;
      border-top: var(--border-width) solid #000000;
      font-family: var(--font-mono);
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .tech-tag {
      display: inline-block;
      padding: 3px 8px;
      background: #000000;
      color: #ffffff;
      font-family: var(--font-mono);
      font-size: 10.5px;
      font-weight: 800;
      margin-right: 6px;
      box-shadow: 2px 2px 0px var(--accent-color);
    }
  </style>
</head>
<body>

  <!-- SLIDE 1: COVER -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge">SYSTEM-COFFEE-01</div>
        <div class="brand-title">SIAP NYAFE POS</div>
        <div class="brand-subtitle">Neo-Brutalist Coffee POS &amp; Cafe Management Architecture</div>
      </div>
      <div class="slide-pill">DECK-REV-01 / 10</div>
    </div>

    <div class="slide-content">
      <div class="layout-split">
        <div style="display: flex; flex-direction: column; justify-content: center; padding-right: 10px;">
          <div style="display: flex; gap: 8px; margin-bottom: 14px;">
            <span class="tech-tag">React 18</span>
            <span class="tech-tag">Vite 5</span>
            <span class="tech-tag">Tailwind CSS</span>
            <span class="tech-tag">LocalStorage State</span>
          </div>
          <h1 style="font-size: 40px; font-weight: 900; line-height: 1.05; text-transform: uppercase; margin-bottom: 14px; letter-spacing: -0.03em;">
            Neo-Brutalist Cafe POS &amp; Management Web Architecture
          </h1>
          <p style="font-size: 14px; color: #222222; font-weight: 600; line-height: 1.5; margin-bottom: 20px;">
            A high-velocity, zero-latency Point of Sale and cafe operations system featuring deterministic offline state persistence, real-time inventory deduction, 58mm thermal receipt printing, and high-contrast Neo-Brutalist UI ergonomics.
          </p>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            <div class="brutalist-card accent-yellow" style="padding: 10px;">
              <div class="card-header-tag">ARCHITECTURE</div>
              <div style="font-size: 18px; font-weight: 900; margin-top: 2px;">ZERO SERVER</div>
              <div style="font-size: 11px; font-weight: 700; color: #333;">100% LocalStorage</div>
            </div>
            <div class="brutalist-card accent-pink" style="padding: 10px;">
              <div class="card-header-tag">DESIGN SYSTEM</div>
              <div style="font-size: 18px; font-weight: 900; margin-top: 2px;">BRUTALISM</div>
              <div style="font-size: 11px; font-weight: 700; color: #333;">0px Radius &bull; 4px Solid</div>
            </div>
            <div class="brutalist-card accent-green" style="padding: 10px;">
              <div class="card-header-tag">PERFORMANCE</div>
              <div style="font-size: 18px; font-weight: 900; margin-top: 2px;">SUB-50MS</div>
              <div style="font-size: 11px; font-weight: 700; color: #333;">Instant Checkout</div>
            </div>
          </div>
        </div>

        <div class="visual-stage">
          <img src="${images.customerDesktop}" alt="Coffee Shop Customer Order Desktop">
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE CAFE MANAGEMENT PLATFORM</div>
      <div>WIDI FIRMANSYAH &bull; LEAD ENGINEER</div>
      <div>01 / 10</div>
    </div>
  </div>

  <!-- SLIDE 2: ARCHITECTURE & TECHNICAL FOUNDATIONS -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge">ARCHITECTURE</div>
        <div class="brand-title">SYSTEM FOUNDATIONS</div>
        <div class="brand-subtitle">Technical Problem Statement &amp; Design Rationale</div>
      </div>
      <div class="slide-pill">DECK-REV-02 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="title-banner-text">
          <h2>Offline-First State Management &amp; Operational Velocity</h2>
          <p>Overcoming operational bottlenecks in fast-paced F&amp;B environments with deterministic client-side architecture.</p>
        </div>
        <div class="section-badge">CORE PRINCIPLES</div>
      </div>

      <div class="layout-grid-3">
        <div class="brutalist-card accent-yellow">
          <div class="card-header-tag">01 &bull; BOTTLENECK</div>
          <h3 class="card-title">Network Latency Delays</h3>
          <p class="card-desc">
            Traditional cloud POS systems suffer during peak rush hours when intermittent network connections freeze order queues and cause inventory state desynchronization.
          </p>
        </div>

        <div class="brutalist-card accent-pink">
          <div class="card-header-tag">02 &bull; SOLUTION</div>
          <h3 class="card-title">Deterministic Local State</h3>
          <p class="card-desc">
            Client-side atomic transactions via custom LocalStorage state wrappers guarantee zero-latency cart updates, instantaneous item deduction, and resilient offline continuity.
          </p>
        </div>

        <div class="brutalist-card accent-green">
          <div class="card-header-tag">03 &bull; ERGONOMICS</div>
          <h3 class="card-title">Neo-Brutalist Visual Clarity</h3>
          <p class="card-desc">
            0px border radius, 4px solid borders, and stark high-contrast color coding prevent operational misclicks in dimly lit cafe counter lighting and high-glare environments.
          </p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE &bull; SYSTEM FOUNDATIONS</div>
      <div>OFFLINE-FIRST ARCHITECTURE</div>
      <div>02 / 10</div>
    </div>
  </div>

  <!-- SLIDE 3: CUSTOMER SELF-ORDER & CALL WAITER -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge">CUSTOMER-MODULE</div>
        <div class="brand-title">SELF-SERVICE WORKFLOW</div>
        <div class="brand-subtitle">Table-Side Mobile Ordering &amp; Staff Dispatch</div>
      </div>
      <div class="slide-pill">DECK-REV-03 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="title-banner-text">
          <h2>Table-Side QR Ordering &amp; Real-Time Staff Assistance</h2>
          <p>Frictionless digital ordering interface designed for rapid guest self-checkout and instant staff paging.</p>
        </div>
        <div class="section-badge">GUEST INTERACTION</div>
      </div>

      <div class="layout-split">
        <div class="visual-stage">
          <img src="${images.waiterDesktop}" alt="Coffee Customer Modal Call Waiter Desktop">
        </div>

        <div class="feature-list">
          <div class="feature-box">
            <div class="feature-box-title">QR Table ID Binding &amp; Context Isolation</div>
            <div class="feature-box-desc">
              Automatic table number binding via URL parameters ensures all guest orders and cart actions remain strictly isolated to the assigned dining table.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Visual Item Customizer &amp; Variant Modals</div>
            <div class="feature-box-desc">
              Real-time temperature toggles (Hot / Iced), sugar levels, and extra shot add-ons with immediate subtotal recalculation before cart dispatch.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Instant Call Waiter Dispatch Modal</div>
            <div class="feature-box-desc">
              Accessible popup dialog allowing guests to page floor staff for bill requests, utensil replenishment, or table assistance with zero page reload.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE &bull; GUEST EXPERIENCE</div>
      <div>QR TABLE-SIDE ORDERING</div>
      <div>03 / 10</div>
    </div>
  </div>

  <!-- SLIDE 4: CASHIER POS REGISTER TERMINAL -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge">REGISTER-MODULE</div>
        <div class="brand-title">CASHIER POS TERMINAL</div>
        <div class="brand-subtitle">High-Throughput Counter Sales &amp; Cart State</div>
      </div>
      <div class="slide-pill">DECK-REV-04 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="title-banner-text">
          <h2>High-Velocity Cashier Register &amp; Rapid Item Lookup</h2>
          <p>Designed for front-line baristas and cashiers to complete high-volume peak transaction queues in under 3 taps.</p>
        </div>
        <div class="section-badge">COUNTER TERMINAL</div>
      </div>

      <div class="layout-split-reversed">
        <div class="feature-list">
          <div class="feature-box">
            <div class="feature-box-title">One-Tap Barcode &amp; Category Filters</div>
            <div class="feature-box-desc">
              Instant product search with keyboard shortcuts and category tab pills (Coffee, Non-Coffee, Pastry, Heavy Meals) with sub-16ms DOM updates.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Active Order Queue &amp; Multi-Table Tracking</div>
            <div class="feature-box-desc">
              Real-time monitoring of dine-in versus takeaway order queues with status badges (Pending, Brewing, Completed) and clear visual markers.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Immediate Tax &amp; Discount Calculation</div>
            <div class="feature-box-desc">
              Automated service charge, PPN, and promotional coupon calculation directly rendered in the sidebar summary with full financial breakdown.
            </div>
          </div>
        </div>

        <div class="visual-stage">
          <img src="${images.cashierDesktop}" alt="Coffee Cashier POS Register Desktop">
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE &bull; CASHIER TERMINAL</div>
      <div>RAPID TRANSACTION ENGINE</div>
      <div>04 / 10</div>
    </div>
  </div>

  <!-- SLIDE 5: THERMAL RECEIPT GENERATOR -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge">RECEIPT-MODULE</div>
        <div class="brand-title">THERMAL RECEIPT ENGINE</div>
        <div class="brand-subtitle">58mm / 80mm Print Layout &amp; Invoice UUID</div>
      </div>
      <div class="slide-pill">DECK-REV-05 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="title-banner-text">
          <h2>Thermal Printer Layout &amp; Monospace Invoice Formatter</h2>
          <p>Standardized receipt modal output engineered to avoid column drift across ESC/POS hardware printers.</p>
        </div>
        <div class="section-badge">PRINT AUTOMATION</div>
      </div>

      <div class="layout-split">
        <div class="visual-stage">
          <img src="${images.receiptDesktop}" alt="Coffee Cashier Modal Thermal Receipt Desktop">
        </div>

        <div class="feature-list">
          <div class="feature-box">
            <div class="feature-box-title">Monospace Column Alignment (JetBrains Mono)</div>
            <div class="feature-box-desc">
              Strict character-width calculation guarantees that item names, quantities, and currency amounts align cleanly without horizontal layout shifts.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Deterministic Order UUID &amp; Timestamping</div>
            <div class="feature-box-desc">
              Unique transaction identifiers generated per ticket along with exact cashier session IDs and ISO timestamps for bulletproof bookkeeping audit trails.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Native Window Print CSS Triggers</div>
            <div class="feature-box-desc">
              Print media queries (@media print) isolate the receipt ticket, automatically stripping extraneous screen chrome for clean thermal paper printing.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE &bull; RECEIPT ENGINE</div>
      <div>THERMAL ESC/POS COMPLIANCE</div>
      <div>05 / 10</div>
    </div>
  </div>

  <!-- SLIDE 6: EQUIPMENT & ASSET MAINTENANCE -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge">ASSET-MODULE</div>
        <div class="brand-title">EQUIPMENT &amp; INVENTORY</div>
        <div class="brand-subtitle">Asset Maintenance Cycles &amp; Depreciation Ledger</div>
      </div>
      <div class="slide-pill">DECK-REV-06 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="title-banner-text">
          <h2>Commercial Espresso Equipment Tracking &amp; Asset Lifecycle</h2>
          <p>Operational registry managing espresso machines, grinders, water filtration units, and preventive servicing schedules.</p>
        </div>
        <div class="section-badge">OPERATIONS</div>
      </div>

      <div class="layout-split-reversed">
        <div class="feature-list">
          <div class="feature-box">
            <div class="feature-box-title">Preventive Servicing Alert Thresholds</div>
            <div class="feature-box-desc">
              Automated warning badges indicating upcoming descaling, group head gasket replacement, and grinder burr calibration deadlines.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Asset Depreciation &amp; Valuation Ledger</div>
            <div class="feature-box-desc">
              Calculates monthly equipment book value, purchase dates, warranty expiry, and vendor maintenance contact information in a single view.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Barista Operational Notes &amp; Status Logs</div>
            <div class="feature-box-desc">
              Audit log where technicians and head baristas log pressure readings, PID temperature offsets, and routine parts replacements.
            </div>
          </div>
        </div>

        <div class="visual-stage">
          <img src="${images.assetDesktop}" alt="Coffee Asset &amp; Equipment Desktop">
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE &bull; ASSET MANAGEMENT</div>
      <div>EQUIPMENT LIFECYCLE LEDGER</div>
      <div>06 / 10</div>
    </div>
  </div>

  <!-- SLIDE 7: CAFE MARKETING & BLOG CMS -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge">CMS-MODULE</div>
        <div class="brand-title">BLOG &amp; CONTENT CMS</div>
        <div class="brand-subtitle">Markdown Content Management &amp; Community Engagement</div>
      </div>
      <div class="slide-pill">DECK-REV-07 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="title-banner-text">
          <h2>Client-Side Markdown CMS &amp; Specialty Coffee Stories</h2>
          <p>Integrated editorial publishing engine for coffee bean origins, brewing tutorials, and cafe community updates.</p>
        </div>
        <div class="section-badge">CONTENT ENGINE</div>
      </div>

      <div class="layout-split">
        <div class="visual-stage">
          <img src="${images.blogDesktop}" alt="Coffee Blog Post CMS Desktop">
        </div>

        <div class="feature-list">
          <div class="feature-box">
            <div class="feature-box-title">Live Markdown Parsing &amp; Sanitization</div>
            <div class="feature-box-desc">
              Instant client-side syntax highlighting for brewing recipes, water ratios, grind sizes, and origin profiles with zero XSS vulnerabilities.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Category Filtering &amp; Reading Metrics</div>
            <div class="feature-box-desc">
              Tagging system (Brewing, Origins, Events, Menu Updates) with automatic reading time estimates and responsive cover artwork cards.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Persistent Article Store &amp; Publishing Pipeline</div>
            <div class="feature-box-desc">
              Articles stored as structured JSON documents in LocalStorage, ready for static site generation or headless CMS synchronization.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE &bull; CONTENT ENGINE</div>
      <div>MARKDOWN BLOG CMS</div>
      <div>07 / 10</div>
    </div>
  </div>

  <!-- SLIDE 8: RESPONSIVE TOUCH & MOBILE ERGONOMICS -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge">MOBILE-MODULE</div>
        <div class="brand-title">TOUCH ERGONOMICS</div>
        <div class="brand-subtitle">Viewport Scalability &amp; One-Handed Usability</div>
      </div>
      <div class="slide-pill">DECK-REV-08 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="title-banner-text">
          <h2>Handheld Barista Tablet &amp; Smartphone Interface Adaptability</h2>
          <p>Strict ergonomic interface design ensuring error-free operation on compact mobile screens and tablet stands.</p>
        </div>
        <div class="section-badge">MOBILE ADAPTATION</div>
      </div>

      <div class="layout-split-reversed">
        <div class="feature-list">
          <div class="feature-box">
            <div class="feature-box-title">48px+ Minimum Touch Target Invariant</div>
            <div class="feature-box-desc">
              Every button, quantity stepper, and category pill adheres to human interface guidelines to eliminate accidental taps on busy mobile displays.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Floating Thumb-Zone Checkout Trigger</div>
            <div class="feature-box-desc">
              Bottom sticky drawer provides instantaneous access to the checkout summary and receipt action within natural thumb reach.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Zero Horizontal Overflow Containment</div>
            <div class="feature-box-desc">
              Robust flexbox and CSS grid constraints guarantee zero horizontal scroll drift across varying smartphone viewports (360px - 768px).
            </div>
          </div>
        </div>

        <div class="visual-stage">
          <img src="${images.cashierMobile}" alt="Coffee Cashier Mobile Register">
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE &bull; MOBILE ERGONOMICS</div>
      <div>TOUCH TARGET STANDARDS</div>
      <div>08 / 10</div>
    </div>
  </div>

  <!-- SLIDE 9: PERFORMANCE & CORE WEB VITALS -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge">PERFORMANCE</div>
        <div class="brand-title">RUNTIME BENCHMARKS</div>
        <div class="brand-subtitle">Core Web Vitals &amp; Memory Allocation</div>
      </div>
      <div class="slide-pill">DECK-REV-09 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="title-banner-text">
          <h2>Sub-Millisecond Cart Operations &amp; Zero Layout Shift</h2>
          <p>Rigorous frontend performance engineering delivering instant user interactions without memory bloat.</p>
        </div>
        <div class="section-badge">BENCHMARKS</div>
      </div>

      <div class="layout-grid-3">
        <div class="brutalist-card accent-yellow">
          <div class="card-header-tag">INTERACTION</div>
          <h3 class="card-title">INP &lt; 20ms</h3>
          <p class="card-desc">
            Direct synchronous state dispatch combined with memoized React components ensures immediate tactile feedback on every click, tap, and quantity change.
          </p>
        </div>

        <div class="brutalist-card accent-pink">
          <div class="card-header-tag">LAYOUT STABILITY</div>
          <h3 class="card-title">CLS = 0.000</h3>
          <p class="card-desc">
            Explicit aspect ratio containers and reserved space for dynamic item modals prevent any layout shifts during asset or font loading cycles.
          </p>
        </div>

        <div class="brutalist-card accent-green">
          <div class="card-header-tag">BUNDLE EFFICIENCY</div>
          <h3 class="card-title">&lt; 150 KB Gzip</h3>
          <p class="card-desc">
            Rollup code-splitting via Vite compiles modern ES modules with zero heavy dependencies, achieving sub-second initial paint on 3G connections.
          </p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE &bull; PERFORMANCE AUDIT</div>
      <div>CORE WEB VITALS METRICS</div>
      <div>09 / 10</div>
    </div>
  </div>

  <!-- SLIDE 10: ARCHITECTURAL SUMMARY & PRODUCTION READINESS -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-badge">MILESTONE</div>
        <div class="brand-title">DELIVERY SUMMARY</div>
        <div class="brand-subtitle">Final Specifications &amp; Production Deployment</div>
      </div>
      <div class="slide-pill">DECK-REV-10 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="title-banner-text">
          <h2>Production-Ready Architecture Summary &amp; Deployment</h2>
          <p>Comprehensive validation checklist verifying operational robustness and design fidelity.</p>
        </div>
        <div class="section-badge">ENTERPRISE VERIFIED</div>
      </div>

      <div class="layout-grid-4">
        <div class="brutalist-card accent-yellow">
          <div class="card-header-tag">FRAMEWORK</div>
          <div style="font-size: 16px; font-weight: 900; margin-top: 2px; margin-bottom: 4px;">React 18 + Vite</div>
          <p class="card-desc">Modern SPA pipeline with tree-shaken production bundles.</p>
        </div>

        <div class="brutalist-card accent-pink">
          <div class="card-header-tag">STYLING</div>
          <div style="font-size: 16px; font-weight: 900; margin-top: 2px; margin-bottom: 4px;">Neo-Brutalism</div>
          <p class="card-desc">4px solid borders, 0px radius, high-contrast retro pop palette.</p>
        </div>

        <div class="brutalist-card accent-green">
          <div class="card-header-tag">PERSISTENCE</div>
          <div style="font-size: 16px; font-weight: 900; margin-top: 2px; margin-bottom: 4px;">Offline First</div>
          <p class="card-desc">Deterministic LocalStorage sync with zero server dependency.</p>
        </div>

        <div class="brutalist-card accent-purple">
          <div class="card-header-tag">HARDWARE</div>
          <div style="font-size: 16px; font-weight: 900; margin-top: 2px; margin-bottom: 4px;">Thermal Print</div>
          <p class="card-desc">ESC/POS 58mm &amp; 80mm monospace receipt compliance.</p>
        </div>
      </div>

      <div class="visual-stage" style="min-height: 155px; max-height: 175px; margin-top: 12px;">
        <img src="${images.customerMobile}" alt="Coffee Customer Mobile View">
      </div>
    </div>

    <div class="slide-footer">
      <div>SIAP NYAFE &bull; SYSTEM SUMMARY</div>
      <div>WIDI FIRMANSYAH &bull; LEAD ENGINEER</div>
      <div>10 / 10</div>
    </div>
  </div>

</body>
</html>
`;

const htmlFilePath = path.join(projectRoot, 'presentation.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log(`Presentation HTML written to: ${htmlFilePath}`);

console.log('Launching Chromium with Playwright to render English Neo-Brutalist PDFs...');

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
  console.log('Rendering Multi-Page A4 Landscape (Slide Mode)...');
  await page.pdf({
    path: slidePdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
  });

  // 2. Continuous Poster Mode (Single tall scroll)
  console.log('Rendering Continuous Single-Scroll Showcase (Poster Mode)...');
  await page.addStyleTag({
    content: `
      @page {
        size: auto;
        margin: 0;
      }
      body {
        background-color: #f0f0f0 !important;
        background-image: radial-gradient(rgba(0, 0, 0, 0.18) 1.5px, transparent 1.5px) !important;
        background-size: 28px 28px !important;
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

  console.log('\nCoffeeShop English PDFs successfully generated:');
  console.log(`- Multi-Page Deck: ${(slideStat.size / 1024 / 1024).toFixed(2)} MB (${slidePdfPath})`);
  console.log(`- Continuous Poster: ${(contStat.size / 1024 / 1024).toFixed(2)} MB (${continuousPdfPath})\n`);
}

renderPDF().catch((err) => {
  console.error('Error rendering PDF:', err);
  process.exit(1);
});
