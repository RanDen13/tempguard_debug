// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBx38TWk6kjLCg97L5Txbw4rezDyP0XjSA",
  authDomain: "tempguard-c36b9.firebaseapp.com",
  databaseURL: "https://tempguard-c36b9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tempguard-c36b9",
  storageBucket: "tempguard-c36b9.firebasestorage.app",
  messagingSenderId: "310126203970",
  appId: "1:310126203970:web:27540ebb97581066cd49db"
};

// 🔥 INIT
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const STATE = {
  screen: 'landing',   // landing | login | app | public
  preRole: null,
  user: null,
  page: 'dashboard',
  sidebarOpen: true,
  sensors: { heatIndex: 32, temperature: 32, humidity: 75, airQuality: 48 }, // STATION 1 ONLY! Firebase overrides this
  mockSensors2: { heatIndex: 31, temperature: 31, humidity: 73, airQuality: 45 },
  mockSensors3: { heatIndex: 33, temperature: 33, humidity: 77, airQuality: 50 },
  notifications: [],
  histLog: [],
  emailLog: [],
  historyData: { station_01: null, station_02: null, station_03: null },
  historyActiveStation: 'station_01',
  historyActiveMetric: 'heatIndex',
  historyActiveDay: 6,
  heatAlerted: false,
  histIdCounter: 0,
  users: [
    { name: 'Admin User', email: 'admin@tempguard.edu', pass: 'admin123', role: 'admin' },
    { name: 'Student Demo', email: 'student@tempguard.edu', pass: 'student1', role: 'student' },
  ],
  clockInterval: null,
  sensorInterval: null,
};




// ==========================================
// 1. Variables / Constants
// ==========================================
// 
    'use strict';

const IMGS = {
  logo_icon: "assets/logo.png",
  icon_humidity: "assets/humidity.png",
  icon_temp: "assets/temperature.png",
  icon_air: "assets/airquality.png",
  icon_dashboard: "assets/dashboard.png",
  icon_notif: "assets/notifications.png",
  icon_history: "assets/history.png",
  icon_mgmt: "assets/management.png",
  icon_send: "assets/announcement.png",
  icon_user: "assets/user.png",
  img_satellite: "assets/planet.png",
  img_building: "assets/school.png",
  bg_grid: "assets/gridbg.png",
  bg_main: "assets/mainbg.png"
};


// ==========================================
// 2. DOM Selections
// ==========================================
// Note: DOM elements are primarily handled dynamically within render functions.

// ==========================================
// 3. Helper Functions
// ==========================================
    // 
    const pad2 = n => String(n).padStart(2, '0');
    const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    function fmtTimestamp(d) {
      let h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
      const p = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
      return `${pad2(h)}:${pad2(m)}:${pad2(s)} ${p}`;
    }
    function fmtDateFull(d) {
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}, ${fmtTimestamp(d)}`;
    }
    function fmtTimeShort(d) {
      let h = d.getHours(), m = d.getMinutes();
      const p = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
      return `${pad2(h)}:${pad2(m)} ${p}`;
    }

    function getHeatMeta(hi) {
      if (hi < 27) return { label: 'COMFORTABLE', color: '#22c55e' };
      if (hi < 30) return { label: 'WARM', color: '#f59e0b' };
      if (hi < 35) return { label: 'VERY HOT', color: '#f97316' };
      return { label: 'DANGER', color: '#ef4444' };
    }

    function getHeatIndexTips(heatIndex) {
      if (heatIndex < 27) {
        return [
          "Normal conditions. No special precautions needed.",
          "Stay hydrated as a general habit.",
          "Good time for outdoor activities."
        ];
      }

      if (heatIndex <= 32) {
        return [
          "Drink water regularly even if not thirsty.",
          "Limit prolonged outdoor exposure.",
          "Take short breaks when doing physical activity.",
          "Wear light and breathable clothing."
        ];
      }

      if (heatIndex <= 41) {
        return [
          "Avoid direct sunlight during peak hours (10 AM–3 PM).",
          "Increase water intake frequently.",
          "Take frequent breaks in shaded or cool areas.",
          "Reduce strenuous outdoor activities.",
          "Use cooling methods (fan, wet cloth, shade)."
        ];
      }

      if (heatIndex <= 51) {
        return [
          "Avoid outdoor activities as much as possible.",
          "Stay in air-conditioned or well-ventilated areas.",
          "Drink water consistently (do not wait for thirst).",
          "Check for signs of heat exhaustion (dizziness, weakness).",
          "Wear minimal and light-colored clothing."
        ];
      }

      return [
        "CRITICAL: Stay indoors immediately.",
        "Avoid any physical activity outdoors.",
        "Use cooling systems (fan/AC) continuously.",
        "Monitor for heat stroke symptoms (confusion, fainting).",
        "Seek medical attention if symptoms occur."
      ];
    }

    function getIndications(data) {
      const { heatIndex, temp, humidity, airQuality } = data;

      const heatIndexText = getHeatIndexIndication(heatIndex);
      const tempText = getTemperatureIndication(temp);
      const humidityText = getHumidityIndication(humidity);
      const airQualityText = getAirQualityIndication(airQuality);

      return [
        {
          label: `Heat Index (${heatIndex}°C)`,
          text: heatIndexText
        },
        {
          label: `Temperature (${temp}°C)`,
          text: tempText
        },
        {
          label: `Humidity (${humidity}%)`,
          text: humidityText
        },
        {
          label: `Air Quality (${airQuality})`,
          text: airQualityText
        }
      ];
    }

    function getHeatIndexIndication(heatIndex) {
      if (heatIndex < 27) return "Not Hazardous. Safe for normal activities.";
      if (heatIndex <= 32) return "Caution. Fatigue possible with prolonged exposure. Stay hydrated.";
      if (heatIndex <= 41) return "Extreme Caution. Heat cramps and exhaustion possible.";
      if (heatIndex <= 51) return "Danger. Heat exhaustion likely, heat stroke possible.";
      return "Extreme Danger. Heat stroke is imminent.";
    }

    function getTemperatureIndication(temp) {
      if (temp >= 35) return "Very Hot. Cooling is strongly recommended.";
      if (temp >= 30) return "Hot. Stay hydrated.";
      if (temp >= 25) return "Warm.";
      return "Normal temperature.";
    }

    function getHumidityIndication(humidity) {
      if (humidity >= 80) return "Very Humid. High discomfort.";
      if (humidity >= 60) return "Humid. Increase ventilation.";
      if (humidity >= 40) return "Comfortable.";
      return "Dry air.";
    }

    function getAirQualityIndication(airQuality) {
      if (airQuality <= 25) return "Good. Air quality is satisfactory.";
      if (airQuality <= 35) return "Fair. Acceptable air quality.";
      if (airQuality <= 45) return "Unhealthy for Sensitive Groups.";
      if (airQuality <= 55) return "Very Unhealthy. Increased health risk.";
      if (airQuality <= 90) return "Acutely Unhealthy. Serious health effects.";
      return "Emergency. Everyone may experience serious effects.";
    }

    function buildHistorySkeleton() {
      const times = ['12AM', '2AM', '4AM', '6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];
      const daysList = [];
      let now = new Date();
      for (let i = 6; i >= 0; i--) {
        let d = new Date(now);
        d.setDate(now.getDate() - i);
        let hourly = times.map((time) => ({
          time, heatIndex: 0, temperature: 0, humidity: 0, airQuality: 0, hasData: false
        }));
        daysList.push({
          dateObj: d, dateString: `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`,
          dayShort: DAYS_LONG[d.getDay()].substring(0, 3).toUpperCase(),
          dayNum: d.getDate(), monthShort: MONTHS_LONG[d.getMonth()].substring(0, 3),
          monthFull: MONTHS_LONG[d.getMonth()], fullDate: `${DAYS_LONG[d.getDay()]}, ${MONTHS_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
          hourly: hourly
        });
      }
      return daysList;
    }

    function parseFirebaseHistory(averages) {
      if (!STATE.historyData) STATE.historyData = {};
      const stationMap = { 'Station1': 'station_01', 'Station2': 'station_02', 'Station3': 'station_03' };
      for (let fbSt in stationMap) {
        if (!averages[fbSt]) continue;
        const stateSt = stationMap[fbSt];
        let daysSkeleton = STATE.historyData[stateSt] && STATE.historyData[stateSt].length === 7 
                           ? STATE.historyData[stateSt] 
                           : buildHistorySkeleton();
        
        for (let key in averages[fbSt]) {
          const entry = averages[fbSt][key];
          if (!entry.datetime) continue;
          
          const dtStr = entry.datetime;
          const mo = parseInt(dtStr.substring(0,2), 10);
          const da = parseInt(dtStr.substring(2,4), 10);
          const yr = parseInt(dtStr.substring(4,6), 10) + 2000;
          const hr = parseInt(dtStr.substring(6,8), 10);
          const d = new Date(yr, mo - 1, da, hr, 0);
          if (isNaN(d.getTime())) continue;

          const dateStr = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
          const dayMatch = daysSkeleton.find(ds => ds.dateString === dateStr);
          if (dayMatch) {
            const h = d.getHours();
            const slotIndex = Math.floor(h / 2);
            if (slotIndex >= 0 && slotIndex < 12) {
              dayMatch.hourly[slotIndex] = {
                time: dayMatch.hourly[slotIndex].time,
                heatIndex: entry.avg_heatindex || 0,
                temperature: entry.avg_temperature || 0,
                humidity: entry.avg_humidity || 0,
                airQuality: entry.avg_airquality || 0,
                hasData: true
              };
            }
          }
        }

        let lastValid = null, firstValid = null;
        for (let d of daysSkeleton) {
          for (let h of d.hourly) {
            if (h.hasData) {
              lastValid = { heatIndex: h.heatIndex, temperature: h.temperature, humidity: h.humidity, airQuality: h.airQuality };
              if (!firstValid) firstValid = { ...lastValid };
            } else if (lastValid) {
              Object.assign(h, lastValid);
            }
          }
        }
        if (firstValid) {
          for (let d of daysSkeleton) {
            for (let h of d.hourly) {
              if (h.hasData) break;
              Object.assign(h, firstValid);
            }
          }
        }
        STATE.historyData[stateSt] = daysSkeleton;
      }
    }

    // 
    function el(tag, attrs = {}, ...children) {
      const e = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) {
        if (k === 'style' && typeof v === 'object') { Object.assign(e.style, v); }
        else if (k === 'class') { e.className = v; }
        else if (k.startsWith('on')) { e.addEventListener(k.slice(2).toLowerCase(), v); }
        else { e.setAttribute(k, v); }
      }
      for (const c of children) {
        if (c == null || c === false) continue;
        if (typeof c === 'string' || typeof c === 'number') e.appendChild(document.createTextNode(c));
        else if (c && typeof c === "object" && c.nodeType) e.appendChild(c); else if (c && typeof c === "object" && c.tag !== undefined) e.appendChild(c);
      }
      return e;
    }
    function img(src, w, h, extra = {}) {
      return el('img', { src, width: w, height: h, style: { objectFit: 'contain', ...extra } });
    }
    function div(attrs, ...children) { return el('div', attrs, ...children); }
    function btn(attrs, ...children) { return el('button', attrs, ...children); }
    function span(attrs, ...children) { return el('span', attrs, ...children); }

    // 
    function pushToast(type, title, body = '') {
      const wrap = document.getElementById('toast-wrap');
      if (!wrap) return;
      const colors = { success: 'rgba(34,197,94,.92)', error: 'rgba(239,68,68,.92)', info: 'rgba(6,182,212,.92)' };
      const t = div({ class: 'toast', style: { background: colors[type] || colors.info } },
        img(IMGS.icon_notif, 20, 20, { filter: 'brightness(0) invert(1)' }),
        div({},
          div({ style: { fontWeight: 700 } }, title),
          body ? div({ style: { fontSize: '12px', opacity: .85, marginTop: '2px' } }, body) : null
        )
      );
      wrap.appendChild(t);
      setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; t.style.transition = 'all .3s'; setTimeout(() => t.remove(), 300); }, 3200);
    }

    // 
    function sensorBar(value, max, color) {
      const pct = Math.min(100, (value / max) * 100).toFixed(1);
      return div({ class: 'sensor-bar-track' },
        div({ class: 'sensor-bar-fill', style: { width: pct + '%', background: `linear-gradient(90deg, ${color}66, ${color})` } })
      );
    }


    // 
    function logoIcon(size = 50) { return img(IMGS.logo_icon, size, size, { flexShrink: 0 }); }
    function logoText(size = 'lg') {
      const fs = size === 'lg' ? '35px' : size === 'md' ? '20px' : '18px';
      return span({ style: { fontFamily: "'Nunito", fontSize: fs, fontWeight: 900, lineHeight: 1 } },
        span({ style: { color: '#23467f' } }, 'Temp'),
        span({ style: { color: '#f0a72a' } }, 'Guard')
      );
    }

    // 
    function buildClock() {
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 90 90');
      svg.setAttribute('width', '120');
      svg.setAttribute('height', '125');

      const circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', '45'); circle.setAttribute('cy', '45');
      circle.setAttribute('r', '45'); circle.setAttribute('fill', '#f8fafc');
      circle.setAttribute('stroke', '#e2e8f0'); circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);

      // Hour markers
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', 45 + 35 * Math.cos(a)); line.setAttribute('y1', 45 + 35 * Math.sin(a));
        line.setAttribute('x2', 45 + 40 * Math.cos(a)); line.setAttribute('y2', 45 + 40 * Math.sin(a));
        line.setAttribute('stroke', '#cbd5e1'); line.setAttribute('stroke-width', '1.5');
        svg.appendChild(line);
      }

      const hourHand = document.createElementNS(ns, 'line');
      hourHand.setAttribute('stroke', '#1a3a6b'); hourHand.setAttribute('stroke-width', '3');
      hourHand.setAttribute('stroke-linecap', 'round'); hourHand.id = 'clock-hour';
      svg.appendChild(hourHand);

      const minHand = document.createElementNS(ns, 'line');
      minHand.setAttribute('stroke', '#f97316'); minHand.setAttribute('stroke-width', '2.5');
      minHand.setAttribute('stroke-linecap', 'round'); minHand.id = 'clock-min';
      svg.appendChild(minHand);

      const secHand = document.createElementNS(ns, 'line');
      secHand.setAttribute('stroke', '#ef4444'); secHand.setAttribute('stroke-width', '1.2');
      secHand.setAttribute('stroke-linecap', 'round'); secHand.id = 'clock-sec';
      svg.appendChild(secHand);

      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', '45'); dot.setAttribute('cy', '45');
      dot.setAttribute('r', '3'); dot.setAttribute('fill', '#1a3a6b');
      svg.appendChild(dot);

      return svg;
    }

    function updateClock() {
      const now = new Date();
      const s = now.getSeconds();
      const h = now.getHours() % 12 + now.getMinutes() / 60 + s / 3600;
      const m = now.getMinutes() / 60 + s / 3600;
      const ha = (h / 12) * Math.PI * 2 - Math.PI / 2;
      const ma = m * Math.PI * 2 - Math.PI / 2;
      const sa = (s / 60) * Math.PI * 2 - Math.PI / 2;
      const hEl = document.getElementById('clock-hour');
      const mEl = document.getElementById('clock-min');
      const sEl = document.getElementById('clock-sec');
      if (hEl) { hEl.setAttribute('x1', '45'); hEl.setAttribute('y1', '45'); hEl.setAttribute('x2', 45 + 22 * Math.cos(ha)); hEl.setAttribute('y2', 45 + 22 * Math.sin(ha)); }
      if (mEl) { mEl.setAttribute('x1', '45'); mEl.setAttribute('y1', '45'); mEl.setAttribute('x2', 45 + 32 * Math.cos(ma)); mEl.setAttribute('y2', 45 + 32 * Math.sin(ma)); }
      if (sEl) { sEl.setAttribute('x1', '45'); sEl.setAttribute('y1', '45'); sEl.setAttribute('x2', 45 + 36 * Math.cos(sa)); sEl.setAttribute('y2', 45 + 36 * Math.sin(sa)); }

      let hr = now.getHours(), min = now.getMinutes(), sec = now.getSeconds();
      const p = hr >= 12 ? 'PM' : 'AM'; hr = hr % 12 || 12;
      const timeEl = document.getElementById('clock-time');
      if (timeEl) timeEl.innerHTML = `<span>${pad2(hr)}:${pad2(min)}</span><span style="font-size:15px;color:#94a3b8;font-weight:550;line-height:1;padding-bottom:1px;">:${pad2(sec)} ${p}</span>`;
      const dayEl = document.getElementById('clock-day');
      if (dayEl) dayEl.textContent = DAYS_LONG[now.getDay()].toUpperCase();
      const dateEl = document.getElementById('clock-date');
      if (dateEl) dateEl.textContent = `${MONTHS_LONG[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    }

    function clockWidget(isPublic = false) {
      const svg = buildClock();
      const w = div({ style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' } },
        div({ style: { display: 'flex', alignItems: 'center', gap: '25px' } },
          div({ style: { flexShrink: 0 } }, svg),
          div({ style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' } },
            div({ id: 'clock-time', style: { fontFamily: "'AC Soft Ice Cream', 'Poppins', sans-serif", letterSpacing: '1.3px', fontSize: isPublic ? '30px' : '25px', fontWeight: 550, color: '#475569', lineHeight: 1 } }, '12:00'),
            div({ id: 'clock-day', style: { fontSize: isPublic ? '15px' : '13px', fontWeight: 700, color: '#f97316' } }, ''),
            div({ id: 'clock-date', style: { fontSize: isPublic ? '13px' : '11px', color: '#94a3b8' } }, '')
          )
        )
      );
      updateClock();
      return w;
    }

    // 
    function buildAreaChart(hourlyData, activeKey, color) {
      const ns = 'http://www.w3.org/2000/svg';
      const W = 500, H = 200, PX = 40, PY = 20;

      // Each metric keeps its OWN distinct color
      const colors = {
        heatIndex: '#ff8c5b',    // Orange 
        temperature: '#52d254',  // Green
        humidity: '#58abe6'      // Blue
      };

      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.maxHeight = '100%';

      // Grid lines
      [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach(p => {
        const yy = PY + (p / 100) * (H - PY * 2);
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', PX);
        line.setAttribute('y1', yy);
        line.setAttribute('x2', W - PX);
        line.setAttribute('y2', yy);
        line.setAttribute('stroke', '#e2e8f0');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
      });

      // X labels
      hourlyData.forEach((d, i) => {
        const x = PX + (i / (hourlyData.length - 1)) * (W - PX * 2);
        const t = document.createElementNS(ns, 'text');
        t.setAttribute('x', x);
        t.setAttribute('y', H - 4);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('fill', '#94a3b8');
        t.setAttribute('font-size', '5');
        t.setAttribute('font-family', 'Nunito,sans-serif');
        t.textContent = d.time;
        svg.appendChild(t);
      });

      // Draw ALL metrics with their OWN colors
      Object.keys(colors).forEach(k => {
        const mx = k === 'humidity' ? 170 : 60;
        const xFn = i => PX + (i / (hourlyData.length - 1)) * (W - PX * 2);
        const yFn = v => PY + (1 - v / mx) * (H - PY * 2);
        const linePts = hourlyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFn(i)} ${yFn(d[k])}`).join(' ');
        const areaPts = `${linePts} L ${xFn(hourlyData.length - 1)} ${H - PY} L ${xFn(0)} ${H - PY} Z`;
        const isActive = k === activeKey;

        // Each metric uses its OWN color
        const lineColor = colors[k];  // ✅ Own distinct color!

        // Faint area for all
        const area = document.createElementNS(ns, 'path');
        area.setAttribute('d', areaPts);
        area.setAttribute('fill', lineColor);  // ✅ Own color
        area.setAttribute('opacity', isActive ? '0.25' : '0.08');
        svg.appendChild(area);

        // Line - bold if active, faint if not
        const linePath = document.createElementNS(ns, 'path');
        linePath.setAttribute('d', linePts);
        linePath.setAttribute('fill', 'none');
        linePath.setAttribute('stroke', lineColor);  // ✅ Own color stays!
        linePath.setAttribute('stroke-width', isActive ? '1.5' : '1');
        linePath.setAttribute('stroke-linejoin', 'round');
        linePath.setAttribute('opacity', isActive ? '1' : '0.4');  // ✅ Faint but own color
        svg.appendChild(linePath);

        // Circles only for active
        if (isActive) {
          hourlyData.forEach((d, i) => {
            const dot = document.createElementNS(ns, 'circle');
            dot.setAttribute('cx', xFn(i));
            dot.setAttribute('cy', yFn(d[k]));
            dot.setAttribute('r', '2.5');
            dot.setAttribute('fill', '#fff');
            dot.setAttribute('stroke', lineColor);  // ✅ Own color
            dot.setAttribute('stroke-width', '1.5');
            svg.appendChild(dot);
          });
        }
      });

      return svg;
    }

    // 
    function buildSidebar() {
      const user = STATE.user;
      const open = STATE.sidebarOpen;
      const pages = [
        { id: 'dashboard', icon: IMGS.icon_dashboard, label: 'Dashboard' },
        { id: 'notifications', icon: IMGS.icon_notif, label: 'Notifications' },
        { id: 'history', icon: IMGS.icon_history, label: 'History' },
        ...(user.role === 'admin' ? [{ id: 'management', icon: IMGS.icon_mgmt, label: 'Management' }] : []),
      ];

      const navItems = pages.map(p => {
        const isActive = STATE.page === p.id;
        const u = STATE.user ? STATE.user.email : '';
        const visibleNotifs = STATE.notifications.filter(n => !(n.clearedBy || []).includes(u));
        const newCount = visibleNotifs.filter(n => !(n.readBy || []).includes(u)).length;
        const showBadge = p.id === 'notifications' && newCount > 0;
        const badgeStyle = { background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 900, borderRadius: '20px', minWidth: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', flexShrink: 0, boxSizing: 'border-box' };
        const badge = showBadge ? span({ id: 'notif-sidebar-badge', style: badgeStyle }, String(newCount)) : null;
        const badgeSmall = showBadge ? span({ id: 'notif-sidebar-badge', style: { position: 'absolute', top: '4px', right: '4px', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 900, borderRadius: '20px', minWidth: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', boxSizing: 'border-box' } }, String(newCount)) : null;
        const b = btn({
          class: `nav-item${isActive ? ' active' : ''}`,
          style: { justifyContent: open ? 'flex-start' : 'center', padding: open ? '10px 14px' : '10px', position: 'relative' },
          title: !open ? p.label : '',
          onclick: () => { navigate(p.id); },
        },
          img(p.icon, 20, 20, { objectFit: 'contain', flexShrink: 0 }),
          open ? span({ style: { flex: 1 } }, p.label) : null,
          open ? badge : badgeSmall
        );
        return b;
      });

      const logoutBtn = open
        ? btn({ class: 'btn-teal', style: { width: '100%', fontSize: '13px', padding: '11px 16px', letterSpacing: '1.2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }, onclick: doLogout },
          logoutSvg(), 'LOGOUT')
        : btn({ class: 'btn-teal', style: { display: 'flex', justifyContent: 'center', width: '100%', cursor: 'pointer', padding: '11px 0' }, onclick: doLogout, title: 'Logout' },
          logoutSvg());

      const userSection = open
        ? div({ style: { padding: '14px 18px 10px' } },
          div({ style: { fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '2px' } }, 'Signed in as'),
          div({ style: { fontSize: '14px', fontWeight: 700, color: '#1d4ed8', marginBottom: '1px' } }, user.name),
          div({ style: { fontSize: '11px', color: '#94a3b8', textTransform: 'capitalize' } }, user.role)
        )
        : div({ style: { display: 'flex', justifyContent: 'center', padding: '12px 0 8px' } },
          img(IMGS.icon_user, 34, 34, { borderRadius: '50%', objectFit: 'cover' }));

      const sidebar = el('aside', {
        class: `sidebar ${open ? 'sidebar-open' : 'sidebar-closed'}`,
        id: 'sidebar'
      },
        div({ style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 14px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)' } },
          btn({
            class: 'sidebar-toggle-btn',
            style: { background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center' },
            onclick: () => { STATE.sidebarOpen = !STATE.sidebarOpen; render(); }
          },
            logoIcon(34)
          ),
          open ? logoText('sm') : null,
          btn({
            class: 'sidebar-close-btn',
            style: { display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginLeft: 'auto' },
            onclick: () => { STATE.sidebarOpen = false; render(); }
          }, svgIcon(['M18 6L6 18', 'M6 6l12 12'], 22, '#64748b'))
        ),
        userSection,
        el('nav', { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px 10px' } }, ...navItems),
        div({ style: { padding: '10px 10px 20px', borderTop: '1px solid rgba(0,0,0,0.06)' } }, logoutBtn)
      );
      return sidebar;
    }

    // 
    function svgIcon(path, size = 18, color = '#94a3b8') {
      const ns = 'http://www.w3.org/2000/svg';
      const s = document.createElementNS(ns, 'svg');
      s.setAttribute('width', size); s.setAttribute('height', size);
      s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none');
      s.setAttribute('stroke', color); s.setAttribute('stroke-width', '2');
      s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
      if (Array.isArray(path)) {
        path.forEach(p => { const pe = document.createElementNS(ns, 'path'); pe.setAttribute('d', p); s.appendChild(pe); });
      } else {
        const pe = document.createElementNS(ns, 'path'); pe.setAttribute('d', path); s.appendChild(pe);
      }
      return s;
    }
    function logoutSvg(size = 18, color = '#fff') { return svgIcon(['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'], size, color); }
    function alertTriangleSvg(size = 14, color = '#ef4444') {
      const ns = 'http://www.w3.org/2000/svg';
      const s = document.createElementNS(ns, 'svg');
      s.setAttribute('width', size); s.setAttribute('height', size); s.setAttribute('viewBox', '0 0 24 24');
      s.setAttribute('fill', 'none'); s.setAttribute('stroke', color); s.setAttribute('stroke-width', '2');
      s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
      const p = document.createElementNS(ns, 'path'); p.setAttribute('d', 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z'); s.appendChild(p);
      const l1 = document.createElementNS(ns, 'line'); l1.setAttribute('x1', '12'); l1.setAttribute('y1', '9'); l1.setAttribute('x2', '12'); l1.setAttribute('y2', '13'); s.appendChild(l1);
      const l2 = document.createElementNS(ns, 'line'); l2.setAttribute('x1', '12'); l2.setAttribute('y1', '17'); l2.setAttribute('x2', '12.01'); l2.setAttribute('y2', '17'); s.appendChild(l2);
      return s;
    }
    function eyeSvg(open = true) {
      const ns = 'http://www.w3.org/2000/svg';
      const s = document.createElementNS(ns, 'svg');
      s.setAttribute('width', 16); s.setAttribute('height', 16); s.setAttribute('viewBox', '0 0 24 24');
      s.setAttribute('fill', 'none'); s.setAttribute('stroke', '#94a3b8'); s.setAttribute('stroke-width', '2');
      s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
      if (open) {
        const p = document.createElementNS(ns, 'path'); p.setAttribute('d', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'); s.appendChild(p);
        const c = document.createElementNS(ns, 'circle'); c.setAttribute('cx', '12'); c.setAttribute('cy', '12'); c.setAttribute('r', '3'); s.appendChild(c);
      } else {
        const p = document.createElementNS(ns, 'path'); p.setAttribute('d', 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24'); s.appendChild(p);
        const l = document.createElementNS(ns, 'line'); l.setAttribute('x1', '1'); l.setAttribute('y1', '1'); l.setAttribute('x2', '23'); l.setAttribute('y2', '23'); s.appendChild(l);
      }
      return s;
    }


// ==========================================
// 4. Main Functions
// ==========================================
    // 
    function renderLanding() {
      return div({ class: 'sky-bg', style: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', backgroundImage: `url(${IMGS.bg_main})`, backgroundSize: 'cover', backgroundPosition: 'center top' } },
        div({ class: 'fade-up card', style: { padding: '52px', width: '380px', maxWidth: '100%', textAlign: 'center', position: 'relative', zIndex: 1, boxShadow: '0 24px 64px rgba(30,64,175,0.15)' } },
          div({ style: { display: 'flex', justifyContent: 'center', marginBottom: '2px' } }, logoIcon(82)),
          logoText('lg'),
          el('p', { family: 'Nunito', style: { color: '#2563eb', fontSize: '18px', fontWeight: 600, margin: '20px 20px 28px', lineHeight: 1 } }, 'Your Reliable Partner in Environmental Monitoring'),
          div({ style: { width: '60px', height: '3px', background: 'linear-gradient(to right,#1a3a6b,#0ea5e9)', borderRadius: '2px', margin: '0 auto 32px' } }),
          div({ style: { display: 'flex', flexDirection: 'column', gap: '15px' } },
            btn({ class: 'btn-teal', style: { width: '100%', fontSize: '15px', letterSpacing: '1.8px', padding: '14px' }, onclick: () => goLogin('admin') }, 'ADMIN'),
            btn({ class: 'btn-teal', style: { width: '100%', fontSize: '15px', letterSpacing: '1.8px', padding: '14px' }, onclick: () => goLogin('student') }, 'STUDENT'),
            btn({ class: 'btn-teal', style: { width: '100%', fontSize: '15px', letterSpacing: '1.8px', padding: '14px' }, onclick: () => goPublic() }, 'PUBLIC')
          )
        )
      );
    }

    // 
    function renderLogin() {
      let showPw = false;
      let usernameVal = '';
      let passVal = '';

      const errDiv = div({ style: { display: 'none', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '9px 13px', flexDirection: 'row', gap: '8px', alignItems: 'center', marginTop: '4px' } },
        alertTriangleSvg(14, '#ef4444'),
        span({ style: { fontSize: '13px', color: '#dc2626', flex: 1 } }, '')
      );
      function showErr(msg) { errDiv.style.display = 'flex'; errDiv.querySelector('span').textContent = msg; }
      function hideErr() { errDiv.style.display = 'none'; }

      const usernameInput = el('input', { class: 'field', type: 'text', placeholder: 'Enter your username or email' });
      usernameInput.addEventListener('input', () => { usernameVal = usernameInput.value; hideErr(); });
      usernameInput.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });

      const passInput = el('input', { class: 'field', type: 'password', placeholder: 'Enter your password', style: { paddingRight: '44px' } });
      passInput.addEventListener('input', () => { passVal = passInput.value; hideErr(); });
      passInput.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });

      const eyeBtn = btn({
        style: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }, onclick: () => {
          showPw = !showPw; passInput.type = showPw ? 'text' : 'password';
          eyeBtn.innerHTML = ''; eyeBtn.appendChild(eyeSvg(!showPw));
        }
      }, eyeSvg(false));

      function attempt() {
        const found = STATE.users.find(u =>
          (u.email.toLowerCase() === usernameVal.toLowerCase() || u.name.toLowerCase() === usernameVal.toLowerCase()) &&
          u.pass === passVal && (!STATE.preRole || u.role === STATE.preRole)
        );
        if (found) { doLogin(found); return; }
        showErr('Invalid username or password. Please try again.');
      }

      const demoBtns = STATE.users.filter(u => !STATE.preRole || u.role === STATE.preRole).map(d =>
        btn({
          style: { display: 'block', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#475569', padding: '2px 0', textAlign: 'left', width: '100%', fontFamily: 'inherit' },
          onclick: () => { usernameInput.value = d.email; passInput.value = d.pass; usernameVal = d.email; passVal = d.pass; hideErr(); }
        },
          span({ style: { color: '#0ea5e9', fontWeight: 700, textTransform: 'capitalize', marginRight: '6px' } }, d.role + ':'), d.email)
      );

      return div({ class: 'sky-bg', style: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', backgroundImage: `url(${IMGS.bg_main})`, backgroundSize: 'cover', backgroundPosition: 'center top' } },
        div({ class: 'fade-up card', style: { padding: '44px 48px', width: '420px', maxWidth: '100%', textAlign: 'center', position: 'relative', zIndex: 1, boxShadow: '0 24px 64px rgba(30,64,175,0.15)' } },
          div({ style: { display: 'flex', justifyContent: 'center', marginBottom: '2px' } }, logoIcon(82)),
          logoText('lg'),
          el('h2', { style: { fontFamily: "Nunito", fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 550, color: '#06b6d4', margin: '10px 0 4px' } }, 'Welcome Back!'),
          el('p', { style: { color: '#94a3b8', fontSize: '13px', marginBottom: '28px' } }, 'Sign in with your registered account.'),
          div({ style: { display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' } },
            div({},
              el('label', { style: { fontSize: '11px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '5px', letterSpacing: '.8px', textTransform: 'uppercase' } }, 'USERNAME'),
              usernameInput
            ),
            div({},
              el('label', { style: { fontSize: '11px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '5px', letterSpacing: '.8px', textTransform: 'uppercase' } }, 'PASSWORD'),
              div({ style: { position: 'relative' } }, passInput, eyeBtn)
            ),
            errDiv,
            btn({ class: 'btn-teal', style: { width: '100%', fontSize: '15px', letterSpacing: '1.2px', padding: '13px', marginTop: '2px' }, onclick: attempt }, 'SIGN IN')
          ),
          div({ style: { marginTop: '18px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px', textAlign: 'left' } },
            el('p', { style: { fontSize: '11px', color: '#16a34a', fontWeight: 700, marginBottom: '6px' } }, 'Demo Credentials:'),
            ...demoBtns
          ),
          btn({ style: { display: 'block', margin: '18px auto 0', background: 'none', border: 'none', cursor: 'pointer', color: '#0ea5e9', fontSize: '13px', fontWeight: 700, fontFamily: 'inherit' }, onclick: () => goBack() },
            '<- Back to Main Menu')
        )
      );
    }

    // 
    function renderAdminDashboard() {
      const s = STATE.sensors;
      const meta = getHeatMeta(s.heatIndex);
      const hi = Math.round(s.heatIndex), temp = Math.round(s.temperature), hum = Math.round(s.humidity);

      const indicationsData = getIndications({ heatIndex: hi, temp: temp, humidity: hum, airQuality: s.airQuality });
      const indications = indicationsData.map(ind => ({ bold: ind.label + ':', rest: ' ' + ind.text }));

      const s2 = STATE.mockSensors2;
      const s3 = STATE.mockSensors3;
      const stations = [
        { name: 'STATION 1', heat: hi, temp: temp, hum: hum, aqi: s.airQuality },
        { name: 'STATION 2', heat: Math.round(s2.heatIndex), temp: Math.round(s2.temperature), hum: Math.round(s2.humidity), aqi: s2.airQuality },
        { name: 'STATION 3', heat: Math.round(s3.heatIndex), temp: Math.round(s3.temperature), hum: Math.round(s3.humidity), aqi: s3.airQuality },
      ];

      return div({ style: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' } },
        div({ style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
          // Welcome banner
          div({ class: 'card', style: { padding: '28px 28px', background: 'linear-gradient(135deg,#f0fdf4,#dbeafe)', borderColor: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' } },
            div({},
              div({ style: { paddingLeft: '3px', fontFamily: "'Poppins',sans-serif", fontSize: '15px', fontWeight: 550, color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' } }, 'ADMIN DASHBOARD'),
              div({ style: { fontFamily: "'Nunito'", fontSize: 'clamp(24px, 5vw, 35px)', fontWeight: 1000, color: '#0c9ada', lineHeight: 1 } }, 'Good day, Admin👋')
            ),
            img(IMGS.img_satellite, 150, 150, { flexShrink: 0, marginRight: '-15px', marginTop: '-28px', marginBottom: '-45px' }
            )
          ),
          // Stations
          ...stations.map((st, i) =>
            div({ style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' } },
              // Left Card (Heat Index)
              div({ class: 'card card-lift', style: { padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
                div({ style: { fontSize: '13px', fontWeight: 800, color: '#1a3a6b', textTransform: 'uppercase', letterSpacing: '1px' } }, st.name),
                div({ style: { fontSize: '15px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginTop: '2px' } }, 'HEAT INDEX'),
                div({ id: `st${i}-heat-val`, style: { fontFamily: "'AC Soft Ice Cream', 'Poppins', sans-serif", letterSpacing: '1px', fontSize: 'clamp(40px, 8vw, 60px)', fontWeight: 550, color: '#1a3a6b', lineHeight: 1, marginTop: '8px' } }, st.heat + '°C'),
              ),
              // Right Card (Bars)
              div({ class: 'card card-lift', style: { padding: '20px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '15px' } },
                // Temp
                div({ style: { display: 'flex', alignItems: 'center', gap: '5px' } },
                  img(IMGS.icon_temp, 28, 28, { objectFit: 'contain' }),
                  div({ style: { flex: 1 } },
                    div({ style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#1a3a6b', marginBottom: '1px', lineHeight: 1 } },
                      span({}, 'Temperature'), span({ id: `st${i}-temp-val` }, st.temp + '°C')
                    ),
                    sensorBar(st.temp, 70, '#e56852', `st${i}-temp`)
                  )
                ),
                // Hum
                div({ style: { display: 'flex', alignItems: 'center', gap: '5px' } },
                  img(IMGS.icon_humidity, 28, 28, { objectFit: 'contain' }),
                  div({ style: { flex: 1 } },
                    div({ style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#1a3a6b', marginBottom: '1px', lineHeight: 1 } },
                      span({}, 'Humidity'), span({ id: `st${i}-hum-val` }, st.hum + '%')
                    ),
                    sensorBar(st.hum, 100, '#8cc63f', `st${i}-hum`)
                  )
                ),
                // Air
                div({ style: { display: 'flex', alignItems: 'center', gap: '5px' } },
                  img(IMGS.icon_air, 28, 28, { objectFit: 'contain' }),
                  div({ style: { flex: 1 } },
                    div({ style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#1a3a6b', marginBottom: '1px', lineHeight: 1 } },
                      span({}, 'Air Quality'), span({ id: `st${i}-aqi-val` }, st.aqi)
                    ),
                    sensorBar(st.aqi, 100, '#4da1e9', `st${i}-aqi`)
                  )
                )
              )
            )
          )
        ),

        // Right column
        div({ style: { display: 'grid', gridTemplateRows: '0.8fr 0.9fr', gap: '14px', height: '100%' } },
          // Building
          div({ class: 'card', style: { padding: 0, overflow: 'hidden', height: '100%' } },
            img(IMGS.img_building, '100%', '100%', { objectFit: 'contain' })
          ),
          // Indications
          div({ class: 'card', style: { padding: '28px', borderLeft: '4px solid #f97316', display: 'flex', flexDirection: 'column', height: '100%' } },
            div({ style: { fontSize: '18px', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '1.25px', marginBottom: '18px', flexShrink: 0 } }, 'INDICATIONS'),
            div({ style: { flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 #f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' } },
              div({ id: 'admin-indications-list', style: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' } },
                ...indications.map(ind =>
                  div({ style: { display: 'flex', alignItems: 'flex-start', gap: '8px' } },
                    div({ style: { width: '5px', height: '5px', borderRadius: '50%', background: '#1a3a6b', marginTop: '6px', flexShrink: 0 } }),
                    div({ style: { fontSize: '17px', color: '#1a3a6b', lineHeight: 1.25 } },
                      span({ style: { fontWeight: 800 } }, ind.bold),
                      ind.rest
                    )
                  )
                )
              )
            )
          )
        )
      );
    }

    // 
    function renderStudentDashboard() {
      const s = STATE.sensors;
      const hi = Math.round(s.heatIndex), temp = Math.round(s.temperature), hum = Math.round(s.humidity);
      const isPub = STATE.screen === 'public';

      const tips = getHeatIndexTips(s.heatIndex);

      const s2 = STATE.mockSensors2;
      const s3 = STATE.mockSensors3;
      const stations = [
        { name: 'STATION 1', heat: hi, temp: temp, hum: hum, aqi: s.airQuality },
        { name: 'STATION 2', heat: Math.round(s2.heatIndex), temp: Math.round(s2.temperature), hum: Math.round(s2.humidity), aqi: s2.airQuality },
        { name: 'STATION 3', heat: Math.round(s3.heatIndex), temp: Math.round(s3.temperature), hum: Math.round(s3.humidity), aqi: s3.airQuality },
      ];

      const tipsCard = div({ class: 'card', style: { padding: '28px', borderLeft: '4px solid #f97316', display: 'flex', flexDirection: 'column', height: '100%' } },
        div({ style: { fontSize: '18px', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '1.25px', marginBottom: '18px', flexShrink: 0 } }, 'TIPS FOR THE DAY:'),
        div({ style: { flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 #f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' } },
          div({ id: 'stu-tips-list', style: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 } },
            ...tips.map(t => div({ style: { fontSize: '18px', color: '#475569', lineHeight: 1.3, flexShrink: 0 } }, t))
          )
        )
      );

      return div({ style: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' } },
        div({ style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
          // Welcome banner
          div({ class: 'card', style: { padding: '28px 28px', background: 'linear-gradient(135deg,#f0fdf4,#dbeafe)', borderColor: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' } },
            div({},
              div({ style: { paddingLeft: '3px', fontFamily: "'Poppins',sans-serif", fontSize: '15px', fontWeight: 550, color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' } }, 'ADMIN DASHBOARD'),
              div({ style: { fontFamily: "'Nunito'", fontSize: 'clamp(24px, 5vw, 35px)', fontWeight: 1000, color: '#0c9ada', lineHeight: 1 } }, 'Good day, Student👋')
            ),
            img(IMGS.img_satellite, 150, 150, { flexShrink: 0, marginRight: '-15px', marginTop: '-28px', marginBottom: '-45px' })
          ),
          // Stations
          ...stations.map((st, i) =>
            div({ style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' } },
              // Left Card (Heat Index)
              div({ class: 'card card-lift', style: { padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
                div({ style: { fontSize: '13px', fontWeight: 800, color: '#1a3a6b', textTransform: 'uppercase', letterSpacing: '1px' } }, st.name),
                div({ style: { fontSize: '15px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginTop: '2px' } }, 'HEAT INDEX'),
                div({ id: `st${i}-heat-val`, style: { fontFamily: "'AC Soft Ice Cream', 'Poppins', sans-serif", letterSpacing: '1px', fontSize: 'clamp(40px, 8vw, 60px)', fontWeight: 550, color: '#1a3a6b', lineHeight: 1, marginTop: '8px' } }, st.heat + '°C'),
              ),
              // Right Card (Bars)
              div({ class: 'card card-lift', style: { padding: '20px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '15px' } },
                // Temp
                div({ style: { display: 'flex', alignItems: 'center', gap: '5px' } },
                  img(IMGS.icon_temp, 28, 28, { objectFit: 'contain' }),
                  div({ style: { flex: 1 } },
                    div({ style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#1a3a6b', marginBottom: '1px', lineHeight: 1 } },
                      span({}, 'Temperature'), span({ id: `st${i}-temp-val` }, st.temp + '°C')
                    ),
                    sensorBar(st.temp, 70, '#e56852', `st${i}-temp`)
                  )
                ),
                // Hum
                div({ style: { display: 'flex', alignItems: 'center', gap: '5px' } },
                  img(IMGS.icon_humidity, 28, 28, { objectFit: 'contain' }),
                  div({ style: { flex: 1 } },
                    div({ style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#1a3a6b', marginBottom: '1px', lineHeight: 1 } },
                      span({}, 'Humidity'), span({ id: `st${i}-hum-val` }, st.hum + '%')
                    ),
                    sensorBar(st.hum, 100, '#8cc63f', `st${i}-hum`)
                  )
                ),
                // Air
                div({ style: { display: 'flex', alignItems: 'center', gap: '5px' } },
                  img(IMGS.icon_air, 28, 28, { objectFit: 'contain' }),
                  div({ style: { flex: 1 } },
                    div({ style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#1a3a6b', marginBottom: '1px', lineHeight: 1 } },
                      span({}, 'Air Quality'), span({ id: `st${i}-aqi-val` }, st.aqi)
                    ),
                    sensorBar(st.aqi, 100, '#4da1e9', `st${i}-aqi`)
                  )
                )
              )
            )
          )
        ),
        // Right column
        div({ style: { display: 'grid', gridTemplateRows: '0.8fr 0.9fr', gap: '14px', height: '100%' } },
          // Building
          div({ class: 'card', style: { padding: 0, overflow: 'hidden', height: '100%' } },
            img(IMGS.img_building, '100%', '100%', { objectFit: 'contain' })
          ),
          tipsCard
        )
      );
    }

    function renderPublicDashboard() {
      const s = STATE.sensors;
      const hi = Math.round(s.heatIndex), temp = Math.round(s.temperature), hum = Math.round(s.humidity);

      const tips = getHeatIndexTips(s.heatIndex);

      const s2 = STATE.mockSensors2;
      const s3 = STATE.mockSensors3;
      const stations = [
        { name: 'STATION 1', heat: hi, temp: temp, hum: hum, aqi: s.airQuality },
        { name: 'STATION 2', heat: Math.round(s2.heatIndex), temp: Math.round(s2.temperature), hum: Math.round(s2.humidity), aqi: s2.airQuality },
        { name: 'STATION 3', heat: Math.round(s3.heatIndex), temp: Math.round(s3.temperature), hum: Math.round(s3.humidity), aqi: s3.airQuality },
      ];

      const tipsCard = div({ class: 'card', style: { padding: '28px', borderLeft: '4px solid #f97316', display: 'flex', flexDirection: 'column', height: '100%' } },
        div({ style: { fontSize: '18px', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '1.25px', marginBottom: '18px', flexShrink: 0 } }, 'TIPS FOR THE DAY:'),
        div({ style: { flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 #f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' } },
          div({ id: 'stu-tips-list', style: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 } },
            ...tips.map(t => div({ style: { fontSize: '18px', color: '#475569', lineHeight: 1.3, flexShrink: 0 } }, t))
          )
        )
      );

      return div({ style: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' } },
        div({ style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
          // Header row
          div({ style: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' } },
            div({ id: 'stu-branding-card', class: 'card', style: { padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)' } },
              // Logo + Name perfectly centered
              div({ class: 'public-branding-inner', style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '25px', width: '100%', padding: '-15px' } },
                img(IMGS.logo_icon, 135, 135, { class: 'public-logo', flexShrink: 0 }),
                div({ style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' } },
                  span({ class: 'public-title', style: { fontFamily: "'Nunito'", fontSize: 'clamp(40px, 8vw, 60px)', fontWeight: 850, lineHeight: 1, textAlign: 'center' } },
                    span({ style: { color: '#23467f' } }, 'TEMP'),
                    span({ style: { color: '#f0a72a' } }, 'GUARD')
                  ),
                  div({ class: 'public-subtitle', style: { fontFamily: "'Nunito'", fontSize: 'clamp(18px, 4vw, 25px)', fontWeight: 700, color: '#0c9ada', lineHeight: 1 } },
                    span({}, 'Environmental Monitoring System')
                  )
                )
              )
            ),
            div({ class: 'card card-lift', style: { padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              clockWidget(true)
            )
          ),
          // Stations
          ...stations.map((st, i) =>
            div({ style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' } },
              // Left Card (Heat Index)
              div({ class: 'card card-lift', style: { padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
                div({ style: { fontSize: '13px', fontWeight: 800, color: '#1a3a6b', textTransform: 'uppercase', letterSpacing: '1px' } }, st.name),
                div({ style: { fontSize: '15px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginTop: '2px' } }, 'HEAT INDEX'),
                div({ id: `st${i}-heat-val`, style: { fontFamily: "'AC Soft Ice Cream', 'Poppins', sans-serif", letterSpacing: '1px', fontSize: 'clamp(40px, 8vw, 60px)', fontWeight: 550, color: '#1a3a6b', lineHeight: 1, marginTop: '8px' } }, st.heat + '°C'),
              ),
              // Right Card (Bars)
              div({ class: 'card card-lift', style: { padding: '28px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '15px' } },
                // Temp
                div({ style: { display: 'flex', alignItems: 'center', gap: '7px' } },
                  img(IMGS.icon_temp, 28, 28, { objectFit: 'contain' }),
                  div({ style: { flex: 1 } },
                    div({ style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#1a3a6b', marginBottom: '1px', lineHeight: 1 } },
                      span({}, 'Temperature'), span({ id: `st${i}-temp-val` }, st.temp + '°C')
                    ),
                    sensorBar(st.temp, 70, '#e56852', `st${i}-temp`)
                  )
                ),
                // Hum
                div({ style: { display: 'flex', alignItems: 'center', gap: '7px' } },
                  img(IMGS.icon_humidity, 28, 28, { objectFit: 'contain' }),
                  div({ style: { flex: 1 } },
                    div({ style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#1a3a6b', marginBottom: '1px', lineHeight: 1 } },
                      span({}, 'Humidity'), span({ id: `st${i}-hum-val` }, st.hum + '%')
                    ),
                    sensorBar(st.hum, 100, '#8cc63f', `st${i}-hum`)
                  )
                ),
                // Air
                div({ style: { display: 'flex', alignItems: 'center', gap: '7px' } },
                  img(IMGS.icon_air, 28, 28, { objectFit: 'contain' }),
                  div({ style: { flex: 1 } },
                    div({ style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#1a3a6b', marginBottom: '1px', lineHeight: 1 } },
                      span({}, 'Air Quality'), span({ id: `st${i}-aqi-val` }, st.aqi)
                    ),
                    sensorBar(st.aqi, 100, '#4da1e9', `st${i}-aqi`)
                  )
                )
              )
            )
          )
        ),
        // Right column
        div({ class: 'public-side', style: { display: 'grid', gridTemplateRows: '0.85fr 0.78fr 0.1fr', gap: '14px', height: '100%' } },
          // Building
          div({ class: 'card', style: { padding: 0, overflow: 'hidden', height: '100%' } },
            img(IMGS.img_building, '100%', '100%', { objectFit: 'contain' })
          ),
          tipsCard,
          btn({ class: 'btn-teal', style: { fontSize: '15px', padding: '8px 40px', letterSpacing: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }, onclick: goBack },
            logoutSvg(), 'EXIT'
          ),
        ),
      );
    }


    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    function renderNotifications() {
      const typeMap = {
        alert: { cls: 'notif-alert', icon: IMGS.icon_notif, bg: 'rgba(254,202,202,0.5)' },
        ok: { cls: 'notif-ok', icon: IMGS.icon_notif, bg: 'rgba(187,247,208,0.5)' },
        admin: { cls: 'notif-admin', icon: IMGS.icon_send, bg: 'rgba(254,243,199,0.5)' },
      };

      function visibleNotifs() {
        const u = STATE.user ? STATE.user.email : '';
        return STATE.notifications.filter(n => !(n.clearedBy || []).includes(u));
      }

      function newCount() {
        const u = STATE.user ? STATE.user.email : '';
        return visibleNotifs().filter(n => !(n.readBy || []).includes(u)).length;
      }

      function updateSidebarBadge() {
        const c = newCount();
        document.querySelectorAll('#notif-sidebar-badge').forEach(b => {
          b.textContent = String(c);
          b.style.display = c > 0 ? 'inline-flex' : 'none';
        });
      }

      function updateCount() {
        const c = document.getElementById('notif-count');
        const vn = visibleNotifs();
        if (c) c.textContent = `There are currently ${vn.length} notification${vn.length !== 1 ? 's' : ''}.`;
      }

      function buildList() {
        const listEl = document.getElementById('notif-list');
        if (!listEl) return;
        listEl.innerHTML = '';
        const vn = visibleNotifs();
        if (!vn.length) {
          listEl.appendChild(div({ style: { padding: '52px', textAlign: 'center', color: '#94a3b8' } },
            img(IMGS.icon_notif, 36, 36, { opacity: .3, marginBottom: '10px', display: 'block', margin: '0 auto 10px' }),
            el('p', {}, 'No notifications yet.')
          ));
          return;
        }
        const u = STATE.user ? STATE.user.email : '';
        const renderArr = (title, items) => {
          if (!items.length) return;
          listEl.appendChild(div({ style: { padding: '12px 24px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' } }, title));
          items.forEach((n, i) => {
            const s = typeMap[n.type] || typeMap.ok;
            const iconFilter = n.type === 'alert' ? 'hue-rotate(200deg) saturate(3)' : n.type === 'ok' ? 'hue-rotate(120deg) saturate(2)' : n.type === 'admin' ? 'hue-rotate(30deg) saturate(2)' : 'none';
            const isNew = !(n.readBy || []).includes(u);
            const newBadge = isNew ? span({ style: { background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, borderRadius: '10px', padding: '2px 7px', marginLeft: '8px', letterSpacing: '.4px', flexShrink: 0 } }, 'NEW') : null;
            const msgDiv = div({ style: { fontSize: '14px', fontWeight: 700, color: '#1a3a6b', display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: '4px' } },
              span({}, n.msg),
              newBadge
            );
            const row = div({
              class: s.cls, style: { display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px', borderBottom: i < items.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', cursor: isNew ? 'pointer' : 'default' },
              onclick: () => { if (isNew) { n.readBy = n.readBy || []; n.readBy.push(u); buildList(); updateCount(); updateSidebarBadge(); } }
            },
              div({ style: { width: '36px', height: '36px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
                img(s.icon, 20, 20, { objectFit: 'contain', filter: iconFilter })
              ),
              div({ style: { flex: 1, minWidth: 0 } },
                msgDiv,
                div({ style: { fontSize: '11px', color: '#94a3b8', marginTop: '2px' } }, n.time),
                n.emailedTo ? div({ style: { fontSize: '11px', color: '#94a3b8', marginTop: '2px' } }, 'Notified: ' + n.emailedTo) : null
              ),
              btn({
                style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#94a3b8', fontFamily: 'inherit', padding: '4px 8px', borderRadius: '6px', flexShrink: 0 },
                onmouseenter: e => { e.target.style.color = '#ef4444'; },
                onmouseleave: e => { e.target.style.color = '#94a3b8'; },
                onclick: (e) => { e.stopPropagation(); n.clearedBy = n.clearedBy || []; n.clearedBy.push(u); buildList(); updateCount(); updateSidebarBadge(); }
              }, 'CLEAR')
            );
            listEl.appendChild(row);
          });
        };

        const announcements = vn.filter(n => n.type === 'admin');
        const systemLogs = vn.filter(n => n.type !== 'admin');
        renderArr('Announcements', announcements);
        renderArr('System Logs & Alerts', systemLogs);
      }

      // expose buildList for in-place refresh from sensor interval
      window._notifBuildList = () => { buildList(); updateCount(); updateSidebarBadge(); };

      const container = div({ class: 'card', style: { height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' } },
        div({ style: { padding: '20px 24px 16px', borderBottom: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', flexShrink: 0 } },
          div({},
            div({ style: { fontFamily: "'Poppins',sans-serif", fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600, color: '#1a3a6b' } }, 'NOTIFICATIONS'),
            div({ id: 'notif-count', style: { fontSize: '13px', color: '#64748b', marginTop: '2px' } })
          ),
          div({ style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
            btn({
              class: 'btn-outline-teal', style: { fontSize: '12px', padding: '9px 18px', letterSpacing: '.8px' }, onclick: () => {
                STATE.notifications.forEach(n => { n.readBy = n.readBy || []; if (!n.readBy.includes(STATE.user ? STATE.user.email : '')) n.readBy.push(STATE.user ? STATE.user.email : ''); });
                buildList(); updateCount(); updateSidebarBadge();
              }
            }, 'MARK ALL AS READ'),
            btn({
              class: 'btn-teal', style: { fontSize: '12px', padding: '9px 18px', letterSpacing: '.8px' }, onclick: () => {
                STATE.notifications.forEach(n => { n.clearedBy = n.clearedBy || []; if (!n.clearedBy.includes(STATE.user ? STATE.user.email : '')) n.clearedBy.push(STATE.user ? STATE.user.email : ''); });
                buildList(); updateCount(); updateSidebarBadge();
              }
            }, 'CLEAR ALL')
          )
        ),
        div({ id: 'notif-list', style: { flex: 1, overflowY: 'auto' } })
      );
      setTimeout(() => { buildList(); updateCount(); updateSidebarBadge(); }, 0);
      return container;
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    function renderHistory() {
  if (!STATE.historyData) STATE.historyData = {};
  if (!STATE.historyActiveStation) {
    STATE.historyActiveStation = 'station_01';
  }

  const activeStation = STATE.historyActiveStation;

  if (!STATE.historyData[activeStation]) {
    STATE.historyData[activeStation] = buildHistorySkeleton();
    STATE.historyActiveDay = 6;
    STATE.historyActiveMetric = 'heatIndex';
  }

  const activeKey = STATE.historyActiveMetric;
  const activeDay = STATE.historyData[activeStation][STATE.historyActiveDay];
  const hourlyData = activeDay.hourly;

  const colors = {
    heatIndex: 'linear-gradient(135deg, #ffb262, #f47037)',   // soft red → muted orange
    temperature: 'linear-gradient(135deg, #baff99, #52d254)', // light green → fresh green
    humidity: 'linear-gradient(135deg, #c2e9ff, #58abe6)'     // soft blue → calm blue
  };
  const activeColor = colors[activeKey];

  // Extract solid colors from gradients for chart consistency
  const solidColors = {
    heatIndex: '#f96129',    // End color of gradient (most prominent)
    temperature: '#52d254',  // End color of gradient (most prominent)
    humidity: '#58abe6'      // End color of gradient (most prominent)
  };
  const activeSolidColor = solidColors[activeKey];

  const tabLabels = { heatIndex: 'Heat Index', temperature: 'Temperature', humidity: 'Humidity' };

  // Top row: Title + Dropdowns
  const headerRow = div({ class: 'history-header-row', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '14px' } },
    div({ style: { flex: '1 1 auto', minWidth: 0, paddingRight: '10px' } },
      div({ style: { fontFamily: "'Poppins',sans-serif", fontSize: 'clamp(14px, 4vw, 20px)', fontWeight: 600, color: '#1a3a6b', textTransform: 'uppercase', whiteSpace: 'nowrap' } }, 'HISTORY LOG'),
      div({ style: { fontSize: 'clamp(10.5px, 2.8vw, 14px)', color: '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.3px' } }, activeDay.fullDate)
    ),
    div({ style: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'nowrap', flex: '1 1 auto', minWidth: 0 } },
      el('select', {
        class: 'field',
        style: { flex: 1, width: '100%', minWidth: 0, padding: '10px 30px 10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600, color: '#1a3a6b', background: '#fff', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="%231a3a6b" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6"></path></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px' },
        onchange: (e) => {
          STATE.historyActiveStation = e.target.value;
          render();
        }
      },
        el('option', activeStation === 'station_01' ? { value: 'station_01', selected: 'selected' } : { value: 'station_01' }, 'Station 1'),
        el('option', activeStation === 'station_02' ? { value: 'station_02', selected: 'selected' } : { value: 'station_02' }, 'Station 2'),
        el('option', activeStation === 'station_03' ? { value: 'station_03', selected: 'selected' } : { value: 'station_03' }, 'Station 3')
      ),
      el('select', {
        class: 'field',
        style: { flex: 1, width: '100%', minWidth: 0, padding: '10px 30px 10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600, color: '#1a3a6b', background: '#fff', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="%231a3a6b" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6"></path></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px' },
        onchange: (e) => {
          STATE.historyActiveMetric = e.target.value;
          render();
        }
      },
        el('option', activeKey === 'heatIndex' ? { value: 'heatIndex', selected: 'selected' } : { value: 'heatIndex' }, 'Heat Index'),
        el('option', activeKey === 'temperature' ? { value: 'temperature', selected: 'selected' } : { value: 'temperature' }, 'Temperature'),
        el('option', activeKey === 'humidity' ? { value: 'humidity', selected: 'selected' } : { value: 'humidity' }, 'Humidity')
      )
    )
  );

  // Day selection row
  const daysRow = div({ class: 'resp-history-days', style: { display: 'flex', gap: '12px', marginBottom: '0px', justifyContent: 'space-between', overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: '10px' } },
    ...STATE.historyData[activeStation].map((d, i) => {
      const isA = i === STATE.historyActiveDay;
      return div({
        class: 'card',
        style: {
          flex: 1,
          padding: '10px 0',
          textAlign: 'center',
          cursor: 'pointer',
          background: isA ? activeColor : '#fff',
          border: '2px solid',
          borderColor: isA ? '#ffffff' : '#e2e8f0',
          transition: 'all 0.2s',
          boxShadow: isA ? `0 4px 12px ${activeSolidColor}44` : 'none'  // ✅ Updated to use solid color
        },
        onclick: () => { STATE.historyActiveDay = i; render(); }
      },
        div({ style: { minWidth: '65px', fontSize: '11px', fontWeight: 800, color: isA ? 'rgba(255,255,255,0.9)' : '#94a3b8', letterSpacing: '1px' } }, d.dayShort),
        div({ style: { fontSize: '18px', fontWeight: 850, fontFamily: "'Nunito", color: isA ? '#fff' : '#1a3a6b', margin: '0', lineHeight: 1.1 } }, d.dayNum),
        div({ style: { fontSize: '10px', color: isA ? 'rgba(255,255,255,0.9)' : '#94a3b8' } }, d.monthShort),
        isA ? div({ style: { width: '4px', height: '4px', borderRadius: '50%', background: '#fff', margin: '2px auto 0' } }) : null
      );
    })
  );

  // Chart - Pass the active solid color
  const chartContainer = div({ class: 'history-chart-container resp-chart-container', style: { width: '100%', flex: 1, minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' } });
  chartContainer.appendChild(buildAreaChart(hourlyData, activeKey, activeSolidColor));  // ✅ Pass solid color to chart

  // Statistics
  const values = hourlyData.map(h => h[activeKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const peakItem = hourlyData.find(h => h[activeKey] === max) || hourlyData[0];
  const unit = activeKey === 'humidity' ? '%' : '°C';

  const statCards = div({ class: 'history-stats-row', style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '20px' } },
    div({ class: 'card', style: { padding: '10px 16px', background: '#fff5ec', border: '1px solid #ffdbb5' } },
      div({ style: { fontSize: '12px', fontWeight: 800, color: '#f97316', letterSpacing: '1px', textTransform: 'uppercase' } }, 'MIN'),
      div({ style: { fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 850, fontFamily: "'Nunito", color: '#1a3a6b', margin: '0' } }, min + unit),
      div({ style: { fontSize: '11px', color: '#94a3b8' } }, 'lowest')
    ),
    div({ class: 'card', style: { padding: '10px 16px', background: '#ddffcd', border: '1px solid #b6f09b' } },
      div({ style: { fontSize: '12px', fontWeight: 800, color: '#22c55e', letterSpacing: '1px', textTransform: 'uppercase' } }, 'AVG'),
      div({ style: { fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 850, fontFamily: "'Nunito", color: '#1a3a6b', margin: '0' } }, avg + unit),
      div({ style: { fontSize: '11px', color: '#94a3b8' } }, 'average')
    ),
    div({ class: 'card', style: { padding: '10px 16px', background: '#e4f5ff', border: '1px solid #abd7f0' } },
      div({ style: { fontSize: '12px', fontWeight: 800, color: '#0ea5e9', letterSpacing: '1px', textTransform: 'uppercase' } }, 'PEAK'),
      div({ style: { fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 850, fontFamily: "'Nunito", color: '#1a3a6b', margin: '0' } }, max + unit),
      div({ style: { fontSize: '11px', color: '#94a3b8' } }, peakItem.time)
    )
  );

  const container = div({ class: 'card', style: { height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', padding: '28px 36px', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' } },
    headerRow,
    daysRow,
    chartContainer,
    statCards
  );

  return container;
}

    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    function renderManagement() {

      const msgArea = el('textarea', { class: 'field', placeholder: 'Type your announcement here...', style: { height: '500px', width: '100%' } });

      return div({ style: { height: '100%', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '14px' } },
        // Announcement
        div({ class: 'card', style: { padding: '28px', width: '100%' } },
          div({ style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' } },
            div({ style: { width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(6,182,212,0.1)', border: '1.5px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              img(IMGS.icon_send, 20, 20, { objectFit: 'contain' })
            ),
            div({},
              div({ style: { fontSize: '15px', fontWeight: 800, color: '#1a3a6b', textTransform: 'uppercase' } }, 'Send Announcement'),
              div({ style: { fontSize: '12px', color: '#64748b' } }, 'Delivered to all students via system alerts')
            )
          ),
          msgArea,
          btn({
            class: 'btn-teal', style: { width: '100%', marginTop: '14px', fontSize: '14px', letterSpacing: '1.1px' }, onclick: () => {
              const msg = msgArea.value.trim();
              if (!msg) { pushToast('error', 'Message is empty'); return; }
              const students = STATE.users.filter(u => u.role === 'student');
              const time = fmtTimeShort(new Date());
              const emailedTo = students.map(s => s.email).join(', ') || 'no students registered';
              STATE.notifications = [{ id: Date.now(), type: 'admin', msg, time, emailedTo, isNew: true }, ...STATE.notifications];
              const logs = students.length ? students.map(s => `Email -> ${s.email}: "${msg.slice(0, 70)}${msg.length > 70 ? '...' : ''}"`) : ['No student accounts to notify yet.'];
              STATE.emailLog = [...STATE.emailLog, ...logs];
              pushToast('success', 'Announcement sent', `Delivered to ${students.length} student(s)`);
              msgArea.value = '';
              refreshEmailLog();
              refreshSidebarBadge();
            }
          }, 'BROADCAST TO ALL STUDENTS')
        ),
      );
    }

    // 
    function render() {
      document.body.style.overflow = '';
      const root = document.getElementById('root');
      root.innerHTML = '';

      if (STATE.screen === 'landing') { root.appendChild(renderLanding()); return; }
      if (STATE.screen === 'login') { root.appendChild(renderLogin()); return; }

      // Public view student dashboard kiosk, no top bar, full height stretch
      if (STATE.screen === 'public') {
        const publicMain = el('main', { style: { flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto', position: 'relative', zIndex: 1, backgroundImage: `url(${IMGS.bg_grid})`, backgroundSize: 'cover', backgroundPosition: 'center bottom', backgroundAttachment: 'local' } },
          div({ class: 'fade-up', style: { width: '100%', display: 'flex', flexDirection: 'column', zoom: '0.9', margin: 'auto 0' } }, renderPublicDashboard())
        );
        const publicApp = div({ class: 'sky-bg', style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundImage: `url(${IMGS.bg_main})`, backgroundSize: 'cover', backgroundPosition: 'center top' } },
          publicMain
        );
        const toastWrap = div({ id: 'toast-wrap', class: 'toast-wrap' });
        root.appendChild(publicApp);
        root.appendChild(toastWrap);
        if (STATE.clockInterval) clearInterval(STATE.clockInterval);
        STATE.clockInterval = setInterval(updateClock, 1000);
        return;
      }

      // App shell
      const sidebar = buildSidebar();
      let pageContent;
      if (STATE.page === 'dashboard') {
        pageContent = STATE.user.role === 'admin' ? renderAdminDashboard() : renderStudentDashboard();
      } else if (STATE.page === 'notifications') {
        pageContent = renderNotifications();
      } else if (STATE.page === 'history') {
        pageContent = renderHistory();
      } else if (STATE.page === 'management') {
        pageContent = STATE.user.role === 'admin' ? renderManagement() :
          div({ class: 'card', style: { padding: '60px', textAlign: 'center', color: '#94a3b8' } }, 'Access restricted to administrators only.');
      }

      const main = el('main', { style: { flex: 1, padding: '20px 24px', overflowY: 'auto', position: 'relative', zIndex: 1, backgroundImage: `url(${IMGS.bg_grid})`, backgroundSize: 'cover', backgroundPosition: 'center bottom', backgroundAttachment: 'local', display: 'flex', flexDirection: 'column' } },
        div({ class: 'fade-up', style: { flex: 1, display: 'flex', flexDirection: 'column' } }, pageContent)
      );

      if (window.innerWidth <= 768 && STATE.sidebarOpen) {
        document.body.style.overflow = 'hidden';
      }

      const hamburger = btn({
        class: 'mobile-hamburger',
        onclick: () => { STATE.sidebarOpen = true; render(); },
        'aria-label': 'Open Menu'
      }, svgIcon(['M3 12h18', 'M3 6h18', 'M3 18h18'], 24, '#1a3a6b'));

      const overlay = div({
        class: `sidebar-overlay ${STATE.sidebarOpen ? 'overlay-open' : ''}`,
        onclick: () => { STATE.sidebarOpen = false; render(); }
      });

      const app = div({ class: 'sky-bg', style: { display: 'flex', minHeight: '100vh', backgroundImage: `url(${IMGS.bg_main})`, backgroundSize: 'cover', backgroundPosition: 'center top' } },
        overlay, hamburger, sidebar, main
      );
      const toastWrap = div({ id: 'toast-wrap', class: 'toast-wrap' });
      root.appendChild(app);
      root.appendChild(toastWrap);

      // Start clock updates
      if (STATE.clockInterval) clearInterval(STATE.clockInterval);
      STATE.clockInterval = setInterval(updateClock, 1000);
    }


// ==========================================
// 5. Event Listeners & Navigation
// ==========================================
    // 
    function navigate(page) { STATE.page = page; render(); }
    function goLogin(role) { STATE.preRole = role; STATE.screen = 'login'; render(); }
    function goPublic() { STATE.screen = 'public'; STATE.page = 'dashboard'; startSensors(); render(); }
    function goBack() { STATE.screen = 'landing'; STATE.page = 'dashboard'; if (STATE.sensorInterval) clearInterval(STATE.sensorInterval); if (STATE.clockInterval) clearInterval(STATE.clockInterval); render(); }
    function doLogin(u) { STATE.user = u; STATE.screen = 'app'; STATE.page = 'dashboard'; startSensors(); render(); }
    function doLogout() { STATE.user = null; STATE.screen = 'landing'; STATE.page = 'dashboard'; if (STATE.sensorInterval) clearInterval(STATE.sensorInterval); if (STATE.clockInterval) clearInterval(STATE.clockInterval); render(); }

    // 
    function startSensors() {
      if (STATE.sensorInterval) clearInterval(STATE.sensorInterval);
      STATE.sensorInterval = setInterval(() => {
        // Only mutate mock sensors to keep visuals alive for incomplete prototypes
        const s2 = STATE.mockSensors2;
        STATE.mockSensors2 = {
          ...s2,
          heatIndex: +Math.max(24, Math.min(40, s2.heatIndex + (Math.random() - .45) * .6)).toFixed(1),
          temperature: +Math.max(22, Math.min(38, s2.temperature + (Math.random() - .45) * .5)).toFixed(1),
          humidity: +Math.max(40, Math.min(95, s2.humidity + (Math.random() - .5) * .4)).toFixed(1),
          airQuality: +Math.max(20, Math.min(150, s2.airQuality + (Math.random() - .5) * 1)).toFixed(0),
        };
        const s3 = STATE.mockSensors3;
        STATE.mockSensors3 = {
          ...s3,
          heatIndex: +Math.max(24, Math.min(40, s3.heatIndex + (Math.random() - .45) * .6)).toFixed(1),
          temperature: +Math.max(22, Math.min(38, s3.temperature + (Math.random() - .45) * .5)).toFixed(1),
          humidity: +Math.max(40, Math.min(95, s3.humidity + (Math.random() - .5) * .4)).toFixed(1),
          airQuality: +Math.max(20, Math.min(150, s3.airQuality + (Math.random() - .5) * 1)).toFixed(0),
        };

        // Log to history
        const meta = getHeatMeta(STATE.sensors.heatIndex);
        const status = meta.label === 'COMFORTABLE' || meta.label === 'WARM' ? 'Normal' : meta.label === 'VERY HOT' ? 'Very Hot' : 'Dangerous';
        STATE.histLog = [{ id: ++STATE.histIdCounter, datetime: fmtDateFull(new Date()), heat: Math.round(STATE.sensors.heatIndex) + '°C', status }, ...STATE.histLog.slice(0, 99)];

        // Auto alert
        const isHot = meta.label === 'VERY HOT' || meta.label === 'DANGER';
        if (isHot && !STATE.heatAlerted) {
          STATE.heatAlerted = true;
          const time = fmtTimeShort(new Date());
          STATE.notifications = [
            { id: Date.now(), type: 'alert', msg: `System Alert - Heat Index (${Math.round(STATE.sensors.heatIndex)}°C): ${meta.label}`, time, isNew: true },
            ...STATE.notifications
          ];
          const students = STATE.users.filter(u => u.role === 'student');
          STATE.emailLog = [...STATE.emailLog, ...students.map(s => `Email -> ${s.email}: [!] HIGH HEAT WARNING” Stay hydrated, avoid sun, rest when needed`)];
          pushToast('error', '[!] High Heat Alert', `Heat Index ${Math.round(STATE.sensors.heatIndex)}°C ”`);
        } else if (!isHot && STATE.heatAlerted) {
          STATE.heatAlerted = false;
          STATE.notifications = [{ id: Date.now(), type: 'ok', msg: 'Conditions Returned To Normal', time: fmtTimeShort(new Date()), isNew: true }, ...STATE.notifications];
        }

        // Re-render admin dashboard (has live chart); update student in-place
        if (STATE.page === 'dashboard') {
          if (STATE.user && STATE.user.role === 'admin') render();
          else updateSensorDisplays();
        } else {
          updateSensorDisplays();
        }
        // If on notifications page, refresh the list in-place
        if (STATE.page === 'notifications' && window._notifBuildList) window._notifBuildList();

        refreshSidebarBadge();
      }, 5000);
    }

    function refreshSidebarBadge() {
      const u = STATE.user ? STATE.user.email : '';
      const visibleNotifs = STATE.notifications.filter(n => !(n.clearedBy || []).includes(u));
      const newCount = visibleNotifs.filter(n => !(n.readBy || []).includes(u)).length;
      document.querySelectorAll('#notif-sidebar-badge').forEach(b => {
        b.textContent = String(newCount);
        b.style.display = newCount > 0 ? 'inline-flex' : 'none';
      });
    }

    function updateSensorDisplays() {
      const s = STATE.sensors;
      const s2 = STATE.mockSensors2;
      const s3 = STATE.mockSensors3;

      const stations = [
        { heat: Math.round(s.heatIndex), temp: Math.round(s.temperature), hum: Math.round(s.humidity), aqi: s.airQuality },
        { heat: Math.round(s2.heatIndex), temp: Math.round(s2.temperature), hum: Math.round(s2.humidity), aqi: s2.airQuality },
        { heat: Math.round(s3.heatIndex), temp: Math.round(s3.temperature), hum: Math.round(s3.humidity), aqi: s3.airQuality }
      ];

      const setVal = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
      const setBar = (id, value, max) => {
        const fill = document.getElementById(id + '-fill');
        if (fill) fill.style.width = Math.min(100, (value / max) * 100).toFixed(1) + '%';
      };

      // Update stations (0 to 2)
      for (let i = 0; i < 3; i++) {
        const st = stations[i];
        setVal(`st${i}-heat-val`, st.heat + '°C');
        setVal(`st${i}-temp-val`, st.temp + '°C');
        setVal(`st${i}-hum-val`, st.hum + '%');
        setVal(`st${i}-aqi-val`, st.aqi);

        setBar(`st${i}-temp`, st.temp, 70);
        setBar(`st${i}-hum`, st.hum, 100);
        setBar(`st${i}-aqi`, st.aqi, 100);
      }

      // Tips (Student & Public)
      const tips = getHeatIndexTips(s.heatIndex);
      const tipsList = document.getElementById('stu-tips-list');
      if (tipsList) {
        tipsList.innerHTML = '';
        tips.forEach(t => {
          const d = document.createElement('div');
          d.style.cssText = 'font-size:18px;color:#475569;line-height:1.3';
          d.textContent = t;
          tipsList.appendChild(d);
        });
      }
    }


// ==========================================
// 6. Initialization / Startup Code
// ==========================================
// --- Responsive Enhancements ---
(function setupResponsive() {
  function applyClasses() {
    document.querySelectorAll('div, main, aside').forEach(el => {
      const gtc = el.style.gridTemplateColumns || '';
      const gtr = el.style.gridTemplateRows || '';

      if (gtc === '2fr 1fr') el.classList.add('resp-grid-admin');
      if (gtr === '38% 28% 28%' || gtr === '42% 28% 28%') el.classList.add('resp-grid-student');
      if (gtc === '2.3fr 1fr 1.5fr') el.classList.add('resp-grid-student-top');
      if (gtc.includes('repeat(4')) el.classList.add('resp-grid-sensor-cards');
      if (gtc.includes('1fr 1fr 2fr')) el.classList.add('resp-grid-student-bottom');
      if (gtc === '1fr 1fr') el.classList.add('resp-grid-half');
      if (gtc === '1fr 1fr 1fr' || gtc.includes('repeat(3')) el.classList.add('resp-grid-third');

      if (el.style.display === 'flex' && el.style.justifyContent === 'space-between' && el.style.gap === '12px' && el.children.length === 7) {
        el.classList.add('resp-history-days');
      }
    });

    document.querySelectorAll('svg[preserveAspectRatio="none"]').forEach(svg => {
      if (svg.parentElement) svg.parentElement.classList.add('resp-chart-container');
    });

    document.querySelectorAll('img[src*="school.png"]').forEach(img => {
      const card = img.closest('.card');
      if (card) card.classList.add('resp-school-card');
    });
  }

  let lastWidth = window.innerWidth;
  function handleResize() {
    if (window.innerWidth <= 768 && lastWidth > 768 && window.STATE && window.STATE.sidebarOpen) {
      window.STATE.sidebarOpen = false;
      if (typeof render === 'function') render();
    } else if (window.innerWidth > 768 && lastWidth <= 768 && window.STATE && !window.STATE.sidebarOpen) {
      window.STATE.sidebarOpen = true;
      if (typeof render === 'function') render();
    }
    lastWidth = window.innerWidth;
  }

  const observer = new MutationObserver(applyClasses);
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
    applyClasses();
    handleResize();
  });
  window.addEventListener('resize', handleResize);
})();
    // 🔥 ATTACH REALTIME LISTENER AFTER DOM INIT AND ALL CONSTANTS ARE DECLARED
    const rootRef = ref(db, "/");
    onValue(rootRef, (snapshot) => {
      const data = snapshot.val();
      console.log("FIREBASE DATA:", data);

      if (!data) {
        console.log("Firebase initialized but returned empty snapshot. Loading visual mockups instead.");
      } else {
        const updateState = (stData, stState) => {
          if (!stData) return;
          const hi = stData.heatIndex ?? stData.heatindex ?? stData.HeatIndex;
          const t = stData.temperature ?? stData.Temperature ?? stData.temp;
          const h = stData.humidity ?? stData.Humidity ?? stData.hum;
          const aq = stData.airQuality ?? stData.airquality ?? stData.AirQuality ?? stData.aqi;

          if (hi !== undefined) stState.heatIndex = Number(hi);
          if (t !== undefined) stState.temperature = Number(t);
          if (h !== undefined) stState.humidity = Number(h);
          if (aq !== undefined) stState.airQuality = Number(aq);
        };

        updateState(data.Station1, STATE.sensors);
        updateState(data.Station2, STATE.mockSensors2);
        updateState(data.Station3, STATE.mockSensors3);

        if (data.averages) {
          parseFirebaseHistory(data.averages);
        }
      }
      render(); // 🔄 update UI with incoming data
    });
    document.addEventListener('DOMContentLoaded', () => {
      render();
    });
  

