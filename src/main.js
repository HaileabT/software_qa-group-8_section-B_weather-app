import { initApp } from "./app.js";

document.addEventListener("DOMContentLoaded", () => {
  initApp();
  const clearButton = document.getElementById("clear-data");
  clearButton.addEventListener("click", () => {
    const cityInput = document.getElementById("cityInput");
    const weatherDisplay = document.getElementById("weatherInfo");
    cityInput.value = "";
    weatherDisplay.textContent = "";
  });
});
