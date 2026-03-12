/**
 * NEXUS WEATHER PRO - ENTERPRISE EDITION 2026
 * Versão Restaurada com Marcadores de Mapa e Traduções Globais
 */

const TRANSLATIONS = {
  pt: {
    searchPlaceholder: "Pesquisar cidade...",
    feelsLike: "Sente-se como",
    uvIndex: "UV",
    humidity: "Humidade",
    wind: "Vento",
    today: "Hoje",
    forecastTitle: "Previsão Semanal",
    rainTitle: "Precipitação",
    mapTitle: "Radar Meteorológico",
    exploreTitle: "Explorar Mundo",
    settingsTitle: "Definições",
    langLabel: "Idioma",
    unitLabel: "Unidade de Medida",
    exportBtn: "Exportar Dados (.csv)",
    cityNotFound: "Cidade não encontrada",
    locError: "Erro ao obter localização",
  },
  en: {
    searchPlaceholder: "Search city...",
    feelsLike: "Feels like",
    uvIndex: "UV",
    humidity: "Humidity",
    wind: "Wind",
    today: "Today",
    forecastTitle: "Weekly Forecast",
    rainTitle: "Precipitation",
    mapTitle: "Weather Radar",
    exploreTitle: "Explore World",
    settingsTitle: "Settings",
    langLabel: "Language",
    unitLabel: "Measurement Unit",
    exportBtn: "Export Data (.csv)",
    cityNotFound: "City not found",
    locError: "Error getting location",
  },
};

const CONFIG = {
  GEO_API: "https://geocoding-api.open-meteo.com/v1/search",
  WEATHER_API: "https://api.open-meteo.com/v1/forecast",
  DEFAULT_CITY: "Coimbra",
  MAP_TILES: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  MAP_ATTRIBUTION: "&copy; OpenStreetMap",
  // Cidades importantes com tradução
  GLOBAL_RADAR: [
    { name: { pt: "Londres", en: "London" }, lat: 51.5074, lon: -0.1278 },
    { name: { pt: "Nova Iorque", en: "New York" }, lat: 40.7128, lon: -74.006 },
    { name: { pt: "Tóquio", en: "Tokyo" }, lat: 35.6895, lon: 139.6917 },
    { name: { pt: "Dubai", en: "Dubai" }, lat: 25.2048, lon: 55.2708 },
    { name: { pt: "Lisboa", en: "Lisbon" }, lat: 38.7223, lon: -9.1393 },
    { name: { pt: "Paris", en: "Paris" }, lat: 48.8566, lon: 2.3522 },
  ],
  WEATHER_MAP: {
    0: {
      icon: "sun",
      text: { pt: "Céu Limpo", en: "Clear Sky" },
      video: "clear",
    },
    1: {
      icon: "cloud-sun",
      text: { pt: "Quase Limpo", en: "Mostly Clear" },
      video: "clouds",
    },
    3: {
      icon: "cloud",
      text: { pt: "Nublado", en: "Cloudy" },
      video: "clouds",
    },
    63: {
      icon: "cloud-rain",
      text: { pt: "Chuva", en: "Rain" },
      video: "rain",
    },
    95: {
      icon: "cloud-lightning",
      text: { pt: "Trovoada", en: "Storm" },
      video: "storm",
    },
  },
  VIDEOS: {
    clear:
      "https://res.cloudinary.com/dduvsy3un/video/upload/v1710274200/sunny_test.mp4",
    clouds:
      "https://res.cloudinary.com/dduvsy3un/video/upload/v1710274200/clouds_test.mp4",
    rain: "https://res.cloudinary.com/dduvsy3un/video/upload/v1710274200/rain_test.mp4",
    storm:
      "https://res.cloudinary.com/dduvsy3un/video/upload/v1710274200/storm_test.mp4",
  },
};

const AppState = {
  weatherData: null,
  rainChart: null,
  map: null,
  markersGroup: null, // Grupo para limpar marcadores antigos
  lang: localStorage.getItem("lang") || "pt",
  units: localStorage.getItem("units") || "celsius",
  currentCityName: CONFIG.DEFAULT_CITY,
  currentCountry: "",
};

const UI = {
  t(key) {
    return TRANSLATIONS[AppState.lang][key];
  },

  convert(tempC) {
    if (AppState.units === "fahrenheit")
      return Math.round((tempC * 9) / 5 + 32);
    return Math.round(tempC);
  },

  getUnitSymbol() {
    return AppState.units === "celsius" ? "°C" : "°F";
  },

  updateLabels() {
    document.getElementById("cityInput").placeholder =
      this.t("searchPlaceholder");
    document.getElementById("labelForecast").innerText =
      this.t("forecastTitle");
    document.getElementById("labelRain").innerText = this.t("rainTitle");
    document.getElementById("labelMap").innerText = this.t("mapTitle");
    document.getElementById("labelExplore").innerText = this.t("exploreTitle");
    document.querySelector(".sidebar-header h1").innerHTML =
      `Nexus<span>${this.t("settingsTitle")}</span>`;
    document.getElementById("btnExport").innerHTML =
      `<i data-lucide="download"></i> ${this.t("exportBtn")}`;
    lucide.createIcons();
  },

  renderCurrent(data, name, country) {
    const current = data.current;
    const config =
      CONFIG.WEATHER_MAP[current.weather_code] || CONFIG.WEATHER_MAP[0];
    const content = document.querySelector("#currentWeather .weather-content");

    content.innerHTML = `
      <div class="weather-animate-in">
        <p style="color: rgba(255,255,255,0.8); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 2px;">${country || ""}</p>
        <h2 style="font-size: 2.5rem; font-weight: 800; color: white; margin-bottom: 0.5rem;">${name}</h2>
        <div class="weather-badges">
          <div class="badge"><i data-lucide="thermometer"></i> ${this.t("feelsLike")} ${this.convert(current.apparent_temperature)}${this.getUnitSymbol()}</div>
          <div class="badge"><i data-lucide="sun"></i> ${this.t("uvIndex")}: ${data.hourly.uv_index[0].toFixed(1)}</div>
        </div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin: 1.5rem 0;">
          <i data-lucide="${config.icon}" style="width: 60px; height: 60px; color: white;"></i>
          <span id="temp-display" style="font-size: 5rem; font-weight: 800; color: white;">0${this.getUnitSymbol()}</span>
        </div>
        <p style="font-size: 1.4rem; color: white; font-weight: 500;">${config.text[AppState.lang]}</p>
      </div>
    `;
    lucide.createIcons();
    this.animateValue(
      "temp-display",
      0,
      this.convert(current.temperature_2m),
      1000,
      this.getUnitSymbol(),
    );
    this.updateVideo(current.weather_code);
  },

  updateVideo(code) {
    const videoEl = document.getElementById("weatherVideo");
    const config = CONFIG.WEATHER_MAP[code] || CONFIG.WEATHER_MAP[0];
    videoEl.src = CONFIG.VIDEOS[config.video];
    videoEl.play();
    videoEl.style.opacity = 1;
  },

  animateValue(id, start, end, duration, suffix) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = Math.floor(progress * (end - start) + start) + suffix;
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  },
};

const App = {
  async init() {
    this.bindEvents();
    UI.updateLabels();
    this.renderSampleCities();
    await this.performSearch(CONFIG.DEFAULT_CITY);
  },

  bindEvents() {
    // Menu
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    document.getElementById("menuToggle").onclick = () => {
      sidebar.classList.add("active");
      overlay.classList.add("active");
    };
    document.getElementById("closeMenu").onclick = () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    };
    overlay.onclick = () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    };

    // Idioma
    document.getElementById("langSelect").addEventListener("change", (e) => {
      AppState.lang = e.target.value;
      localStorage.setItem("lang", AppState.lang);
      UI.updateLabels();
      this.renderSampleCities(); // Atualiza a lista à direita
      if (AppState.weatherData) this.performSearch(AppState.currentCityName); // Traduz o nome da cidade atual
    });

    // Unidades
    document.getElementById("unitSelect").addEventListener("change", (e) => {
      AppState.units = e.target.value;
      localStorage.setItem("units", AppState.units);
      this.refreshUI();
    });

    // Tema
    document.getElementById("theme-toggle").onchange = (e) => {
      document.body.classList.toggle("dark", e.target.checked);
      localStorage.setItem("theme", e.target.checked ? "dark" : "light");
    };

    // Pesquisa
    document.getElementById("cityInput").onkeydown = (e) => {
      if (e.key === "Enter") this.performSearch(e.target.value);
    };
  },

  async performSearch(city) {
    try {
      // Passamos a linguagem para a API para receber nomes traduzidos
      const res = await fetch(
        `${CONFIG.GEO_API}?name=${encodeURIComponent(city)}&count=1&language=${AppState.lang}&format=json`,
      );
      const data = await res.json();
      if (!data.results) return;
      const geo = data.results[0];
      AppState.currentCityName = geo.name;
      AppState.currentCountry = geo.country;
      await this.loadData(geo.latitude, geo.longitude);
    } catch (e) {
      console.error("Erro na busca");
    }
  },

  async loadData(lat, lon) {
    const res = await fetch(
      `${CONFIG.WEATHER_API}?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,apparent_temperature&hourly=precipitation_probability,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`,
    );
    AppState.weatherData = await res.json();
    this.refreshUI();
    this.updateMap(lat, lon);
  },

  refreshUI() {
    UI.renderCurrent(
      AppState.weatherData,
      AppState.currentCityName,
      AppState.currentCountry,
    );
    UI.renderForecast(AppState.weatherData.daily);
    this.initChart(0);
  },

  initChart(dayIndex) {
    const ctx = document.getElementById("rainChart").getContext("2d");
    if (AppState.rainChart) AppState.rainChart.destroy();

    const start = dayIndex * 24;
    const data = AppState.weatherData.hourly.precipitation_probability.slice(
      start,
      start + 24,
    );

    // Criamos 24 labels (uma para cada hora) para evitar o "undefined"
    const labels = Array.from(
      { length: 24 },
      (_, i) => `${i.toString().padStart(2, "0")}h`,
    );

    AppState.rainChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels, // Agora temos 24 labels exatas
        datasets: [
          {
            data: data,
            borderColor: "#0a84ff",
            backgroundColor: "rgba(10,132,255,0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: "#0a84ff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              // Garante que o tooltip também não diga undefined
              title: (items) => `Hora: ${items[0].label}`,
              label: (item) => ` Chuva: ${item.parsed.y}%`,
            },
          },
        },
        layout: { padding: { left: 10, right: 20, bottom: 10, top: 20 } },
        scales: {
          x: {
            display: true,
            grid: { display: false },
            ticks: {
              color: "#86868b",
              font: { size: 10 },
              // Esta função limpa o gráfico: só mostra a hora se for par (00h, 02h...)
              callback: function (value, index) {
                return index % 2 === 0 ? this.getLabelForValue(value) : "";
              },
            },
          },
          y: {
            display: true,
            min: 0,
            max: 100,
            ticks: {
              color: "#86868b",
              font: { size: 10 },
              stepSize: 25,
              callback: (value) => value + "%",
            },
            grid: { color: "rgba(134, 134, 139, 0.1)", drawBorder: false },
          },
        },
      },
    });
  },

  async updateMap(lat, lon) {
    if (!AppState.map) {
      AppState.map = L.map("map", { zoomControl: false }).setView(
        [lat, lon],
        5,
      );
      L.tileLayer(CONFIG.MAP_TILES).addTo(AppState.map);
      AppState.markersGroup = L.layerGroup().addTo(AppState.map);
    }

    AppState.markersGroup.clearLayers();
    AppState.map.flyTo([lat, lon], 8);

    // 1. Marcador da cidade principal (Pesquisada)
    L.marker([lat, lon])
      .addTo(AppState.markersGroup)
      .bindPopup(`<b>${AppState.currentCityName}</b>`)
      .openPopup();

    // 2. Marcadores Dinâmicos para Cidades Globais
    CONFIG.GLOBAL_RADAR.forEach(async (city) => {
      try {
        // Pedimos a temperatura E o código do tempo
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code`,
        );
        const weather = await response.json();

        const temp = UI.convert(weather.current.temperature_2m);
        const code = weather.current.weather_code;
        const config = CONFIG.WEATHER_MAP[code] || CONFIG.WEATHER_MAP[0];
        const cityName = city.name[AppState.lang];

        // Criamos o HTML do ícone com Lucide (ou uma biblioteca de ícones)
        // Nota: Usamos o nome do ícone da Lucide que já tens no WEATHER_MAP
        const tempIcon = L.divIcon({
          className: "custom-div-icon",
          html: `
          <div class="map-temp-badge">
            <div class="map-icon-wrapper">
               <i data-lucide="${config.icon}"></i>
            </div>
            <div class="map-info-wrapper">
               <span class="map-city-name">${cityName}</span>
               <span class="map-temp-value">${temp}°</span>
            </div>
          </div>`,
          iconSize: [120, 45],
          iconAnchor: [60, 22],
        });

        const marker = L.marker([city.lat, city.lon], { icon: tempIcon }).addTo(
          AppState.markersGroup,
        );

        // Ao clicar, faz a pesquisa completa dessa cidade
        marker.on("click", () => this.performSearch(cityName));

        // Forçamos o Lucide a renderizar os novos ícones inseridos no mapa
        lucide.createIcons();
      } catch (e) {
        console.error("Erro no marcador dinâmico:", e);
      }
    });

    setTimeout(() => AppState.map.invalidateSize(), 400);
  },

  renderSampleCities() {
    document.getElementById("sampleCities").innerHTML = CONFIG.GLOBAL_RADAR.map(
      (city) => {
        const name = city.name[AppState.lang];
        return `
      <div class="sample-city-card" onclick="App.performSearch('${name}')">
        <span class="city-name">${name}</span>
        <i data-lucide="arrow-right" style="width:14px"></i>
      </div>`;
      },
    ).join("");
    lucide.createIcons();
  },
};

// Funções de Previsão que faltavam no UI original do AppState
UI.renderForecast = function (daily) {
  document.getElementById("forecast").innerHTML = daily.time
    .map((date, i) => {
      const dayName =
        i === 0
          ? UI.t("today")
          : new Date(date).toLocaleDateString(AppState.lang, {
              weekday: "short",
            });
      const state =
        CONFIG.WEATHER_MAP[daily.weather_code[i]] || CONFIG.WEATHER_MAP[0];
      return `
    <div class="forecast-card ${i === 0 ? "active" : ""}" onclick="App.changeFocusDay(${i}, this)">
      <span style="font-size: 0.8rem;">${dayName}</span>
      <i data-lucide="${state.icon}"></i>
      <span style="font-weight: 700;">${UI.convert(daily.temperature_2m_max[i])}°</span>
    </div>`;
    })
    .join("");
  lucide.createIcons();
};

App.changeFocusDay = function (index, el) {
  document
    .querySelectorAll(".forecast-card")
    .forEach((c) => c.classList.remove("active"));
  el.classList.add("active");
  this.initChart(index);
};

App.init();
