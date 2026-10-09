/**
 * IoT Hydroponics Sensor Calibration Wizard (Key Activity #1)
 * 2-Point pH & TDS Calibration Logic
 */

class HydroCalibrationManager {
  constructor() {
    this.calibData = this.loadCalibration();
  }

  loadCalibration() {
    const saved = localStorage.getItem('hydro_dash_calibration');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      ph: {
        v4: 2.15,  // Voltage at pH 4.01
        v7: 1.65,  // Voltage at pH 6.86
        slope: -5.7,
        intercept: 16.26
      },
      tds: {
        rawVoltage: 1.45,
        targetPpm: 1000,
        factor: 0.5
      },
      lastCalibrated: new Date().toLocaleDateString('id-ID')
    };
  }

  saveCalibration(newCalib) {
    this.calibData = { ...this.calibData, ...newCalib, lastCalibrated: new Date().toLocaleDateString('id-ID') };
    localStorage.setItem('hydro_dash_calibration', JSON.stringify(this.calibData));
  }

  calculatePhSlopeIntercept(v4, v7) {
    // Standard buffer pH values
    const ph4 = 4.01;
    const ph7 = 6.86;

    if (v4 === v7) return null;

    const slope = (ph7 - ph4) / (v7 - v4);
    const intercept = ph7 - (slope * v7);

    return {
      v4: parseFloat(v4),
      v7: parseFloat(v7),
      slope: parseFloat(slope.toFixed(4)),
      intercept: parseFloat(intercept.toFixed(4))
    };
  }

  getCalibratedPH(rawVoltage) {
    const { slope, intercept } = this.calibData.ph;
    const ph = (slope * rawVoltage) + intercept;
    return Math.max(0, Math.min(14, parseFloat(ph.toFixed(2))));
  }
}

window.hydroCalibration = new HydroCalibrationManager();
