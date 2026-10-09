/**
 * Firebase Realtime Database Integration
 * Project: smart-agriculture-52ef4
 */

const firebaseConfig = {
  apiKey: "AIzaSyANp3WHVl8AW0VYb0DPX2RIxJBekOkjlps",
  authDomain: "smart-agriculture-52ef4.firebaseapp.com",
  databaseURL: "https://smart-agriculture-52ef4-default-rtdb.firebaseio.com",
  projectId: "smart-agriculture-52ef4",
  storageBucket: "smart-agriculture-52ef4.firebasestorage.app",
  messagingSenderId: "391234748854",
  appId: "1:391234748854:web:f1117052d6ec067eaec117",
  measurementId: "G-7VHNWYK5HR"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully!');

  window.firebaseDb = firebase.database();

  let isSelfWriting = false;

  // Function to save live sensor data to Firebase Realtime Database
  window.saveSensorDataToFirebase = function(data) {
    if (!window.firebaseDb) return;

    const payload = {
      ph: parseFloat(Number(data.ph || 0).toFixed(2)),
      ppm: Math.round(Number(data.ppm || 0)),
      nutrisi: Math.round(Number(data.ppm || 0)), // Alias nutrisi (PPM)
      ec: parseFloat(Number(data.ec || (data.ppm / 500)).toFixed(2)),
      waterTemp: parseFloat(Number(data.waterTemp || 0).toFixed(1)),
      waterLevel: Number(data.waterLevel || 0),
      waterLiters: parseFloat(Number(data.waterLiters || 0).toFixed(1)),
      airTemp: parseFloat(Number(data.airTemp || 0).toFixed(1)),
      humidity: Number(data.humidity || 0),
      lightLux: Number(data.lightLux || data.light || 0),
      timestamp: new Date().toISOString()
    };

    isSelfWriting = true;
    window.firebaseDb.ref('hydroponics/sensors').set(payload).then(() => {
      setTimeout(() => { isSelfWriting = false; }, 500);
    });

    // Push to historical data node
    window.firebaseDb.ref('hydroponics/history').push().set(payload);
  };

  // Function to save actuator state to Firebase
  window.saveActuatorToFirebase = function(actuatorId, state) {
    if (!window.firebaseDb) return;
    window.firebaseDb.ref('hydroponics/controls/' + actuatorId).set({
      state: state,
      updatedAt: new Date().toISOString()
    });
  };

  // Listen for real-time sensor updates from Firebase (e.g. from ESP32 / Wokwi)
  window.firebaseDb.ref('hydroponics/sensors').on('value', (snapshot) => {
    let val = snapshot.val();

    // If Firebase database node is empty, initialize default baseline data
    if (!val) {
      val = {
        ph: 6.15,
        ppm: 1120,
        nutrisi: 1120,
        ec: 2.24,
        waterTemp: 23.3,
        waterLevel: 82,
        waterLiters: 41.0,
        airTemp: 26.8,
        humidity: 64,
        lightLux: 18400,
        timestamp: new Date().toISOString()
      };
      window.firebaseDb.ref('hydroponics/sensors').set(val);
    }

    window.latestFirebaseData = val;
    if (typeof window.handleFirebaseData === 'function') {
      console.log('Firebase Realtime Update received:', val);
      window.handleFirebaseData(val);
    }
  });
} else {
  console.warn('Firebase SDK not loaded.');
}
