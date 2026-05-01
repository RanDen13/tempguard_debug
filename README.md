# TempGuard - Environmental Monitoring System

TempGuard is a real-time environmental monitoring dashboard that interfaces with an ESP8266 microcontroller and a BME680 sensor via Firebase Realtime Database. The system logs live temperature and humidity data, monitors heat index, and visualizes historical trends.

## System Architecture

The project consists of two primary components:

1. **Web Dashboard:** A vanilla HTML/CSS/JS frontend that connects to Firebase Realtime Database.
2. **Hardware Sensor Node:** An ESP8266 microcontroller paired with a BME680 environmental sensor that reads and pushes data to the database.

### How It Works

- **Realtime Updates:** The web dashboard uses the Firebase Web SDK to listen for live updates from the Firebase Database. When the hardware updates its designated node (e.g., `Station1`), changes reflect instantly on the dashboard frontend.
- **History Logging:** 
  - **The Math:** Every 2 hours, the ESP8266 computes an average of the collected sensor readings.
  - **The Timestamping:** The ESP8266 uses an NTP (Network Time Protocol) client to fetch the current date and time. It creates a unique tag for that specific 2-hour window (e.g., `0501261200_2HR`).
  - **Firebase Push:** It pushes this data packet to the Realtime Database under the path `/averages/Station1/<TIMESTAMP>`.
  - **Dashboard Render:** The web dashboard listens for changes. When new data arrives in the `averages` node, it parses the timestamped folders, sorts them chronologically, and renders the history chart (automatically handling offline gaps if they exist).
  - **What you need to do in Firebase:** *Absolutely nothing.* Because Firebase acts as a flexible JSON document, you do not need to manually create an `averages` folder beforehand. The very first time your ESP8266 hits the 2-hour mark, Firebase will automatically create the `averages` node and save the data. Just ensure your database rules allow writing (e.g., `".write": true`).

## Setup and Installation

### 1. Web Dashboard

Since the project uses modern ES modules, it must be run via a local HTTP server (not by simply double-clicking `index.html`).

**Option A: Using Firebase CLI (Recommended)**
If you have Firebase CLI installed:

```bash
npx firebase-tools serve
# or
firebase serve
```

Then navigate to the provided localhost URL (e.g., `http://localhost:5000`) in your browser.

**Option B: Using VS Code Live Server**

- Open the project in VS Code.
- Navigate to the `TempGuard-Software/` directory.
- Right-click on `index.html` and select **"Open with Live Server"**.

**Option C: Using http-server**

```bash
npx http-server ./TempGuard-Software
```

### 2. ESP8266 Microcontroller

To deploy the hardware sensor node, you will need the **Arduino IDE**.

**Prerequisites:**
Ensure you have the following libraries installed via the Arduino Library Manager:

- `Firebase ESP Client` (by mobizt)
- `Adafruit BME680 Library`
- `NTPClient`

**Deployment Steps:**

1. Open your C++ sketch in the Arduino IDE.
2. Verify your Wi-Fi credentials and Firebase database URL/API key are correctly set.
3. Define your Station ID at the top of the code (e.g., `#define STATION_ID "Station1"`).
4. Connect your ESP8266 to your PC, select the correct Port and Board, and click **Upload**.

## Verification

Once both the Web Dashboard and the ESP8266 are running:

- **Live Data:** The "Current Data" cards on the Dashboard will update in real-time as the sensor pushes data (typically every minute).
- **History Logs:** The History tab will update automatically. **Every 2 hours**, the ESP8266 pushes a new "Average" entry to Firebase, and the Dashboard detects this to draw the history graph.
- **Debugging:** Open your browser's Developer Console (F12) to view `FIREBASE DATA:` logs and confirm data is arriving from the database.

_(Note: For testing purposes, you can temporarily change the logging interval in your ESP code from 7200 seconds to 60 seconds to see immediate history updates, but remember to change it back for production use!)_

## Known Issues & Limitations

1. **In-Browser Memory for Daily Logs:** Currently, short-term session logs (like toast alerts or quick notifications) might only exist in the browser's temporary memory. Refreshing the dashboard could wipe these unsaved short-term alerts.
2. **Offline Data Loss:** If the ESP8266 loses Wi-Fi connection exactly when it is supposed to log the 2-hour average, that data point will be lost. The dashboard's parser gracefully handles the missing data, but the gap will remain in your database.
3. **Open Database Rules:** If your Firebase Database is set to test mode (`".read": true, ".write": true`), anyone with the URL can view or alter your temperature data.

## Future Improvements & Suggestions

Here are a few recommendations to make the project more robust, secure, and easier to maintain in the future:

1. **Implement Local Hardware Caching (SPIFFS / LittleFS):**
   - *Fix for Offline Loss:* Program the ESP8266 to save sensor readings locally to its flash memory if Wi-Fi disconnects. Once Wi-Fi is restored, it can upload the cached backlog to Firebase to prevent data gaps.
2. **Firebase Authentication & Security Rules:**
   - Implement Firebase Auth so only authorized microcontrollers can write to the database, and only logged-in users can view the dashboard.
   - Update Firebase Security rules so that read/write access is restricted.
3. **Hardware Upgrade (ESP32):**
   - While the ESP8266 works fine, migrating to an **ESP32** offers better RAM, dual-core processing, and significantly improved handling of HTTPS/SSL connections, which Firebase relies heavily upon. This leads to fewer disconnects.
4. **Cloud-Side Data Aggregation:**
   - *Alternative Approach:* Instead of the ESP8266 calculating the 2-hour average, you could have the ESP push raw data every 5 minutes. Then, you can use **Firebase Cloud Functions** to calculate and store the 2-hour averages on the cloud. This reduces the processing load and memory usage on the microcontroller.
5. **PWA (Progressive Web App):**
   - Add a `manifest.json` and a simple Service Worker to your web dashboard. This will allow you to "install" the dashboard as a native-feeling app on your phone's home screen.
