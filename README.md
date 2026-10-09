# 🌿 HIDRO-SMART IoT Dashboard (Ready-to-Use)

Dashboard IoT Hidroponik modern dengan tema **Dark Glassmorphism Emerald & Mint Cyberpunk**. Dirancang **Siap Pakai** (out-of-the-box) baik untuk pengujian simulasi tanpa alat maupun saat hardware ESP32/ESP8266 sudah dirakit ("tinggal edit dikit").

---

## 🚀 Cara Menjalankan Dashboard

1. **Jalankan via Local Web Server / Browser**:
   - Buka file `index.html` langsung di browser favorit Anda (Chrome/Edge/Firefox).
   - Atau jalankan web server sederhana melalui terminal:
     ```bash
     npx serve .
     # atau
     python -m http.server 8000
     ```
2. **Mode Default (Demo / Simulasi)**:
   - Begitu dibuka, dashboard akan langsung berjalan dalam **Demo Mode** dengan data sensor real-time (pH, PPM/TDS, Suhu Air, Tangki Air, Suhu Udara, Kelembaban, Intensitas Cahaya) yang bergerak dinamis.

---

## ⚡ Menghubungkan ke Alat Physical (ESP32) — "Tinggal Edit Dikit"

Ketika alat/hardware sudah selesai dibuat:
1. **Atur Koneksi via UI Dashboard**:
   - Klik tombol **Pengaturan IoT** (ikon roda gigi) di pojok kanan atas Dashboard.
   - Ubah Mode dari `Simulasi` ke `Hardware Mode`.
   - Masukkan **Broker MQTT** (misal: `broker.hivemq.com` atau `broker.emqx.io`), **Port WebSockets** (`8000`), dan Topik MQTT.
   - Klik **Simpan Pengaturan & Reconnect**.

2. **Flash Firmware ESP32**:
   - Buka file [esp32_hydroponics.ino](file:///d:/Iot/TUGAS%20IOT%20X%20PKKWU%20HIDROPONIK/firmware/esp32_hydroponics.ino) yang berada di folder `firmware/`.
   - Edit baris WiFi pada kode ESP32:
     ```cpp
     const char* WIFI_SSID = "NAMA_WIFI_ANDA";
     const char* WIFI_PASS = "PASSWORD_WIFI_ANDA";
     ```
   - Upload ke board ESP32 Anda melalui **Arduino IDE**.

---

## 🔌 Skema Pin Out ESP32 & Modul Sensor/Relay

| Sensor / Aktuator | Pin ESP32 | Keterangan |
| :--- | :--- | :--- |
| **Sensor pH** | Pin `36` (VP) | Analog Input |
| **Sensor TDS / PPM** | Pin `39` (VN) | Analog Input |
| **DS18B20 Suhu Air** | Pin `4` | OneWire Data |
| **DHT22 Suhu/Udara** | Pin `16` | Digital Data |
| **Pompa Utama (NFT)** | Pin `23` | Modul Relay Channel 1 |
| **Pompa Dosing pH Up** | Pin `19` | Modul Relay Channel 2 |
| **Pompa Dosing pH Down** | Pin `21` | Modul Relay Channel 3 |
| **Pompa Nutrisi A** | Pin `22` | Modul Relay Channel 4 |
| **Pompa Nutrisi B** | Pin `25` | Modul Relay Channel 5 |
| **Grow Light LED** | Pin `26` | Modul Relay Channel 6 |
| **Aerator O2** | Pin `27` | Modul Relay Channel 7 |

---

## 📊 Fitur-Fitur Utama

- 🟢 **Gauges & Metering Real-time**: Indikator pH dengan spektrum warna (Asam/Ideal/Basa), Nilai EC/PPM nutrisi, Suhu air, Suhu/Kelembaban udara, dan Cahaya Lux.
- 🌊 **Animasi Tangki Air Liquid SVG**: Menampilkan % volume tangki dan estimasi liter air.
- 🎛️ **Kontrol Relay Switch Interaktif**: Tombol ON/OFF & Pulse Dose (+10ml) untuk pompa nutrisi & pH.
- 📈 **Grafik Historis Multi-Axis**: Membandingkan tren pH vs PPM dan Suhu Air vs Suhu Udara secara real-time.
- 📥 **Export CSV**: Simpan riwayat telemetry sensor ke format `.csv` dengan 1-klik.
- 🔔 **Sistem Notifikasi Warning Toast**: Menampilkan alert otomatis jika kadar pH/PPM/Suhu melewati batas aman.
- 📄 **Firmware Viewer**: Fitur untuk melihat & menyalin kode Arduino C++ langsung dari Dashboard.
