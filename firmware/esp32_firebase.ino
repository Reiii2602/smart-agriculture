/*
 =========================================================================================
 FIRMWARE ESP32 HIDROPONIK AUTOMATION & MONITORING (REAL SENSORS ONLY - NO RANDOM)
 Project: smart-agriculture-52ef4
 Database URL: https://smart-agriculture-52ef4-default-rtdb.firebaseio.com
 =========================================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ==========================================
// 1. CONFIGURATION (WOKWI & FIREBASE)
// ==========================================
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASS = "";
const char* FIREBASE_HOST = "https://smart-agriculture-52ef4-default-rtdb.firebaseio.com";

// Pin Definitions
#define DHTPIN 16        // DHT22 (Suhu Udara & Kelembaban)
#define DHTTYPE DHT22
#define PH_PIN 36        // Potensiometer 1 (Sensor pH)
#define TDS_PIN 39       // Potensiometer 2 (Sensor Nutrisi / TDS PPM)
#define LEVEL_PIN 34     // Potensiometer 3 (Sensor Level Air Tangki %)
#define LIGHT_PIN 35     // Potensiometer 4 (Sensor Cahaya Lux)

// Relay Actuator Pins
#define RELAY_MAIN_PUMP 23
#define RELAY_PH_UP     19
#define RELAY_PH_DOWN   21
#define RELAY_NUTRI_A   22
#define RELAY_NUTRI_B   25
#define RELAY_GROW_LIGHT 26
#define RELAY_AERATOR   27

// Global Objects
DHT dht(DHTPIN, DHTTYPE);

unsigned long lastSensorSend = 0;
const long sendInterval = 3000; // Kirim data tiap 3 detik

unsigned long lastControlRead = 0;
const long controlInterval = 2000; // Cek saklar dari web tiap 2 detik

// ==========================================
// 2. SETUP FUNCTION
// ==========================================
void setup() {
  Serial.begin(115200);

  // Setup Relays (Default LOW = Off)
  pinMode(RELAY_MAIN_PUMP, OUTPUT); digitalWrite(RELAY_MAIN_PUMP, LOW);
  pinMode(RELAY_PH_UP, OUTPUT);     digitalWrite(RELAY_PH_UP, LOW);
  pinMode(RELAY_PH_DOWN, OUTPUT);   digitalWrite(RELAY_PH_DOWN, LOW);
  pinMode(RELAY_NUTRI_A, OUTPUT);   digitalWrite(RELAY_NUTRI_A, LOW);
  pinMode(RELAY_NUTRI_B, OUTPUT);   digitalWrite(RELAY_NUTRI_B, LOW);
  pinMode(RELAY_GROW_LIGHT, OUTPUT);digitalWrite(RELAY_GROW_LIGHT, LOW);
  pinMode(RELAY_AERATOR, OUTPUT);   digitalWrite(RELAY_AERATOR, LOW);

  dht.begin();

  // Connect to WiFi Wokwi
  Serial.print("Menghubungkan ke WiFi Wokwi... ");
  WiFi.begin(WIFI_SSID, WIFI_PASS, 6);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Terhubung! IP: " + WiFi.localIP().toString());
}

// ==========================================
// 3. REAL SENSOR READINGS (MURNI DARI HARDWARE / SIMULATOR)
// ==========================================

// Murni dari Potensiometer pH (0V - 3.3V -> pH 0.0 - 14.0)
float readPH() {
  int raw = analogRead(PH_PIN);
  float voltage = raw * (3.3 / 4095.0);
  float ph = (voltage / 3.3) * 14.0;
  return constrain(ph, 0.0, 14.0);
}

// Murni dari Potensiometer TDS Nutrisi (0V - 3.3V -> 0 - 2000 PPM)
float readPPM() {
  int raw = analogRead(TDS_PIN);
  float voltage = raw * (3.3 / 4095.0);
  float ppm = (voltage / 3.3) * 2000.0;
  return constrain(ppm, 0.0, 2000.0);
}

// Murni dari Potensiometer Level Air Tangki (0V - 3.3V -> 0% - 100%)
float readWaterLevel() {
  int raw = analogRead(LEVEL_PIN);
  float voltage = raw * (3.3 / 4095.0);
  float level = (voltage / 3.3) * 100.0;
  return constrain(level, 0.0, 100.0);
}

// Murni dari Potensiometer Intensitas Cahaya (0V - 3.3V -> 0 - 50.000 Lux)
float readLightLux() {
  int raw = analogRead(LIGHT_PIN);
  float voltage = raw * (3.3 / 4095.0);
  float lux = (voltage / 3.3) * 50000.0;
  return constrain(lux, 0.0, 50000.0);
}

// ==========================================
// 4. FIREBASE REST API FUNCTIONS
// ==========================================
void sendSensorsToFirebase() {
  if (WiFi.status() != WL_CONNECTED) return;

  // Baca 100% dari sensor murni
  float ph = readPH();
  float ppm = readPPM();
  float waterLevel = readWaterLevel();
  float lightLux = readLightLux();

  // Baca dari Sensor DHT22
  float airTemp = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Retry jika pembacaan pertama NaN
  if (isnan(airTemp) || isnan(humidity)) {
    delay(100);
    airTemp = dht.readTemperature();
    humidity = dht.readHumidity();
  }

  // Fallback 0 jika tetap NaN
  if (isnan(airTemp)) airTemp = 0.0;
  if (isnan(humidity)) humidity = 0.0;

  float waterTemp = airTemp; // Suhu air mengikuti suhu lingkungan dari DHT22
  float waterLiters = (waterLevel / 100.0) * 50.0; // Kapasitas 50 Liter

  StaticJsonDocument<350> doc;
  doc["ph"] = ph;
  doc["ppm"] = ppm;
  doc["nutrisi"] = ppm;
  doc["ec"] = ppm / 500.0;
  doc["waterTemp"] = waterTemp;
  doc["waterLevel"] = waterLevel;
  doc["waterLiters"] = waterLiters;
  doc["airTemp"] = airTemp;
  doc["humidity"] = humidity;
  doc["lightLux"] = lightLux;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  WiFiClientSecure client;
  client.setInsecure(); // Bypass SSL verification untuk HTTPS Wokwi

  HTTPClient http;
  String url = String(FIREBASE_HOST) + "/hydroponics/sensors.json";
  
  if (http.begin(client, url)) {
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.PUT(jsonPayload);

    if (httpCode > 0) {
      Serial.printf("[Firebase] HTTP %d | pH: %.2f | PPM: %.0f | Air: %.1fC | Tangki: %.0f%% | Lux: %.0f\n", 
                    httpCode, ph, ppm, airTemp, waterLevel, lightLux);
    } else {
      Serial.printf("[Firebase] Gagal Kirim, Error Code: %d (%s)\n", httpCode, http.errorToString(httpCode).c_str());
    }
    http.end();
  }
}

void readControlsFromFirebase() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  String url = String(FIREBASE_HOST) + "/hydroponics/controls.json";
  
  if (http.begin(client, url)) {
    int httpCode = http.GET();

    if (httpCode == 200) {
      String payload = http.getString();
      StaticJsonDocument<512> doc;
      DeserializationError error = deserializeJson(doc, payload);
      
      if (!error) {
        bool mainPump = doc["mainPump"]["state"] | false;
        bool phUp = doc["phUpPump"]["state"] | false;
        bool phDown = doc["phDownPump"]["state"] | false;
        bool nutriA = doc["nutrientPumpA"]["state"] | false;
        bool nutriB = doc["nutrientPumpB"]["state"] | false;
        bool growLight = doc["growLight"]["state"] | false;
        bool aerator = doc["aerator"]["state"] | false;

        digitalWrite(RELAY_MAIN_PUMP, mainPump ? HIGH : LOW);
        digitalWrite(RELAY_PH_UP, phUp ? HIGH : LOW);
        digitalWrite(RELAY_PH_DOWN, phDown ? HIGH : LOW);
        digitalWrite(RELAY_NUTRI_A, nutriA ? HIGH : LOW);
        digitalWrite(RELAY_NUTRI_B, nutriB ? HIGH : LOW);
        digitalWrite(RELAY_GROW_LIGHT, growLight ? HIGH : LOW);
        digitalWrite(RELAY_AERATOR, aerator ? HIGH : LOW);
      }
    }
    http.end();
  }
}

// ==========================================
// 5. MAIN LOOP
// ==========================================
void loop() {
  unsigned long now = millis();

  // Kirim data sensor tiap 3 detik
  if (now - lastSensorSend > sendInterval || lastSensorSend == 0) {
    lastSensorSend = now;
    sendSensorsToFirebase();
  }

  // Cek perintah saklar dari Web tiap 2 detik
  if (now - lastControlRead > controlInterval) {
    lastControlRead = now;
    readControlsFromFirebase();
  }
}
