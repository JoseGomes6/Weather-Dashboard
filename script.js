const API_KEY = "5b3c44165aac48c38ab234840250911";

const cityInput = document.getElementById("cityInput");
const currentWeather = document.getElementById("currentWeather");
const forecast = document.getElementById("forecast");
const chartCtx = document.getElementById("rainChart").getContext("2d");
const sampleCitiesContainer = document.getElementById("sampleCities");
const themeToggle = document.getElementById("theme-toggle");

let rainChart;
let forecastGlobal = [];
let currentCityData = null;

themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", themeToggle.checked);
});

async function fetchWeather(city) {
  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=6&lang=en`
    );
    const data = await res.json();
    currentCityData = data;
    forecastGlobal = data.forecast.forecastday;
    showWeather(data);
  } catch (err) {
    currentWeather.innerHTML = "<p>Unable to fetch data.</p>";
    forecast.innerHTML = "";
    console.error(err);
  }
}

function showWeather(data) {
  const { location, current } = data;

  currentWeather.innerHTML = `
    <h2>${location.name}, ${location.country}</h2>
    <img src="https:${current.condition.icon}" alt="${current.condition.text}">
    <p><strong>${current.temp_c}°C</strong> - ${current.condition.text}</p>
    <p>Humidity: ${current.humidity}%</p>
    <p>Wind: ${current.wind_kph} km/h</p>
  `;

  forecast.innerHTML = forecastGlobal
    .map((day, index) => {
      const date = new Date(day.date);
      const weekday = date
        .toLocaleDateString("en-GB", { weekday: "short" })
        .slice(0, 3);
      return `
        <div class="forecast-card" data-index="${index}">
          <p class="weekday"><strong>${weekday}</strong></p>
          <div class="icon-temp">
            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            <p>${day.day.avgtemp_c}°C</p>
          </div>
          <p>${day.day.condition.text}</p>
        </div>
      `;
    })
    .join("");

  enableDaySwitch();
  showRainChart(0);
}

function enableDaySwitch() {
  const todayCard = document.querySelector(".current-weather");
  const forecastCards = document.querySelectorAll(".forecast-card");
  const todaySize = { width: "300px", height: "300px" };
  const forecastSize = { width: "80px", height: "320px" };
  const allCards = [todayCard, ...forecastCards];

  allCards.forEach((card, i) => {
    card.style.transition = "all 0.3s ease";
    card.addEventListener("click", () => {
      allCards.forEach((c) => {
        c.style.width = forecastSize.width;
        c.style.height = forecastSize.height;
      });
      card.style.width = todaySize.width;
      card.style.height = todaySize.height;

      const dayIndex = i === 0 ? 0 : i - 1;
      showRainChart(dayIndex);
    });
  });
}

function showRainChart(dayIndex = 0) {
  const day = forecastGlobal[dayIndex];
  const hours = day.hour.map((h) => h.time.split(" ")[1]);
  const rain = day.hour.map((h) => h.chance_of_rain);

  if (rainChart) {
    rainChart.data.labels = hours;
    rainChart.data.datasets[0].data = rain;
    rainChart.update();
    return;
  }

  rainChart = new Chart(chartCtx, {
    type: "bar",
    data: {
      labels: hours,
      datasets: [
        {
          label: "Rain (%)",
          data: rain,
          backgroundColor: "#007aff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, max: 100 },
        x: { ticks: { autoSkip: true, maxTicksLimit: 12 } },
      },
    },
  });
}

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (!city) return alert("Please enter a city.");
    fetchWeather(city);
  }
});

const map = L.map("map").setView([20, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
}).addTo(map);

const capitals = [
  { name: "Lisbon", lat: 38.7169, lon: -9.1396 },
  { name: "Madrid", lat: 40.4168, lon: -3.7038 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Berlin", lat: 52.52, lon: 13.405 },
  { name: "Rome", lat: 41.9028, lon: 12.4964 },
  { name: "New York", lat: 40.7128, lon: -74.006 },
];

capitals.forEach(async (city) => {
  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city.lat},${city.lon}&days=6&lang=en`
    );
    const data = await res.json();

    const icon = L.icon({
      iconUrl: `https:${data.current.condition.icon}`,
      iconSize: [50, 50],
      iconAnchor: [25, 25],
      popupAnchor: [0, -25],
    });

    const marker = L.marker([city.lat, city.lon], { icon }).addTo(map);
    const popup = L.popup({ closeButton: false }).setContent(`
      <b>${data.location.name}</b><br>
      ${data.current.temp_c}°C - ${data.current.condition.text}
    `);

    marker.on("mouseover", () => marker.bindPopup(popup).openPopup());
    marker.on("mouseout", () => marker.closePopup());

    marker.on("click", () => {
      currentCityData = data;
      forecastGlobal = data.forecast.forecastday;
      showWeather(data);
      showRainChart(0);
    });
  } catch (err) {
    console.error(err);
  }
});

const otherCities = [
  { country: "Sweden", city: "Stockholm", lat: 59.3293, lon: 18.0686 },
  { country: "Japan", city: "Tokyo", lat: 35.6895, lon: 139.6917 },
  { country: "Australia", city: "Kirribilli", lat: -33.8688, lon: 151.2093 },
];

otherCities.forEach(async (c) => {
  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${c.lat},${c.lon}&days=6&lang=en`
    );
    const data = await res.json();

    const card = document.createElement("div");
    card.className = "sample-city-card";
    card.innerHTML = `
      <div class="sample-city-text">
        <span class="country">${c.country}</span>
        <span class="city">${c.city}</span>
        <span class="temp"><strong>${data.current.temp_c}°C</strong></span>
      </div>
      <img src="https:${data.current.condition.icon}" width="40" height="40" alt="${data.current.condition.text}">
    `;
    sampleCitiesContainer.appendChild(card);

    card.addEventListener("click", () => {
      forecastGlobal = data.forecast.forecastday;
      currentCityData = data;
      showWeather(data);
      showRainChart(0);
    });
  } catch (err) {
    console.error(err);
  }
});

window.addEventListener("load", () => fetchWeather("Coimbra"));
