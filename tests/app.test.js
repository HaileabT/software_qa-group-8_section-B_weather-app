import { screen, fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom";
import { initApp } from "../src/app";
import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";

// mock weather.js module
jest.mock("../src/weather", () => ({
  fetchWeather: jest.fn(),
}));

import { fetchWeather } from "../src/weather";
beforeEach(() => {
  const html = fs.readFileSync(
    path.resolve(__dirname, "../src/index.html"),
    "utf8"
  );
  const dom = new JSDOM(html);
  document.body.innerHTML = dom.window.document.body.innerHTML;
  initApp();
});

afterEach(() => {
  jest.clearAllMocks();
});

test("shows weather info after clicking fetch", async () => {
  fetchWeather.mockResolvedValue({
    name: "Addis Ababa",
    sys: { country: "ET" },
    main: { temp: 25, humidity: 50 },
    weather: [{ main: "Clear", description: "clear sky" }],
  });

  const input = screen.getByPlaceholderText("Enter city name");
  fireEvent.change(input, { target: { value: "Addis Ababa" } });

  const button = screen.getByText("Get Weather");
  fireEvent.click(button);

  await screen.findByText("Temperature: 25°C");

  expect(fetchWeather).toHaveBeenCalledWith("Addis Ababa");

  expect(screen.getByText("Location: Addis Ababa, ET")).toBeInTheDocument();
  expect(screen.getByText("Temperature: 25°C")).toBeInTheDocument();
  expect(screen.getByText("Weather: Clear sky")).toBeInTheDocument();
  expect(screen.getByText("Humidity: 50%")).toBeInTheDocument();
});

test("shows error when input is empty", () => {
  const button = screen.getByText("Get Weather");
  fireEvent.click(button);

  expect(screen.getByText("Please enter a city name!")).toBeInTheDocument();
  expect(fetchWeather).not.toHaveBeenCalled();
});

test("shows error when fetch fails", async () => {
  fetchWeather.mockRejectedValue(new Error("City not found"));

  const input = screen.getByPlaceholderText("Enter city name");
  fireEvent.change(input, { target: { value: "FakeCity" } });

  const button = screen.getByText("Get Weather");
  fireEvent.click(button);

  await screen.findByText("City not found or API error!");

  expect(fetchWeather).toHaveBeenCalledWith("FakeCity");
  expect(screen.getByText("City not found or API error!")).toBeInTheDocument();
});
