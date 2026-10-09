/**
 * IoT Hydroponics User Interface Controller
 * Updates DOM, animations, modal dialogs, BMC view, catalog, & tab navigation
 */

class HydroUI {
  constructor() {
    this.toastContainer = document.getElementById('toast-container');
    this.lastAlertTime = 0;
  }

  initTabNavigation() {
    const tabBtns = document.querySelectorAll('.nav-tab-btn');
    const tabContents = document.querySelectorAll('.tab-view-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        e.currentTarget.classList.add('active');
        const targetContent = document.getElementById(`tab-${targetTab}`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });

    // Render BMC Cards
    this.renderBMC();
    // Render Catalog Items
    this.renderCatalog();
    // Render Calibration Display
    this.updateCalibrationDisplay();
  }

  renderBMC() {
    const bmc = window.BMC_DATA;
    if (!bmc) return;

    const renderList = (elementId, items) => {
      const container = document.getElementById(elementId);
      if (!container || !items) return;
      container.innerHTML = items.map(item => `
        <div class="bmc-item">
          <div class="bmc-item-title">• ${item.title}</div>
          <div class="bmc-item-desc">${item.desc}</div>
        </div>
      `).join('');
    };

    renderList('bmc-kp', bmc.keyPartners);
    renderList('bmc-ka', bmc.keyActivities);
    renderList('bmc-vp', bmc.valuePropositions);
    renderList('bmc-cr', bmc.customerRelationships);
    renderList('bmc-cs', bmc.customerSegments);
    renderList('bmc-kr', bmc.keyResources);
    renderList('bmc-ch', bmc.channels);
    renderList('bmc-cost', bmc.costStructure);
    renderList('bmc-revenue', bmc.revenueStreams);
  }

  renderCatalog() {
    const container = document.getElementById('catalog-container');
    const items = window.CATALOG_ITEMS;
    if (!container || !items) return;

    container.innerHTML = items.map(item => `
      <div class="catalog-card">
        <div>
          <div class="catalog-header">
            <span class="catalog-icon">${item.image}</span>
            <span class="catalog-tag">${item.tag}</span>
          </div>
          <div class="catalog-title">${item.title}</div>
          <div class="catalog-segment">Segmen Target: ${item.segment}</div>
          <div class="catalog-price">${item.price}</div>
          <ul class="catalog-features">
            ${item.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
        <button class="btn-primary btn-order-item" data-title="${item.title}">Pesan Unit / Hubungi Sales</button>
      </div>
    `).join('');

    // Add Order Button Click Handler
    const orderBtns = container.querySelectorAll('.btn-order-item');
    orderBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = e.currentTarget.getAttribute('data-title');
        const text = encodeURIComponent(`Halo Tim HidroSmart, saya berminat memesan ${title}. Mohon informasi ketersediaan dan prosedur pengirimannya.`);
        window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
      });
    });
  }

  updateCalibrationDisplay() {
    const calib = window.hydroCalibration.calibData;
    const formulaPh = document.getElementById('calib-formula-ph');
    const formulaTds = document.getElementById('calib-formula-tds');

    if (formulaPh) {
      formulaPh.textContent = `pH = ${calib.ph.slope} * V + ${calib.ph.intercept}`;
    }
    if (formulaTds) {
      formulaTds.textContent = `Factor = ${calib.tds.factor} (PPM = Voltage * ${Math.round(calib.tds.targetPpm / calib.tds.rawVoltage)})`;
    }
  }

  updateSensors(data) {
    const limits = window.hydroConfig.config.thresholds;

    // 1. pH Level Update
    const valPh = document.getElementById('val-ph');
    const phRange = document.getElementById('range-ph');
    const phPointer = document.getElementById('ph-pointer');

    if (valPh) valPh.textContent = Number(data.ph).toFixed(2);

    if (phPointer) {
      const pct = Math.max(0, Math.min(100, ((data.ph - 4.0) / (9.0 - 4.0)) * 100));
      phPointer.style.left = `${pct}%`;
    }

    if (phRange) {
      if (data.ph >= limits.ph.min && data.ph <= limits.ph.max) {
        phRange.textContent = 'Optimal (5.5 - 6.5)';
        phRange.className = 'sensor-range-badge range-optimal';
      } else if (data.ph > 0 && (data.ph < limits.ph.warningMin || data.ph > limits.ph.warningMax)) {
        phRange.textContent = 'Bahaya! Imbangkan pH';
        phRange.className = 'sensor-range-badge range-danger';
        this.triggerAlert(`Nilai pH kritis: ${data.ph}`, 'danger');
      } else if (data.ph === 0) {
        phRange.textContent = 'Offline';
        phRange.className = 'sensor-range-badge range-warning';
      } else {
        phRange.textContent = 'Peringatan pH';
        phRange.className = 'sensor-range-badge range-warning';
      }
    }

    // 2. PPM / TDS Update
    const valPpm = document.getElementById('val-ppm');
    const valEc = document.getElementById('val-ec');
    const ppmRange = document.getElementById('range-ppm');

    if (valPpm) valPpm.textContent = Math.round(data.ppm);
    if (valEc) valEc.textContent = data.ec || (data.ppm / 500).toFixed(2);

    if (ppmRange) {
      if (data.ppm >= limits.ppm.min && data.ppm <= limits.ppm.max) {
        ppmRange.textContent = 'Nutrisi Ideal';
        ppmRange.className = 'sensor-range-badge range-optimal';
      } else if (data.ppm > 0 && data.ppm < limits.ppm.min) {
        ppmRange.textContent = 'Kurang Nutrisi';
        ppmRange.className = 'sensor-range-badge range-warning';
      } else if (data.ppm === 0) {
        ppmRange.textContent = 'Offline';
        ppmRange.className = 'sensor-range-badge range-warning';
      } else {
        ppmRange.textContent = 'PPM Tinggi!';
        ppmRange.className = 'sensor-range-badge range-danger';
        this.triggerAlert(`Kadar PPM Nutrisi Tinggi: ${data.ppm}`, 'warning');
      }
    }

    // 3. Water Temperature Update
    const valWaterTemp = document.getElementById('val-water-temp');
    const tempRange = document.getElementById('range-water-temp');

    if (valWaterTemp) valWaterTemp.textContent = Number(data.waterTemp).toFixed(1);

    if (tempRange) {
      if (data.waterTemp >= limits.waterTemp.min && data.waterTemp <= limits.waterTemp.max) {
        tempRange.textContent = 'Suhu Sejuk Ideal';
        tempRange.className = 'sensor-range-badge range-optimal';
      } else if (data.waterTemp === 0) {
        tempRange.textContent = 'Offline';
        tempRange.className = 'sensor-range-badge range-warning';
      } else {
        tempRange.textContent = 'Suhu Hangat';
        tempRange.className = 'sensor-range-badge range-warning';
      }
    }

    // 4. Water Tank Level Update (SVG Wave Animation)
    const valWaterLevel = document.getElementById('val-water-level');
    const valWaterLiters = document.getElementById('val-water-liters');
    const tankLiquid = document.getElementById('tank-liquid');

    if (valWaterLevel) valWaterLevel.textContent = Math.round(data.waterLevel);
    if (valWaterLiters) valWaterLiters.textContent = Number(data.waterLiters || (data.waterLevel * 0.5)).toFixed(1);

    if (tankLiquid) {
      tankLiquid.style.height = `${Math.max(5, Math.min(100, data.waterLevel))}%`;
    }

    if (data.waterLevel > 0 && data.waterLevel < limits.waterLevel.warningMin) {
      this.triggerAlert(`Air Tangki Tinggal ${Math.round(data.waterLevel)}%! Segera Isi Ulang.`, 'danger');
    }

    // 5. Environment Sensors (Air Temp, Humidity, Light Lux)
    const valAirTemp = document.getElementById('val-air-temp');
    const valHumidity = document.getElementById('val-humidity');
    const valLight = document.getElementById('val-light');

    if (valAirTemp) valAirTemp.textContent = Number(data.airTemp).toFixed(1);
    if (valHumidity) valHumidity.textContent = Math.round(data.humidity);
    if (valLight) valLight.textContent = Number(data.lightLux).toLocaleString();
  }

  updateConnectionStatus(status, text) {
    const badge = document.getElementById('status-badge');
    const textEl = document.getElementById('status-text');

    if (badge) {
      badge.className = `status-badge ${status}-mode`;
    }
    if (textEl) {
      textEl.textContent = text;
    }
  }

  showToast(message, type = 'info') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    if (type === 'danger') {
      iconSvg = `<svg width="20" height="20" fill="none" stroke="#ff3b5c" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  triggerAlert(msg, type = 'warning') {
    const now = Date.now();
    if (now - this.lastAlertTime > 15000) {
      this.showToast(msg, type);
      this.lastAlertTime = now;
    }
  }
}

window.HydroUI = HydroUI;
