/**
 * IoT Hydroponics Configuration, BMC Data & Persistence
 * Manages default settings, threshold limits, themes, BMC data, and localStorage
 */

const DEFAULT_CONFIG = {
  // Theme: 'dark' or 'light'
  theme: 'light',

  // Mode: 'simulation' or 'hardware'
  connectionMode: 'simulation',

  // Auto-Balancer Mode Settings (Value Proposition #1)
  autoBalancer: {
    enabled: true,
    targetPhMin: 5.5,
    targetPhMax: 6.5,
    targetPpmMin: 800,
    targetPpmMax: 1200,
    pulseDoseMl: 10
  },

  // MQTT WebSockets Settings
  mqtt: {
    broker: 'broker.hivemq.com',
    port: 8000,
    path: '/mqtt',
    clientId: 'Hydroponic_Dash_' + Math.random().toString(16).substr(2, 8),
    topicSensors: 'hydroponics/sensors',
    topicControls: 'hydroponics/controls',
    topicAlerts: 'hydroponics/alerts'
  },

  // Hydroponic Threshold Limits & Optimal Ranges
  thresholds: {
    ph: { min: 5.5, max: 6.5, unit: 'pH', warningMin: 5.0, warningMax: 7.0 },
    ppm: { min: 800, max: 1400, unit: 'PPM', warningMin: 600, warningMax: 1600 },
    waterTemp: { min: 18, max: 24, unit: '°C', warningMin: 15, warningMax: 28 },
    waterLevel: { min: 30, max: 100, unit: '%', warningMin: 20 },
    airTemp: { min: 20, max: 30, unit: '°C' },
    humidity: { min: 50, max: 80, unit: '%' },
    light: { min: 10000, max: 30000, unit: 'Lux' }
  },

  // Actuator States
  actuators: {
    mainPump: { state: false, mode: 'auto', name: 'Pompa Utama (NFT/DFT)' },
    phUpPump: { state: false, mode: 'manual', name: 'Dosing Pompa pH Up' },
    phDownPump: { state: false, mode: 'manual', name: 'Dosing Pompa pH Down' },
    nutrientPumpA: { state: false, mode: 'manual', name: 'Dosing Nutrisi A' },
    nutrientPumpB: { state: false, mode: 'manual', name: 'Dosing Nutrisi B' },
    growLight: { state: true, mode: 'auto', name: 'Lampu LED Grow Light' },
    aerator: { state: true, mode: 'auto', name: 'Aerator Oksigen' }
  }
};

// --------------------------------------------------------------------------
// BUSINESS MODEL CANVAS (BMC) DATA SYSTEM
// --------------------------------------------------------------------------
const BMC_DATA = {
  keyPartners: [
    { title: "Toko Komponen Elektronika", desc: "Supplier modul sensor, mikrokontroler, dan catu daya (power supply)." },
    { title: "Komunitas Hidroponik & IoT", desc: "Wadah promosi, feedback produk, dan riset kebutuhan pasar." },
    { title: "Penyedia Box Enclosure / 3D Print", desc: "Vendor pembuat wadah pelindung alat agar aman dari percikan air." }
  ],
  keyActivities: [
    { title: "Riset & Kalibrasi Sensor", desc: "Memilih dan mengkalibrasi sensor TDS/pH agar pembacaan nutrisi akurat." },
    { title: "Perakitan Hardware & Coding", desc: "Merakit mikrokontroler, modul relay, layar LCD, serta programming logika otomatisasi." },
    { title: "Pengujian Sistem di Tandon", desc: "Uji coba ketahanan alat dan keterbacaan data pada air nutrisi hidroponik." },
    { title: "Pengemasan & Pemasaran", desc: "Membungkus unit alat agar rapi dan siap dipasarkan." }
  ],
  valuePropositions: [
    { title: "Kontrol Otomatis Nutrisi & Air", desc: "Pengisian nutrisi (PPM) dan penyesuaian pH air secara otomatis tanpa perlu kuras/racik manual." },
    { title: "Monitoring Kualitas Air Real-Time", desc: "Pemantauan suhu air, kepekaan nutrisi, dan pH langsung dari smartphone via aplikasi." },
    { title: "Mencegah Tanaman Layu", desc: "Notifikasi otomatis jika level air di tandon habis atau pompa mengalami gangguan." },
    { title: "Hemat Waktu & Presisi", desc: "Hasil panen hidroponik lebih optimal, seragam, dan efisien dalam penggunaan nutrisi." }
  ],
  customerRelationships: [
    { title: "Layanan Purna Jual & Garansi", desc: "Garansi penggantian sensor/komponen jika ada kerusakan pabrik." },
    { title: "Panduan & Dukungan Teknis", desc: "Video tutorial perakitan, kalibrasi sensor pH/TDS, dan grup konsultasi WhatsApp." },
    { title: "Update Fitur Aplikasi", desc: "Pembaruan sistem aplikasi/dashboard IoT secara berkala." }
  ],
  customerSegments: [
    { title: "Petani Hidroponik Komersial", desc: "Pemilik kebun hidroponik skala menengah/besar yang ingin otomasi sistem." },
    { title: "Pegiat Urban Farming Rumahan", desc: "Masyarakat perkotaan yang hobi menanam hidroponik di rumah tapi sibuk kerja." },
    { title: "Sekolah & Edukasi", desc: "SMK/SMA dan kampus yang butuh modul praktik IoT berbasis pertanian presisi." }
  ],
  keyResources: [
    { title: "Komponen IoT Hardware", desc: "Mikrokontroler (ESP32/ESP8266), sensor TDS (nutrisi), sensor pH, sensor suhu air (DS18B20), relay, dan pompa mini." },
    { title: "Software & Server Cloud", desc: "Arduino IDE, Web Dashboard IoT, MQTT WebSockets broker, & server cloud." },
    { title: "Keahlian Tim PKKWU", desc: "Pemrograman C++, perakitan/solder elektronika, serta pemahaman dasar nutrisi hidroponik (AB Mix)." }
  ],
  channels: [
    { title: "E-Commerce", desc: "Penjualan kit alat IoT hidroponik di Tokopedia dan Shopee." },
    { title: "Demo Video & Medsos", desc: "Konten pengujian dan cara kerja alat di Instagram, TikTok, dan YouTube." },
    { title: "Pameran PKKWU / Expo", desc: "Memajang prototipe alat yang berfungsi langsung pada bazar sekolah/pameran teknologi." }
  ],
  costStructure: [
    { title: "Biaya Bahan Baku (BOM)", desc: "Pembelian ESP32, sensor TDS, sensor pH, relay, kabel, PCB, dan casing waterproof." },
    { title: "Biaya Operasional Konsumsi", desc: "Listrik, kuota internet/server, dan bahan habis pakai (timah solder, cairan kalibrasi pH)." },
    { title: "Biaya Pemasaran & Kemasan", desc: "Cetak dus/box produk, stiker logo, dan promosi media sosial." }
  ],
  revenueStreams: [
    { title: "Penjualan Unit Alat Smart Hydroponic", desc: "Pendapatan utama dari penjualan paket alat kontrol & monitoring hidroponik." },
    { title: "Jasa Kalibrasi & Pemasangan", desc: "Biaya setting alat langsung di lokasi kebun atau kalibrasi ulang sensor berkala." },
    { title: "Penjualan Sparepart / Modul Tambahan", desc: "Penjualan sensor cadangan atau modul tambahan (add-on)." }
  ]
};

// --------------------------------------------------------------------------
// PRODUCT CATALOG ITEMS (Revenue Streams & Channels)
// --------------------------------------------------------------------------
const CATALOG_ITEMS = [
  {
    id: "kit-starter",
    title: "Paket Starter Kit Urban Farming IoT",
    tag: "Terlaris",
    price: "Rp 650.000",
    segment: "Urban Farming Rumahan",
    features: [
      "Unit ESP32 Controller + Box Waterproof",
      "Sensor pH Industrial + Sensor TDS Nutrisi",
      "2x Mini Dosing Pump (pH & AB Mix)",
      "Akses Dashboard Web & Notifikasi WA"
    ],
    image: "🌱"
  },
  {
    id: "kit-komersial",
    title: "Paket Pro Komersial Multi-Tandon",
    tag: "Komersial",
    price: "Rp 1.850.000",
    segment: "Petani Komersial Skala Besar",
    features: [
      "ESP32 Dual-Core Heavy Duty Enclosure",
      "Sensor pH High-Accuracy Glass Probe",
      "4x High Flow Dosing Pumps (AB Mix + pH Up/Down)",
      "Sensor Suhu Air DS18B20 Stainless Steel",
      "Integrasi MQTT WebSockets Real-time Dashboard"
    ],
    image: "🏭"
  },
  {
    id: "modul-edukasi",
    title: "Paket Modul Praktik Edukasi IoT",
    tag: "Sekolah & Kampus",
    price: "Rp 450.000",
    segment: "Sekolah SMK/SMA & Kampus",
    features: [
      "Board Trainer ESP32 & Modul Sensor Modular",
      "Buku Panduan Praktik & Source Code Arduino C++",
      "Modul Relay 4 Channel + Motor Pompa DC",
      "Pelatihan & Workshop Online via Zoom"
    ],
    image: "🎓"
  },
  {
    id: "service-kalibrasi",
    title: "Jasa Kalibrasi & Installation On-Site",
    tag: "Layanan",
    price: "Rp 150.000",
    segment: "Kebun Hidroponik",
    features: [
      "Pengecekan Akurasi Sensor pH & TDS",
      "Pembersihan Probe & Re-Kalibrasi Cairan Buffer",
      "Setting Ambang Batas Otomasi Kebun"
    ],
    image: "🛠️"
  }
];

class HydroConfigManager {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    const saved = localStorage.getItem('hydro_dash_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved config, using defaults:', e);
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('hydro_dash_config', JSON.stringify(this.config));
  }

  resetDefaults() {
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    localStorage.removeItem('hydro_dash_config');
    return this.config;
  }
}

window.hydroConfig = new HydroConfigManager();
window.BMC_DATA = BMC_DATA;
window.CATALOG_ITEMS = CATALOG_ITEMS;
