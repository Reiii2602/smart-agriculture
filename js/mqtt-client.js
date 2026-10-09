/**
 * IoT Hydroponics MQTT WebSockets Client Handler
 * Connects to physical hardware (ESP32/ESP8266) via MQTT WebSockets
 */

class HydroMQTTClient {
  constructor(onDataCallback, onStatusCallback) {
    this.onDataCallback = onDataCallback;
    this.onStatusCallback = onStatusCallback;
    this.client = null;
    this.isConnected = false;
  }

  connect(mqttConfig) {
    if (this.client) {
      try { this.client.disconnect(); } catch(e) {}
    }

    const { broker, port, path, clientId, topicSensors } = mqttConfig;

    console.log(`Connecting to MQTT Broker: ws://${broker}:${port}${path} as ${clientId}`);
    if (typeof this.onStatusCallback === 'function') {
      this.onStatusCallback('connecting', 'Menghubungkan ke Broker MQTT...');
    }

    try {
      // Paho MQTT Client initialization
      this.client = new Paho.MQTT.Client(broker, Number(port), path || '/mqtt', clientId);

      this.client.onConnectionLost = (responseObject) => {
        this.isConnected = false;
        console.warn('MQTT Connection Lost:', responseObject.errorMessage);
        if (typeof this.onStatusCallback === 'function') {
          this.onStatusCallback('offline', 'Terputus dari Broker MQTT');
        }
      };

      this.client.onMessageArrived = (message) => {
        try {
          const payload = JSON.parse(message.payloadString);
          console.log('MQTT Sensor Data Received:', payload);
          if (typeof this.onDataCallback === 'function') {
            this.onDataCallback(payload);
          }
        } catch (e) {
          console.error('Error parsing MQTT JSON payload:', e, message.payloadString);
        }
      };

      this.client.connect({
        onSuccess: () => {
          this.isConnected = true;
          console.log('MQTT Connected successfully!');
          this.client.subscribe(topicSensors);
          console.log(`Subscribed to topic: ${topicSensors}`);
          if (typeof this.onStatusCallback === 'function') {
            this.onStatusCallback('hardware', 'Terhubung ke ESP32 (Hardware Mode)');
          }
        },
        onFailure: (err) => {
          this.isConnected = false;
          console.error('MQTT Connection failed:', err);
          if (typeof this.onStatusCallback === 'function') {
            this.onStatusCallback('offline', 'Gagal konek MQTT: ' + (err.errorMessage || 'Broker Offline'));
          }
        },
        useSSL: port === 8084 || port === 443, // Auto switch SSL for secure websocket ports
        timeout: 8
      });

    } catch (e) {
      console.error('Failed to initialize Paho MQTT client:', e);
      if (typeof this.onStatusCallback === 'function') {
        this.onStatusCallback('offline', 'Error MQTT Library: ' + e.message);
      }
    }
  }

  disconnect() {
    if (this.client && this.isConnected) {
      try {
        this.client.disconnect();
      } catch (e) {}
      this.isConnected = false;
    }
  }

  publishControl(actuatorId, state, mode = 'manual') {
    if (!this.client || !this.isConnected) {
      console.warn('Cannot publish MQTT message: Client not connected');
      return false;
    }

    const topicControls = window.hydroConfig.config.mqtt.topicControls;
    const payload = JSON.stringify({
      actuator: actuatorId,
      state: state,
      mode: mode,
      timestamp: new Date().toISOString()
    });

    const message = new Paho.MQTT.Message(payload);
    message.destinationName = topicControls;
    this.client.send(message);
    console.log(`MQTT Control Published to ${topicControls}:`, payload);
    return true;
  }
}

window.HydroMQTTClient = HydroMQTTClient;
