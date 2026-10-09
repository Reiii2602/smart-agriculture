/**
 * IoT Hydroponics Historical Charts & Data Export
 * Powered by Chart.js with Theme Support
 */

class HydroChartsManager {
  constructor() {
    this.nutrientChart = null;
    this.envChart = null;

    this.maxDataPoints = 30; // Max points visible on live graph
    this.historyData = [];   // Recorded array for CSV export
  }

  init() {
    const ctxNutrient = document.getElementById('nutrientChart');
    const ctxEnv = document.getElementById('envChart');

    if (!ctxNutrient || !ctxEnv) return;

    const currentTheme = window.hydroConfig.config.theme || 'dark';
    const isLight = currentTheme === 'light';
    const textColor = isLight ? '#4b5563' : '#8b9b90';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';

    // Common Chart Defaults
    Chart.defaults.color = textColor;
    Chart.defaults.font.family = "'Outfit', sans-serif";

    // 1. Nutrient & pH Balance Chart
    this.nutrientChart = new Chart(ctxNutrient, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'pH Level',
            data: [],
            borderColor: isLight ? '#059669' : '#00ff88',
            backgroundColor: isLight ? 'rgba(5, 150, 105, 0.1)' : 'rgba(0, 255, 136, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            yAxisID: 'yPh',
            fill: true,
            pointRadius: 3
          },
          {
            label: 'Nutrisi PPM',
            data: [],
            borderColor: isLight ? '#0284c7' : '#00e5ff',
            backgroundColor: isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(0, 229, 255, 0.05)',
            borderWidth: 2,
            tension: 0.3,
            yAxisID: 'yPpm',
            fill: true,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8, color: textColor } },
          tooltip: {
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(12, 22, 17, 0.95)',
            titleColor: isLight ? '#064e3b' : '#f0fdf4',
            bodyColor: textColor,
            borderColor: isLight ? 'rgba(5, 150, 105, 0.3)' : 'rgba(0, 255, 136, 0.3)',
            borderWidth: 1
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          yPh: {
            type: 'linear',
            display: true,
            position: 'left',
            min: 4.5,
            max: 8.5,
            ticks: { color: textColor },
            title: { display: true, text: 'pH', color: isLight ? '#059669' : '#00ff88' },
            grid: { color: gridColor }
          },
          yPpm: {
            type: 'linear',
            display: true,
            position: 'right',
            min: 400,
            max: 1800,
            ticks: { color: textColor },
            title: { display: true, text: 'PPM (TDS)', color: isLight ? '#0284c7' : '#00e5ff' },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });

    // 2. Temperature & Environment Chart
    this.envChart = new Chart(ctxEnv, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Suhu Air (°C)',
            data: [],
            borderColor: isLight ? '#d97706' : '#ffb703',
            backgroundColor: isLight ? 'rgba(217, 119, 6, 0.1)' : 'rgba(255, 183, 3, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 3
          },
          {
            label: 'Suhu Udara (°C)',
            data: [],
            borderColor: '#a855f7',
            borderWidth: 2,
            tension: 0.3,
            borderDash: [4, 4],
            pointRadius: 2
          },
          {
            label: 'Kelembaban (%)',
            data: [],
            borderColor: isLight ? '#0284c7' : '#00e5ff',
            borderWidth: 1.5,
            tension: 0.3,
            borderDash: [2, 2],
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8, color: textColor } }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor }, min: 10, max: 100 }
        }
      }
    });
  }

  updateThemeColors(theme) {
    const isLight = theme === 'light';
    const textColor = isLight ? '#4b5563' : '#8b9b90';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';

    if (this.nutrientChart) {
      this.nutrientChart.options.plugins.legend.labels.color = textColor;
      this.nutrientChart.options.scales.x.grid.color = gridColor;
      this.nutrientChart.options.scales.x.ticks.color = textColor;
      this.nutrientChart.options.scales.yPh.grid.color = gridColor;
      this.nutrientChart.options.scales.yPh.ticks.color = textColor;
      this.nutrientChart.options.scales.yPpm.ticks.color = textColor;
      this.nutrientChart.update();
    }

    if (this.envChart) {
      this.envChart.options.plugins.legend.labels.color = textColor;
      this.envChart.options.scales.x.grid.color = gridColor;
      this.envChart.options.scales.x.ticks.color = textColor;
      this.envChart.options.scales.y.grid.color = gridColor;
      this.envChart.options.scales.y.ticks.color = textColor;
      this.envChart.update();
    }
  }

  addDataPoint(data) {
    if (!this.nutrientChart || !this.envChart) return;

    const timeLabel = data.timestamp || new Date().toLocaleTimeString();

    // Store in history
    this.historyData.push({
      timestamp: new Date().toISOString(),
      timeLabel: timeLabel,
      ph: data.ph,
      ppm: data.ppm,
      ec: data.ec,
      waterTemp: data.waterTemp,
      waterLevel: data.waterLevel,
      airTemp: data.airTemp,
      humidity: data.humidity,
      lightLux: data.lightLux
    });

    if (this.historyData.length > 500) {
      this.historyData.shift();
    }

    // Update Nutrient Chart
    const nLabels = this.nutrientChart.data.labels;
    nLabels.push(timeLabel);
    this.nutrientChart.data.datasets[0].data.push(data.ph);
    this.nutrientChart.data.datasets[1].data.push(data.ppm);

    if (nLabels.length > this.maxDataPoints) {
      nLabels.shift();
      this.nutrientChart.data.datasets[0].data.shift();
      this.nutrientChart.data.datasets[1].data.shift();
    }
    this.nutrientChart.update('quiet');

    // Update Environment Chart
    const eLabels = this.envChart.data.labels;
    eLabels.push(timeLabel);
    this.envChart.data.datasets[0].data.push(data.waterTemp);
    this.envChart.data.datasets[1].data.push(data.airTemp);
    this.envChart.data.datasets[2].data.push(data.humidity);

    if (eLabels.length > this.maxDataPoints) {
      eLabels.shift();
      this.envChart.data.datasets[0].data.shift();
      this.envChart.data.datasets[1].data.shift();
      this.envChart.data.datasets[2].data.shift();
    }
    this.envChart.update('quiet');
  }

  exportCSV() {
    if (this.historyData.length === 0) {
      alert('Belum ada data sensor yang terekam!');
      return;
    }

    const headers = ['Timestamp', 'Jam', 'pH', 'PPM (TDS)', 'EC (mS/cm)', 'Suhu Air (C)', 'Tangki (%)', 'Suhu Udara (C)', 'Kelembaban (%)', 'Cahaya (Lux)'];
    const rows = this.historyData.map(d => [
      d.timestamp,
      d.timeLabel,
      d.ph,
      d.ppm,
      d.ec,
      d.waterTemp,
      d.waterLevel,
      d.airTemp,
      d.humidity,
      d.lightLux
    ]);

    let csvContent = 'data:text/csv;charset=utf-8,' 
      + headers.join(',') + '\n' 
      + rows.map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hydroponics_data_log_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

window.HydroChartsManager = HydroChartsManager;
