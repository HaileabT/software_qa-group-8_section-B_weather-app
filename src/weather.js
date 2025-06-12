import { WEATHER_API_KEY } from "./config.js";

export async function fetchWeather(city) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
  );
  const data = await response.json();
  return data;
}

export function formatWeatherData(data) {
  return `Temperature: ${data.temp}°C, Condition: ${data.condition}`;
}

export async function uploadReport(data) {
  const formData = new FormData();
  formData.append("report", JSON.stringify(data));
  const response = await fetch("https://api.example.com/upload", {
    method: "POST",
    body: formData,
  });
  return response.ok;
}

export function getWeatherSummary(city, temp, condition) {
  return `${city}: ${temp}°C, ${condition}`;
}

export async function downloadReport(city) {
  const response = await fetch(`https://api.example.com/report?city=${city}`);
  return await response.blob();
}
