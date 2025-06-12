import { fetchWeather } from "./weather.js";

export function initApp() {
  const cityInput = document.getElementById("cityInput");
  const fetchButton = document.getElementById("fetchButton");
  const weatherIcon = document.getElementById("weatherIcon");
  const weatherInfo = document.getElementById("weatherInfo");
  const errorMessage = document.getElementById("errorMessage");

  fetchButton.addEventListener("click", async () => {
    const city = cityInput.value.trim();
    if (!city) {
      errorMessage.textContent = "Please enter a city name!";
      weatherInfo.textContent = "";
      weatherIcon.style.display = "none";
      return;
    }

    try {
      const data = await fetchWeather(city);
      errorMessage.textContent = "";
      weatherInfo.innerHTML = `
        <p>Location: ${data.name}, ${data.sys.country}</p>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Weather: ${
          data.weather[0].description.charAt(0).toUpperCase() +
          data.weather[0].description.slice(1)
        }</p>
        <p>Humidity: ${data.main.humidity}%</p>
      `;
    } catch (error) {
      errorMessage.textContent = "City not found or API error!";
      weatherInfo.textContent = "";
      weatherIcon.style.display = "none";
    }
  });
}
