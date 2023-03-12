const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  condition = document.getElementById("condition"),
  feels = document.getElementById("feels"),
  mainIcon = document.getElementById("icon"),
  currentLocation = document.getElementById("location"),
  pressureIndex = document.querySelector(".pressure-index"),
  pressureText = document.querySelector(".pressure-text"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sun-rise"),
  sunSet = document.querySelector(".sun-set"),
  humidity = document.querySelector(".humidity"),
  visibilty = document.querySelector(".visibilty"),
  humidityStatus = document.querySelector(".humidity-status"),
  windDeg = document.querySelector(".air-quality"),
  windDegStatus = document.querySelector(".air-quality-status"),
  visibilityStatus = document.querySelector(".visibilty-status"),
  searchForm = document.querySelector("#search"),
  search = document.querySelector("#query"),
  celsiusBtn = document.querySelector(".celcius"),
  fahrenheitBtn = document.querySelector(".fahrenheit"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  weatherCards = document.querySelector("#weather-cards");

var video = document.getElementById("myVideo");
var source = document.createElement("source");
video.appendChild(source);

let currentCity = "";
let currentUnit = "c";
let hourlyorWeek = "hour";

// function to get date and time
function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // 12 hours format
  hour24 = hour;
  hour = hour % 12;
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  if (hour24 > 11) {
    minute = minute + " pm";
  } else {
    minute = minute + " am";
    if (hour24 == 0) {
      hour = "12";
    }
  }
  let dayString = days[now.getDay()];
  return `${dayString}, ${hour}:${minute}`;
}

//Updating date and time
date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);

// function to get public ip address
function getPublicIp() {
  fetch("https://geolocation-db.com/json/", {
    method: "GET",
    headers: {},
  })
    .then((response) => response.json())
    .then((data) => {
      currentCity = data.city;
      getWeatherData(data.city, currentUnit, hourlyorWeek);
    })
    .catch((err) => {
      console.error(err);
    });
}
getPublicIp();

// function to get weather data
function getWeatherData(city, unit, hourlyorWeek) {
  let API_KEY = "c242d6d02cb0a069b91ebe3b37f0d282";
  var lat;
  var lon;
  
  console.log(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
  );
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`,
    {
      method: "GET",
      headers: {},
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (unit === "c") {
        temp.innerText = (data.main.temp - 273.15).toFixed(1);
        feels.innerText =
          "Feels like " + (data.main.feels_like - 273.15).toFixed(1) + "°C";
      } else {
        temp.innerText = celsiusToFahrenheit(data.main.temp - 273.15);
        feels.innerText =
          "Feels like " +
          celsiusToFahrenheit(data.main.feels_like - 273.15) +
          "°C";
      }
      currentLocation.innerText = city;
      
      if (data.weather[0].main == "Mist") {
        video.src = "./videos/mist.mp4";
      } else if (data.weather[0].main == "Rain") {
        video.src = "./videos/rain.mp4";
      } else if (data.weather[0].main == "Clouds") {
        video.src = "./videos/cloud.mp4";
      } else if (data.weather[0].main == "Clear") {
        video.src = "./videos/clear.mp4";
      } else if (data.weather[0].main == "Haze") {
        video.src = "./videos/haze.mp4";
      } else if (data.weather[0].main == "Smoke") {
        video.src = "./videos/haze.mp4";
      } else if (data.weather[0].main == "Snow") {
        video.src = "./videos/snow.mp4";
      }
      
      mainIcon.src = getIcon(data.weather[0].main);
      condition.innerText =
      data.weather[0].main + " : " + data.weather[0].description;
      windSpeed.innerText = data.wind.speed;
      pressureIndex.innerText = data.main.pressure;
      measurePresureIndex(data.main.pressure);
      humidity.innerText = data.main.humidity + "%";
      updateHumidityStatus(data.main.humidity);
      visibilty.innerText = data.visibility / 1000;
      updateVisibiltyStatus(data.visibility);
      windDeg.innerText = data.wind.deg;
      updateWindDegStatus(data.wind.deg);
      console.log(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=EJ6UBL2JEQGYB3AA4ENASN62J&contentType=json`);
      fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=EJ6UBL2JEQGYB3AA4ENASN62J&contentType=json`,
        {
          method: "GET",
          headers: {},
        }
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (hourlyorWeek === "hourly") {
            updateForecast(data.days[0].hours, unit, "day");
          } else {
            updateForecast(data.days, unit, "week");
          }
        });
      sunRise.innerText = unixToTime(data.sys.sunrise);
      sunSet.innerText = unixToTime(data.sys.sunset);
    })
    .catch((err) => {
      alert("OpenWeatherMap API error : " + err);
    });
}

//function to update Forecast
function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";
  let day = 0;
  let numCards = 0;
  if (type === "day") {
    numCards = 24;
  } else {
    numCards = 7;
  }
  for (let i = 0; i < numCards; i++) {
    let card = document.createElement("div");
    card.classList.add("card");
    let dayName = getHour(data[day].datetime);
    if (type === "week") {
      dayName = getDayName(data[day].datetime);
    }
    let dayTemp = data[day].temp;
    if (unit === "f") {
      dayTemp = celsiusToFahrenheit(data[day].temp);
    }
    let iconCondition = data[day].icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = "°C";
    if (unit === "f") {
      tempUnit = "°F";
    }
    card.innerHTML = `
                <h2 class="day-name">${dayName}</h2>
            <div class="card-icon">
              <img src="${iconSrc}" class="day-icon" alt="" />
            </div>
            <div class="day-temp">
              <h2 class="temp">${dayTemp}</h2>
              <span class="temp-unit">${tempUnit}</span>
            </div>
  `;
    weatherCards.appendChild(card);
    day++;
  }
}


// function to change weather icons
function getIcon(condition) {
  if (condition === "Clouds") {
    return "https://i.ibb.co/PZQXH8V/27.png";
  } else if (condition === "Rain") {
    return "https://i.ibb.co/kBd2NTS/39.png";
  } else if (condition === "Clear") {
    return "https://i.ibb.co/rb4rrJL/26.png";
  } else if (condition === "Snow") {
    return "https://cdn-icons-png.flaticon.com/512/642/642102.png";
  } else if (condition === "Haze") {
    return "https://cdn-icons-png.flaticon.com/512/1585/1585460.png";
  } else if (condition === "Smoke") {
    return "https://cdn-icons-png.flaticon.com/512/7407/7407787.png";
  } else if (condition === "partly-cloudy-day") {
    return "https://i.ibb.co/PZQXH8V/27.png";
  } else if (condition === "partly-cloudy-night") {
    return "https://i.ibb.co/Kzkk59k/15.png";
  } else if (condition === "rain") {
    return "https://i.ibb.co/kBd2NTS/39.png";
  } else if (condition === "clear-day") {
    return "https://i.ibb.co/rb4rrJL/26.png";
  } else if (condition === "clear-night") {
    return "https://i.ibb.co/1nxNGHL/10.png";
  } else {
    return "https://i.ibb.co/rb4rrJL/26.png";
  }
}

//get hours from hh:mm:ss
function getHour(time) {
  let hour = time.split(":")[0];
  let min = time.split(":")[1];
  if (hour > 12) {
    hour = hour - 12;
    return `${hour}:${min} PM`;
  } else {
    return `${hour}:${min} AM`;
  }
}

// convert time to 12 hour format
function unixToTime(time) {
  var date = new Date(time * 1000);
  // Hours part from the timestamp
  var hours = date.getHours();
  // Minutes part from the timestamp
  var minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp
  var seconds = "0" + date.getSeconds();

  // Will display time in 10:30:23 format
  var formattedTime =
    hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);


  return formattedTime;
}

// function to get day name from date
function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}

// function to get pressure index status
function measurePresureIndex(pressureIndex) {
  if (pressureIndex <= 1010) {
    pressureText.innerText = "Low";
  } else if (pressureIndex <= 1022) {
    pressureText.innerText = "Moderate";
  } else if (pressureIndex <= 7) {
    pressureText.innerText = "High";
  } else if (pressureIndex <= 1028) {
    pressureText.innerText = "Very High";
  } else {
    pressureText.innerText = "Extreme";
  }
}

// function to get humidity status
function updateHumidityStatus(humidity) {
  if (humidity <= 30) {
    humidityStatus.innerText = "Low";
  } else if (humidity <= 60) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
  }
}

// function to get visibility status
function updateVisibiltyStatus(visibility) {
  visibility = visibility / 1000;
  if (visibility <= 0.03) {
    visibilityStatus.innerText = "Dense Fog";
  } else if (visibility <= 0.16) {
    visibilityStatus.innerText = "Moderate Fog";
  } else if (visibility <= 0.35) {
    visibilityStatus.innerText = "Light Fog";
  } else if (visibility <= 1.13) {
    visibilityStatus.innerText = "Very Light Fog";
  } else if (visibility <= 2.16) {
    visibilityStatus.innerText = "Light Mist";
  } else if (visibility <= 5.4) {
    visibilityStatus.innerText = "Very Light Mist";
  } else if (visibility <= 10.8) {
    visibilityStatus.innerText = "Clear Air";
  } else {
    visibilityStatus.innerText = "Very Clear Air";
  }
}

// function to get wind direction
function updateWindDegStatus(windDeg) {
  if (windDeg <= 11.25) {
    windDegStatus.innerText = "North";
  } else if (windDeg <= 56.25) {
    windDegStatus.innerText = "North East";
  } else if (windDeg <= 101.25) {
    windDegStatus.innerText = "East";
  } else if (windDeg <= 146.25) {
    windDegStatus.innerText = "South East";
  } else if (windDeg <= 191.25) {
    windDegStatus.innerText = "South";
  } else if (windDeg <= 236.25) {
    windDegStatus.innerText = "South West";
  } else if (windDeg <= 281.25) {
    windDegStatus.innerText = "West";
  } else if (windDeg <= 326.25) {
    windDegStatus.innerText = "North West";
  } else {
    windDegStatus.innerText = "North";
  }
}

// function to handle search form
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(location, currentUnit, hourlyorWeek);
  }
});

// function to convert Celsius to fahrenheit
function celsiusToFahrenheit(temp) {
  return ((temp * 9) / 5 + 32).toFixed(1);
}

fahrenheitBtn.addEventListener("click", () => {
  changeUnit("f");
});
celsiusBtn.addEventListener("click", () => {
  changeUnit("c");
});

// function to change unit
function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;
    tempUnit.forEach((elem) => {
      elem.innerText = `°${unit.toUpperCase()}`;
    });
    if (unit === "c") {
      celsiusBtn.classList.add("active");
      fahrenheitBtn.classList.remove("active");
    } else {
      celsiusBtn.classList.remove("active");
      fahrenheitBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}

hourlyBtn.addEventListener("click", () => {
  changeTimeSpan("hourly");
});
weekBtn.addEventListener("click", () => {
  changeTimeSpan("week");
});

// function to change hourly to weekly or vice versa
function changeTimeSpan(unit) {
  if (hourlyorWeek !== unit) {
    hourlyorWeek = unit;
    if (unit === "hourly") {
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
    } else {
      hourlyBtn.classList.remove("active");
      weekBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}
