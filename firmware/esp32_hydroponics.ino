/*
 =========================================================================================
 FIRMWARE ESP32 HIDROPONIK AUTOMATION & MONITORING (MQTT READY)
 Project: Tugas IoT X PKKWU Hidroponik
 
 Library Dependencies (Install via Arduino Library Manager):
  - PubSubClient (by Nick O'Leary)
  - ArduinoJson (by Benoit Blanchon - version 6.x)
  - DHT sensor library (by Adafruit)
  - OneWire & DallasTemperature (for DS18B20 Water Temp)
 =========================================================================================
*/

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ==========================================
// 1. CONFIGURATION (WOKWI & HARDWARE READY)
// ==========================================
const char* WIFI_SSID = "Wokwi-GUEST"; // Default WiFi untuk simulator Wokwi
const char* WIFI_PASS = "";            // Wokwi-GUEST tanpa password

// MQTT Broker Settings (Sama dengan di Web Dashboard Settings)
const char* MQTT_BROKER   = "broker.hivemq.com";
const int   MQTT_PORT     = 1883; // Standard MQTT Port for ESP32 (Web Dashboard uses 8000 WebSockets)
const char* TOPIC_SENSORS  = "hydroponics/sensors";
const char* TOPIC_CONTROLS = "hydroponics/controls";

// Pin Definitions
#define DHTPIN 16
#define DHTTYPE DHT22
#define ONE_WIRE_BUS 4 // DS18B20 Water Temp Pin
#define PH_PIN 36      // Analog VP
#define TDS_PIN 39     // Analog VN

// Relay Actuator Pins
#define RELAY_MAIN_PUMP 23
#define RELAY_PH_UP     19
#define RELAY_PH_DOWN   21
#define RELAY_NUTRI_A   22
#define RELAY_NUTRI_B   25
#define RELAY_GROW_LIGHT 26
#define RELAY_AERATOR   27

// ==========================================
// 2. GLOBAL OBJECTS
// ==========================================
WiFiClient espClient;
PubSubClient mqttClient(espClient);
DHT dht(DHTPIN, DHTTYPE);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);

unsigned long lastSensorPublish = 0;
const long publishInterval = 10000; // Kirim data tiap 10 detik

// ==========================================
// 3. MQTT CALLBACK & RELAY CONTROL
// ==========================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("Pesan MQTT Diterima [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);
  if (error) {
    Serial.println("Gagal parse JSON kontrol");
    return;
  }

  const char* actuator = doc["actuator"];
  bool state = doc["state"];
  int relayState = state ? HIGH : LOW; // HIGH = ON (Lampu LED Menyala), LOW = OFF

  if (String(actuator) == "mainPump") digitalWrite(RELAY_MAIN_PUMP, relayState);
  else if (String(actuator) == "phUpPump" || String(actuator) == "dose_phUp") digitalWrite(RELAY_PH_UP, relayState);
  else if (String(actuator) == "phDownPump" || String(actuator) == "dose_phDown") digitalWrite(RELAY_PH_DOWN, relayState);
  else if (String(actuator) == "nutrientPumpA" || String(actuator) == "dose_nutriA") digitalWrite(RELAY_NUTRI_A, relayState);
  else if (String(actuator) == "nutrientPumpB" || String(actuator) == "dose_nutriB") digitalWrite(RELAY_NUTRI_B, relayState);
  else if (String(actuator) == "growLight") digitalWrite(RELAY_GROW_LIGHT, relayState);
  else if (String(actuator) == "aerator") digitalWrite(RELAY_AERATOR, relayState);
}

// ==========================================
// 4. SETUP FUNCTION
// ==========================================
void setup() {
  Serial.begin(115200);
  
  // Setup Pins (Default LOW = Mati)
  pinMode(RELAY_MAIN_PUMP, OUTPUT); digitalWrite(RELAY_MAIN_PUMP, LOW);
  pinMode(RELAY_PH_UP, OUTPUT);     digitalWrite(RELAY_PH_UP, LOW);
  pinMode(RELAY_PH_DOWN, OUTPUT);   digitalWrite(RELAY_PH_DOWN, LOW);
  pinMode(RELAY_NUTRI_A, OUTPUT);   digitalWrite(RELAY_NUTRI_A, LOW);
  pinMode(RELAY_NUTRI_B, OUTPUT);   digitalWrite(RELAY_NUTRI_B, LOW);
  pinMode(RELAY_GROW_LIGHT, OUTPUT);digitalWrite(RELAY_GROW_LIGHT, LOW);
  pinMode(RELAY_AERATOR, OUTPUT);   digitalWrite(RELAY_AERATOR, LOW);

  dht.begin();
  tempSensor.begin();

  // Connect WiFi
  Serial.print("Menghubungkan ke WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Terhubung! IP Address: " + WiFi.localIP().toString());

  // Setup MQTT
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    String clientId = "ESP32HydroDevice-" + String(random(0xffff), HEX);
    Serial.print("Mencoba konek ke MQTT Broker... ");
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("Terhubung!");
      mqttClient.subscribe(TOPIC_CONTROLS);
    } else {
      Serial.print("Gagal, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" Coba lagi dalam 5 detik...");
      delay(5000);
    }
  }
}

// ==========================================
// 5. SENSOR READERS & MAIN LOOP
// ==========================================
float readPH() {
  int raw = analogRead(PH_PIN);
  float voltage = raw * (3.3 / 4095.0);
  float ph = 3.5 * voltage + 0.5; // Calibration formula
  return constrain(ph, 4.0, 9.0);
}

float readPPM() {
  int raw = analogRead(TDS_PIN);
  float voltage = raw * (3.3 / 4095.0);
  float tds = (133.42 * voltage * voltage * voltage - 255.86 * voltage * voltage + 857.39 * voltage) * 0.5;
  return constrain(tds, 100, 2000);
}

void loop() {
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  unsigned long now = millis();
  if (now - lastSensorPublish > publishInterval) {
    lastSensorPublish = now;

    // Read Sensors
    tempSensor.requestTemperatures();
    float waterTemp = tempSensor.getTempCByIndex(0);
    if (waterTemp < -50) waterTemp = 23.5; // fallback

    float ph = readPH();
    float ppm = readPPM();
    float airTemp = dht.readTemperature();
    float humidity = dht.readHumidity();
    if (isnan(airTemp)) airTemp = 27.0;
    if (isnan(humidity)) humidity = 65.0;

    int waterLevel = random(75, 85); // Replace with Ultrasonic HC-SR04 reading
    int lightLux = random(15000, 22000);

    // Build JSON Payload
    StaticJsonDocument<300> doc;
    doc["ph"] = ph;
    doc["ppm"] = ppm;
    doc["ec"] = ppm / 500.0;
    doc["waterTemp"] = waterTemp;
    doc["waterLevel"] = waterLevel;
    doc["waterLiters"] = (waterLevel / 100.0) * 50.0;
    doc["airTemp"] = airTemp;
    doc["humidity"] = humidity;
    doc["lightLux"] = lightLux;

    char jsonBuffer[300];
    serializeJson(doc, jsonBuffer);

    Serial.print("Publish Sensor Payload: ");
    Serial.println(jsonBuffer);
    mqttClient.publish(TOPIC_SENSORS, jsonBuffer);
  }
}
