const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const weatherCondition = document.getElementById("weatherCondition");
const windSpeed = document.getElementById("windSpeed");

const weatherResult = document.getElementById("weatherResult");
const errorMessage = document.getElementById("errorMessage");


async function getWeather() {
    const city = cityInput.value.trim();
    if (city === "") {
        errorMessage.textContent = "Please enter a city name.";
        weatherResult.classList.add("hidden");
        return;
    }
    try {
        errorMessage.textContent = "";
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
        );

        if (!geoResponse.ok) {
            throw new Error("Unable to find city.");
        }
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found.");
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather.");
        }

        const weatherData = await weatherResponse.json();
        cityName.textContent = `${location.name}, ${location.country}`;
        temperature.textContent =`Temperature: ${weatherData.current.temperature_2m}°C`;

        windSpeed.textContent =`Wind Speed: ${weatherData.current.wind_speed_10m} km/h`;

        weatherCondition.textContent =`Weather Code: ${weatherData.current.weather_code}`;

        weatherResult.classList.remove("hidden");
        cityInput.value=" ";
        setTimeout(() => {
            weatherResult.classList.add("hidden");
        }, 100000);

    } catch (error) {

        errorMessage.textContent = error.message;

        weatherResult.classList.add("hidden");

    }
}


searchBtn.addEventListener("click", getWeather);