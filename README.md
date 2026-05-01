# TempGuard - Environmental Monitoring System

TempGuard is a real-time environmental monitoring dashboard that interfaces with an ESP8266 microcontroller and a BME680 sensor via Firebase Realtime Database. The system logs live temperature and humidity data, monitors heat index, and visualizes historical trends.

## System Architecture

The project consists of two primary components:

1. **Web Dashboard:** A vanilla HTML/CSS/JS frontend that connects to Firebase Realtime Database.
2. **Hardware Sensor Node:** An ESP8266 microcontroller paired with a BME680 environmental sensor that reads and pushes data to the database.

### How It Works

- **Realtime Updates:** The web dashboard uses the Firebase Web SDK to listen for live updates from the Firebase Database. When the hardware updates its designated node (e.g., `Station1`), changes reflect instantly on the dashboard frontend.
- **History Logging:** Every 2 hours, the ESP8266 computes an average of the sensor readings and pushes this historical data to an `averages` node in Firebase. The web dashboard dynamically parses this data, mapping it chronologically to render accurate history charts while automatically handling any missing upload periods.

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
