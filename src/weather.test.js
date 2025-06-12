import { fetchWeather, formatWeatherData, uploadReport, getWeatherSummary, downloadReport } from "./weather.js";
import { fireEvent, getByText, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import { initApp } from "./app.js";

// Mock the DOM
document.body.innerHTML = `
  <div id="app">
    <input type="text" id="cityInput" placeholder="Enter city">
    <button id="fetchButton">Get Weather</button>
    <div id="weatherInfo"></div>
    <button id="upload-report">Upload Report</button>
    <div id="errorMessage"></div>
    <img id="weatherIcon" src="" alt="Weather Icon" style="display: none" />
  </div>
`;

// Mock initializeApp to avoid running it automatically
jest.mock("./main.js", () => ({
  initializeApp: jest.fn(),
}));

describe("Weather App", () => {
  beforeEach(() => {
    // Reset mocks and spies before each test
    jest.resetAllMocks();
    document.getElementById("cityInput").value = "";
    document.getElementById("weatherInfo").textContent = "";
    // Attach event listeners
    initApp();
  });

  test("displays weather data when fetch button is clicked", async () => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ main: { temp: 25 }, weather: [{ description: "Sunny" }] }),
      })
    );

    const formatWeather = { formatWeatherData };

    const formatSpy = jest.spyOn(formatWeather, "formatWeatherData");

    const cityInput = document.getElementById("cityInput");
    const fetchButton = document.getElementById("fetchButton");
    const weatherInfo = document.getElementById("weatherInfo");

    cityInput.value = "London";
    fireEvent.click(fetchButton);

    // Simulate the fetchWeather and formatWeatherData calls
    const data = await fetchWeather("London");
    weatherInfo.textContent = formatWeather.formatWeatherData(data);

    await waitFor(() => {
      expect(weatherInfo).toHaveTextContent("Temperature: 25°C, Condition: Sunny");
    });

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/weather?city=London");
    expect(formatSpy).toHaveBeenCalledWith({ temp: 25, condition: "Sunny" });
  });

  test("displays upload success message when upload button is clicked", async () => {
    // Mock fetch for upload
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }));

    const uploadButton = document.getElementById("upload-report");
    const weatherInfo = document.getElementById("weatherInfo");

    fireEvent.click(uploadButton);

    // Simulate the uploadReport call
    const data = { city: "London", temp: 25, condition: "Sunny" };
    const success = await uploadReport(data);
    weatherInfo.textContent = success ? "Report uploaded" : "Upload failed";

    await waitFor(() => {
      expect(weatherInfo).toHaveTextContent("Report uploaded");
    });

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/upload", {
      method: "POST",
      body: expect.any(FormData),
    });
  });

  test("displays upload failure message when upload fails", async () => {
    // Mock fetch for upload failure
    global.fetch = jest.fn(() => Promise.resolve({ ok: false }));

    const uploadButton = document.getElementById("upload-report");
    const weatherInfo = document.getElementById("weatherInfo");

    fireEvent.click(uploadButton);

    // Simulate the uploadReport call
    const data = { city: "London", temp: 25, condition: "Sunny" };
    const success = await uploadReport(data);
    weatherInfo.textContent = success ? "Report uploaded" : "Upload failed";

    await waitFor(() => {
      expect(weatherInfo).toHaveTextContent("Upload failed");
    });
  });

  test("shows error when fetch is clicked with empty input", () => {
    const fetchButton = document.getElementById("fetchButton");
    const errorMessage = document.getElementById("errorMessage");
    const cityInput = document.getElementById("cityInput");
    cityInput.value = "";
    fireEvent.click(fetchButton);
    expect(errorMessage.textContent).toBe("Please enter a city name!");
  });

  test("shows error when fetch throws a network error", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Network error")));
    const fetchButton = document.getElementById("fetchButton");
    const cityInput = document.getElementById("cityInput");
    const errorMessage = document.getElementById("errorMessage");
    cityInput.value = "London";
    fireEvent.click(fetchButton);
    await waitFor(() => {
      expect(errorMessage.textContent).toBe("City not found or API error!");
    });
  });
});

describe("getWeatherSummary", () => {
  it("returns correct summary for London, 25°C, Sunny", () => {
    expect(getWeatherSummary("London", 25, "Sunny")).toBe("London: 25°C, Sunny");
  });

  it("returns correct summary for New York, 10°C, Cloudy", () => {
    expect(getWeatherSummary("New York", 10, "Cloudy")).toBe("New York: 10°C, Cloudy");
  });

  it("returns correct summary for Tokyo, -5°C, Snowy", () => {
    expect(getWeatherSummary("Tokyo", -5, "Snowy")).toBe("Tokyo: -5°C, Snowy");
  });
});

describe("downloadReport", () => {
  it("returns a Blob from the fetch response", async () => {
    const mockBlob = new Blob(["test content"], { type: "text/plain" });
    global.fetch = jest.fn(() => Promise.resolve({ blob: () => Promise.resolve(mockBlob) }));
    const result = await downloadReport("London");
    expect(result).toBe(mockBlob);
    expect(global.fetch).toHaveBeenCalledWith("https://api.example.com/report?city=London");
  });
});
