/**
 * IoT Hydroponics Dashboard & BMC Web Portal Controller
 * Orchestrates Config, UI, Charts, Calibration Wizard, Simulator, & MQTT Client
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing IoT Hydroponics BMC Portal App...');

  // Initialize UI & Components
  const ui = new HydroUI();
  ui.initTabNavigation();

  const charts = new HydroChartsManager();
  charts.init();

  let simulator = null;
  let mqttClient = null;

  // -------------------------------------------------------------
  // Theme Toggle (Light / Dark Mode)
  // -------------------------------------------------------------
  const btnToggleTheme = document.getElementById('btn-toggle-theme');
  const iconSun = document.getElementById('theme-icon-sun');
  const iconMoon = document.getElementById('theme-icon-moon');

  const applyTheme = (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
    document.body.setAttribute('data-theme', themeName);
    
    if (themeName === 'light') {
      if (iconSun) iconSun.style.display = 'block';
      if (iconMoon) iconMoon.style.display = 'none';
    } else {
      if (iconSun) iconSun.style.display = 'none';
      if (iconMoon) iconMoon.style.display = 'block';
    }

    charts.updateThemeColors(themeName);
  };

  // Apply initial theme from config
  const initialTheme = window.hydroConfig.config.theme || 'dark';
  applyTheme(initialTheme);

  if (btnToggleTheme) {
    btnToggleTheme.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

      applyTheme(nextTheme);
      window.hydroConfig.saveConfig({ theme: nextTheme });
      localStorage.setItem('hydro-theme', nextTheme);
      ui.showToast(`Mode tampilan diubah ke ${nextTheme === 'light' ? 'Mode Terang (Light)' : 'Mode Gelap (Dark)'}`, 'info');
    });
  }

  // Global callback when sensor data is received
  const handleSensorData = (data, isFromFirebase = false) => {
    ui.updateSensors(data);
    charts.addDataPoint(data);

    // Auto-Balancer Check (Value Proposition #1)
    const isAutoBalancerOn = document.getElementById('toggle-auto-balancer')?.checked;
    if (isAutoBalancerOn) {
      if (data.ph > 6.6) {
        ui.showToast('[Auto-Balancer] pH Tinggi (6.6+). Memicu Dosing pH Down 10ml...', 'warning');
      } else if (data.ppm < 800) {
        ui.showToast('[Auto-Balancer] PPM Rendah (<800). Memicu Dosing Nutrisi AB Mix 10ml...', 'warning');
      }
    }
  };

  // Default initial sensors to 0 (Offline / Hardware Standby)
  const zeroSensorData = {
    ph: 0.0,
    ppm: 0,
    ec: 0.0,
    waterTemp: 0.0,
    waterLevel: 0,
    waterLiters: 0.0,
    airTemp: 0.0,
    humidity: 0,
    lightLux: 0,
    light: 0
  };

  handleSensorData(zeroSensorData);

  // Expose global callback for Firebase Realtime Database updates from Wokwi / ESP32
  window.handleFirebaseData = (data) => {
    ui.updateConnectionStatus('hardware', 'Firebase / Wokwi Live Data');
    handleSensorData(data, true);
  };

  // If initial Firebase snapshot was received before app.js finished loading
  if (window.latestFirebaseData) {
    window.handleFirebaseData(window.latestFirebaseData);
  }

  // Status callback from MQTT client
  const handleConnectionStatus = (status, text) => {
    ui.updateConnectionStatus(status, text);
  };

  mqttClient = new HydroMQTTClient(handleSensorData, handleConnectionStatus);

  const applyConnectionMode = () => {
    ui.updateConnectionStatus('simulation', 'Belum Ada Data Alat (Offline / Firebase Standby)');
  };

  applyConnectionMode();

  // -------------------------------------------------------------
  // Actuator Control Event Handlers
  // -------------------------------------------------------------
  const setupActuatorToggles = () => {
    const toggles = document.querySelectorAll('.actuator-toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const actuatorId = e.target.getAttribute('data-actuator');
        const state = e.target.checked;
        const actuatorItem = e.target.closest('.actuator-item');

        if (actuatorItem) {
          if (state) actuatorItem.classList.add('active');
          else actuatorItem.classList.remove('active');
        }

        if (window.hydroConfig.config.actuators[actuatorId]) {
          window.hydroConfig.config.actuators[actuatorId].state = state;
          window.hydroConfig.saveConfig(window.hydroConfig.config);
        }

        // Sync control change to Firebase Realtime Database
        if (typeof window.saveActuatorToFirebase === 'function') {
          window.saveActuatorToFirebase(actuatorId, state);
        }

        if (window.hydroConfig.config.connectionMode === 'hardware') {
          mqttClient.publishControl(actuatorId, state);
          ui.showToast(`MQTT Published: ${actuatorId} = ${state ? 'ON' : 'OFF'}`, 'info');
        } else {
          ui.showToast(`[Simulasi] ${actuatorId} diubah ke ${state ? 'ON' : 'OFF'}`, 'info');
        }
      });
    });

    const doseButtons = document.querySelectorAll('.btn-dose');
    doseButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const doseType = e.target.getAttribute('data-dose');
        ui.showToast(`Dosing ${doseType} 10ml Disemprotkan!`, 'info');

        if (window.hydroConfig.config.connectionMode === 'hardware') {
          mqttClient.publishControl(`dose_${doseType}`, true);
          setTimeout(() => mqttClient.publishControl(`dose_${doseType}`, false), 2000);
        }
      });
    });
  };

  setupActuatorToggles();

  // -------------------------------------------------------------
  // Sensor Calibration Form Handlers (Key Activity)
  // -------------------------------------------------------------
  const formCalibPh = document.getElementById('form-calib-ph');
  if (formCalibPh) {
    formCalibPh.addEventListener('submit', (e) => {
      e.preventDefault();
      const v4 = parseFloat(document.getElementById('input-v4').value);
      const v7 = parseFloat(document.getElementById('input-v7').value);

      const result = window.hydroCalibration.calculatePhSlopeIntercept(v4, v7);
      if (result) {
        window.hydroCalibration.saveCalibration({
          ph: { ...result }
        });
        ui.updateCalibrationDisplay();
        ui.showToast(`Kalibrasi pH Berhasil! Slope: ${result.slope}, Intercept: ${result.intercept}`, 'info');
      } else {
        ui.showToast('Gagal kalibrasi: Nilai Volt V4 & V7 tidak boleh sama!', 'danger');
      }
    });
  }

  const formCalibTds = document.getElementById('form-calib-tds');
  if (formCalibTds) {
    formCalibTds.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = parseFloat(document.getElementById('input-tds-v').value);
      const targetPpm = parseInt(document.getElementById('input-tds-target').value, 10);

      window.hydroCalibration.saveCalibration({
        tds: { rawVoltage: v, targetPpm: targetPpm, factor: parseFloat((targetPpm / (v * 1000)).toFixed(2)) }
      });
      ui.updateCalibrationDisplay();
      ui.showToast(`Kalibrasi TDS Berhasil Disimpan! Target: ${targetPpm} PPM`, 'info');
    });
  }

  // -------------------------------------------------------------
  // Modals & Export Handlers
  // -------------------------------------------------------------
  const settingsModal = document.getElementById('settings-modal');
  const codeModal = document.getElementById('code-modal');

  const btnOpenSettings = document.getElementById('btn-open-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const btnOpenCode = document.getElementById('btn-open-code');
  const btnCloseCode = document.getElementById('btn-close-code');

  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', () => {
      document.getElementById('input-mode').value = window.hydroConfig.config.connectionMode;
      document.getElementById('input-broker').value = window.hydroConfig.config.mqtt.broker;
      document.getElementById('input-port').value = window.hydroConfig.config.mqtt.port;
      document.getElementById('input-topic-sensors').value = window.hydroConfig.config.mqtt.topicSensors;
      document.getElementById('input-topic-controls').value = window.hydroConfig.config.mqtt.topicControls;
      settingsModal.classList.add('active');
    });
  }

  if (btnCloseSettings) btnCloseSettings.addEventListener('click', () => settingsModal.classList.remove('active'));
  if (btnOpenCode) btnOpenCode.addEventListener('click', () => codeModal.classList.add('active'));
  if (btnCloseCode) btnCloseCode.addEventListener('click', () => codeModal.classList.remove('active'));

  const formSettings = document.getElementById('form-settings');
  if (formSettings) {
    formSettings.addEventListener('submit', (e) => {
      e.preventDefault();

      const newMode = document.getElementById('input-mode').value;
      const newBroker = document.getElementById('input-broker').value;
      const newPort = parseInt(document.getElementById('input-port').value, 10);
      const newSensorsTopic = document.getElementById('input-topic-sensors').value;
      const newControlsTopic = document.getElementById('input-topic-controls').value;

      window.hydroConfig.saveConfig({
        connectionMode: newMode,
        mqtt: {
          ...window.hydroConfig.config.mqtt,
          broker: newBroker,
          port: newPort,
          topicSensors: newSensorsTopic,
          topicControls: newControlsTopic
        }
      });

      settingsModal.classList.remove('active');
      ui.showToast('Pengaturan berhasil disimpan!', 'info');
      applyConnectionMode();
    });
  }

  const btnExportCsv = document.getElementById('btn-export-csv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => charts.exportCSV());
  }

  const btnCopyCode = document.getElementById('btn-copy-code');
  if (btnCopyCode) {
    btnCopyCode.addEventListener('click', () => {
      const codeBlock = document.getElementById('esp32-code-block');
      if (codeBlock) {
        navigator.clipboard.writeText(codeBlock.textContent).then(() => {
          ui.showToast('Kode ESP32 C++ berhasil disalin!', 'info');
        });
      }
    });
  }
  // Splash / preview flow
  const splash = document.getElementById('splash-screen');
  const appContainer = document.querySelector('.app-container');
  const loaderFill = splash ? splash.querySelector('.splash-loader-fill') : null;

  const showDashboard = () => {
    if (appContainer) {
      appContainer.classList.add('is-ready');
    }
  };

  const startSplashSequence = () => {
    if (!splash || !loaderFill) {
      showDashboard();
      return;
    }

    let progress = 0;
    const totalDuration = 2200;
    const tickMs = 24;

    const ticker = setInterval(() => {
      progress = Math.min(progress + 100 / (totalDuration / tickMs), 100);
      loaderFill.style.width = `${progress}%`;
    }, tickMs);

    setTimeout(() => {
      clearInterval(ticker);
      loaderFill.style.width = '100%';
      splash.style.opacity = '0';

      setTimeout(() => {
        splash.remove();
        showDashboard();
      }, 400);
    }, totalDuration);
  };

  startSplashSequence();
});
