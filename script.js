const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const weatherResult = document.getElementById("weatherResult");
const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");
const windSpeed = document.getElementById("windSpeed");
const humidity = document.getElementById("humidity");
const feelsLike = document.getElementById("feelsLike");
const forecastList = document.getElementById("forecastList");
const errorMessage = document.getElementById("errorMessage");
const retryButton = document.getElementById("retryButton");

let lastCity = "";

async function geocode(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to search for the city.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Please enter a valid city.");
    }

    return data.results[0];
}

async function getWeather(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to get weather information.");
    }

    return await response.json();
}

function getWeatherInfo(code) {
    if (code === 0) {
        return {
            description: "Clear sky",
            icon: '<i class="fa-solid fa-sun"></i>'
        };
    }

    if (code === 1 || code === 2) {
        return {
            description: "Partly cloudy",
            icon: '<i class="fa-solid fa-cloud-sun"></i>'
        };
    }

    if (code === 3) {
        return {
            description: "Overcast",
            icon: '<i class="fa-solid fa-cloud"></i>'
        };
    }

    if (code === 45 || code === 48) {
        return {
            description: "Foggy",
            icon: '<i class="fa-solid fa-smog"></i>'
        };
    }

    if (code >= 51 && code <= 67) {
        return {
            description: "Rain",
            icon: '<i class="fa-solid fa-cloud-rain"></i>'
        };
    }

    if (code >= 71 && code <= 77) {
        return {
            description: "Snow",
            icon: '<i class="fa-solid fa-snowflake"></i>'
        };
    }

    if (code >= 80 && code <= 82) {
        return {
            description: "Rain showers",
            icon: '<i class="fa-solid fa-cloud-showers-heavy"></i>'
        };
    }

    if (code >= 95) {
        return {
            description: "Thunderstorm",
            icon: '<i class="fa-solid fa-cloud-bolt"></i>'
        };
    }

    return {
        description: "Unknown",
        icon: '<i class="fa-solid fa-cloud"></i>'
    };
}

function formatDate(date) {
    const dateObject = new Date(date + "T00:00:00");

    return dateObject.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short"
    });
}

function showState(state) {
    emptyState.classList.add("hidden");
    loadingState.classList.add("hidden");
    errorState.classList.add("hidden");
    weatherResult.classList.add("hidden");
    state.classList.remove("hidden");
}

function showWeather() {
    loadingState.classList.add("hidden");
    errorState.classList.add("hidden");
    emptyState.classList.add("hidden");
    weatherResult.classList.remove("hidden");
}

function displayWeather(location, data) {
    const current = data.current;
    const weatherInfo = getWeatherInfo(current.weather_code);

    cityName.textContent = location.name;
    countryName.textContent = `${location.country} • ${location.admin1 || ""}`;
    weatherIcon.innerHTML = weatherInfo.icon;
    temperature.textContent = Math.round(current.temperature_2m);
    weatherDescription.textContent = weatherInfo.description;
    windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    humidity.textContent = `${current.relative_humidity_2m}%`;
    feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;

    displayForecast(data.daily);
    showWeather();
}

function displayForecast(daily) {
    forecastList.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {
        const weatherInfo = getWeatherInfo(daily.weather_code[i]);
        const card = document.createElement("article");

        card.className = "forecast-card";

        card.innerHTML = `
            <p class="forecast-date">${formatDate(daily.time[i])}</p>
            <div class="forecast-icon">${weatherInfo.icon}</div>
            <p class="forecast-temp">${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°</p>
            <p class="forecast-description">${weatherInfo.description}</p>
        `;

        forecastList.appendChild(card);
    }
}

async function searchWeather(city) {
    showState(loadingState);

    try {
        const location = await geocode(city);
        const weather = await getWeather(location.latitude, location.longitude);

        displayWeather(location, weather);
        lastCity = city;
    } catch (error) {
        errorMessage.textContent = error.message;
        showState(errorState);
    }
}

weatherForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        errorMessage.textContent = "Please enter a city name.";
        showState(errorState);
        return;
    }

    searchWeather(city);
});

retryButton.addEventListener("click", function() {
    if (lastCity !== "") {
        searchWeather(lastCity);
    } else {
        cityInput.focus();
        showState(emptyState);
    }
});

cityInput.focus();