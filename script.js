"use strict";

const mainContainerEl = document.querySelector(".main-container");
const subContainerEl = document.querySelector(".sub-container");
const containerEl = document.querySelector(".container");
const AppId = "0e64f7f9209e4104a912d75e6a885c54";
const parentFormEl = document.querySelector(".search");
let isCity;

const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Return day of the week
const calcDay = (today, index) => {
  if (today + index >= 7) return weekDays[today + index - 7];
  else return weekDays[today + index];
};

const capitalizeFirstChar = (sentence) => {
  return sentence
    .split(" ")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
};

// Fetch weather data from API
const fetchWeatherData = async function (latitude, longitude) {
  return await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${AppId}`
  );
};

// Fetch weatherData for city
const fetchWeatherDataCity = async function (city) {
  return await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${AppId}`
  );
};

const DisplayData = function (result, isCity) {
  const city = result.city.name;
  const currentDetails = result.list[0];
  const currentTemp = currentDetails.main.temp;
  const currentWeather = currentDetails.weather[0].description;

  let currentDate;
  if (isCity) {
    const d = new Date();
    currentDate = new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds() + result.city.timezone
    );
  } else {
    currentDate = new Date();
  }

  const today = currentDate.getDay();
  const locale = navigator.language;
  const options = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  const date = new Intl.DateTimeFormat(locale, options).format(currentDate);

  mainContainerEl.textContent = "";

  const markupHtml = `
  <div class="location-container">
    <h1 class="city">${city}</h1>
    <p class="date-time">${date}</p>
  </div>
  <div class="main-temperature--container">
    <p class="main-temperature"><span>${Math.round(
      currentTemp
    )}</span>&deg;<sup>c</sup></p>
    <p class="main-temperature--description">${capitalizeFirstChar(
      currentWeather
    )}</p>
   </div>

`;
  mainContainerEl.innerHTML = markupHtml;

  const futureData = result.list.filter((_, i) => {
    return i > 0 && i % 8 == 0;
  });

  const markUpArr = futureData.map((data, i) => {
    const fTemp = data.main.temp;
    const fDescription = data.weather[0].description;
    return `
    <ul class="grid-elemet">
      <li class="day">${calcDay(1, i + 1)}</li>
      <li class="tempertature">${Math.round(fTemp)}&deg;<sup>c</sup></li>
      <li class="description">${capitalizeFirstChar(fDescription)}</li>
    </ul>

  `;
  });

  subContainerEl.innerHTML = "";
  subContainerEl.innerHTML = markUpArr.join("");
};

// Display weather data
const getCurrentLocationWeather = async function (position) {
  const { latitude, longitude } = position.coords;
  try {
    const res = await fetchWeatherData(latitude, longitude);
    const result = await res.json();
    if (result.cod !== "200")
      throw new Error(
        "There was an error fetching the weather data. Please check your request"
      );
    DisplayData(result, (isCity = false));
  } catch (err) {
    containerEl.textContent = "";
    const markup = `
      <div class="errorMsg">
       <p class="message"><em>${err.message}</em></p>
      </div>
    `;
    containerEl.innerHTML = markup;
  }
};

// Load landing page with current location weather data
const init = async function () {
  navigator.geolocation.getCurrentPosition(
    getCurrentLocationWeather,
    function (err) {
      console.log("Error fetching location");
    }
  );
};

init();

parentFormEl.addEventListener("submit", function (e) {
  e.preventDefault();
  const city = parentFormEl.querySelector(".search-field").value;
  parentFormEl.querySelector(".search-field").value = "";
  fetchWeatherDataCity(city)
    .then((res) => res.json())
    .then((result) => {
      if (result.cod !== "200")
        throw new Error(
          `Sorry!! Could not find any results for the city "${city}". Please check your spellings and try again`
        );
      DisplayData(result, (isCity = true));
    })
    .catch((err) => {
      containerEl.textContent = "";
      const markup = `
      <div class="errorMsg">
       <p class="message"><em>${err.message}</em></p>
      </div>
    `;
      containerEl.innerHTML = markup;
    });
});
