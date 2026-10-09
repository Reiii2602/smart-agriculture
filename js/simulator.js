/**
 * IoT Hydroponics Sensor Simulator
 * Generates realistic real-time readings when in Demo / Simulation Mode
 */

class HydroSensorSimulator {
  constructor(onDataCallback) {
    this.onDataCallback = onDataCallback;
    this.timer = null;
    this.intervalMs = 10000; // Emit data every 10 seconds

    // Baseline initial state
    this.state = {
      ph: 6.1,
      ppm: 1120,
      waterTemp: 22.5,
      waterLevel: 82, // percentage
      waterLiters: 41.0, // tank total e.g. 50L
      airTemp: 26.8,
      humidity: 64,
      lightLux: 18400,
      ec: 2.2, // mS/cm
      timestamp: new Date().toLocaleTimeString()
    };
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.generateTick(), this.intervalMs);
    this.generateTick(); // immediate first tick
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  generateTick() {
    // Small random walk fluctuations
    const phNoise = (Math.random() - 0.5) * 0.04;
    const ppmNoise = (Math.random() - 0.5) * 12;
    const tempNoise = (Math.random() - 0.5) * 0.1;
    const airTempNoise = (Math.random() - 0.5) * 0.15;
    const humidityNoise = (Math.random() - 0.5) * 0.5;
    const luxNoise = (Math.random() - 0.5) * 150;

    // Slowly decrease water level to simulate consumption/evaporation
    let levelNoise = 0;
    if (Math.random() > 0.8) {
      levelNoise = -0.1;
    }

    this.state.ph = Math.max(4.0, Math.min(8.5, parseFloat((this.state.ph + phNoise).toFixed(2))));
    this.state.ppm = Math.max(300, Math.min(2000, Math.round(this.state.ppm + ppmNoise)));
    this.state.ec = parseFloat((this.state.ppm / 500).toFixed(2)); // Standard PPM to EC 0.5 factor
    this.state.waterTemp = Math.max(10, Math.min(40, parseFloat((this.state.waterTemp + tempNoise).toFixed(1))));
    this.state.waterLevel = Math.max(5, Math.min(100, parseFloat((this.state.waterLevel + levelNoise).toFixed(1))));
    this.state.waterLiters = parseFloat(((this.state.waterLevel / 100) * 50).toFixed(1)); // 50 Liter capacity tank

    this.state.airTemp = Math.max(15, Math.min(45, parseFloat((this.state.airTemp + airTempNoise).toFixed(1))));
    this.state.humidity = Math.max(30, Math.min(95, Math.round(this.state.humidity + humidityNoise)));
    this.state.lightLux = Math.max(0, Math.min(50000, Math.round(this.state.lightLux + luxNoise)));
    this.state.timestamp = new Date().toLocaleTimeString();

    if (typeof this.onDataCallback === 'function') {
      this.onDataCallback(this.state);
    }
  }
}

window.HydroSensorSimulator = HydroSensorSimulator;
