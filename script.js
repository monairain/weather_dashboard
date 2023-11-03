// URL and API key for the weather API
const weatherAPIURL = "https://api.openweathermap.org";
const weatherAPIKEY = "c875f84aa04328bd581f57209854f1e5";

// DOM elements
let searchForm = $("#search-form");
let searchInput = $("#search-input");
let todaySection = $("#today");
let forecastSection = $("#forecast");
let searchHistory = [];
let searchHistoryContainer = $("#history");

// Function to display search history
function renderSearchHistory() {
    // Clear the search history 
    searchHistoryContainer.html("");

    // Looping through the search history and creating buttons for each city
    for (let i = 0; i < searchHistory.length; i++) {
        let btn = $("<button>");
        btn.attr("type", "button");
        btn.addClass("history-btn btn-history");
        btn.attr("data-search", searchHistory[i]);
        btn.text(searchHistory[i]);
        searchHistoryContainer.append(btn);
    }
}

// Appending a city to the search history
function appendSearchHistory(search) {

    // Checking if the city is already in the search history
    if (searchHistory.indexOf(search) !== -1) {
        return;
    }
    // Adding the cities to the search history list 
    searchHistory.push(search);
    localStorage.setItem("search-history", JSON.stringify(searchHistory));
    // Updating search history
    renderSearchHistory();
}

// Function to display the current weather
function renderCurrentWeather(city, weatherData) {
    // Acquiring date and weather info
    let date = moment().format("MMMM Do YYYY");
    let tempC = weatherData["main"]["temp"];
    let windKph = weatherData["wind"]["speed"];
    let humidity = weatherData["main"]["humidity"];
    // Displaying current weather
    let iconUrl = `https://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`;
    let iconDescription = weatherData.weather[0].description || weatherData[0].main;
    let card = $("<div>");
    let cardBody = $("<div>");
    let weatherIcon = $("<img>");
    let heading = $("<h2>");
    let tempEl = $("<p>");
    let windEl = $("<p>");
    let humidityEl = $("<p>");
   
    card.attr("class", "card");
    cardBody.attr("class", "card-body");
    card.append(cardBody);
    heading.attr("class", "h3 card-title");
    tempEl.attr("class", "card-text");
    windEl.attr("class", "card-text");
    humidityEl.attr("class", "card-text");
    
    heading.text(`${city} (${date})`);
    weatherIcon.attr("src", iconUrl);
    weatherIcon.attr("alt", iconDescription);

    heading.append(weatherIcon);
    tempEl.text(`Temp: ${tempC} °C`);
    windEl.text(`Wind: ${windKph} Km/H`);
    humidityEl.text(`Humidity: ${humidity} %`);
    cardBody.append(heading, tempEl, windEl, humidityEl);
    // Appending elements to the current weather section
    todaySection.html("");
    todaySection.append(card);
}

// Function to visualise the 5-day forecast
function renderForecast(weatherData) {
    let headingCol = $("<div>");
    let heading = $("<h4>");

    headingCol.attr("class", "col-12");
    heading.text("5-day Forecast");
    headingCol.append(heading);


    // Clearing the forecast 
    forecastSection.html("");

    // Appending the heading to the forecast section
    forecastSection.append(headingCol);
    
    let futureForecast = weatherData.filter(function (forecast) {
        return forecast.dt_txt.includes("12:00:00");
    });
    // Looping through forecast data and creating day-cards 
    for (let i = 0; i < futureForecast.length; i++) {
        let iconUrl = `https://openweathermap.org/img/w/${futureForecast[i].weather[0].icon}.png`;
        let iconDescription = futureForecast[i].weather[0].description;
        let tempC = futureForecast[i].main.temp;
        let humidity = futureForecast[i].main.humidity;
        let windKph = futureForecast[i].wind.speed;
        let dateFormatted = moment(futureForecast[i].dt_txt).format("D-MMM-YYYY");
        let col = $("<div>");
        let card = $("<div>");
        let cardBody = $("<div>");
        let weatherIcon = $("<img>");
        let tempEl = $("<p>");
        let windEl = $("<p>");
        let humidityEl = $("<p>");
        let dateEl = $("<p>"); // date element

        col.append(card);
        card.append(cardBody);
        cardBody.append(dateEl, weatherIcon, tempEl, windEl, humidityEl);

        col.attr("class", "col-md");
        card.attr("class", "card bg-primary h-100 text-white");
        tempEl.attr("class", "card-text");
        windEl.attr("class", "card-text");
        humidityEl.attr("class", "card-text");
        dateEl.attr("class", "card-text"); // Styles for the date element

        // Setting the date 
        dateEl.text(dateFormatted);

        tempEl.text(`Temp: ${tempC} °C`);
        windEl.text(`Wind: ${windKph} Km/H`);
        humidityEl.text(`Humidity: ${humidity} %`);
        weatherIcon.attr("src", iconUrl);
        weatherIcon.attr("alt", iconDescription);

        forecastSection.append(col);
    }
}

// Function to fetch weather info
function fetchWeather(location) {
    let latitude = location.lat;
    let longitude = location.lon;
    let city = location.name;
    let queryWeatherURL = `${weatherAPIURL}/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${weatherAPIKEY}`;
    $.ajax({
        url: queryWeatherURL,
        method: "GET"
    }).then(function (response) {
        renderCurrentWeather(city, response.list[0]);
        renderForecast(response.list);
    });
}

// Function to fetch coordinates of a city
function fetchCoord(search) {
    let queryURL = `${weatherAPIURL}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherAPIKEY}`;
    fetch(queryURL, { method: "GET" })
        .then(function (data) {
            return data.json();
        })
        .then(function (response) {
            if (!response[0]) {
                alert("No Location Found");
            } else {
                appendSearchHistory(search);
                fetchWeather(response[0]);
            }
        });
}

// Function for search history
function initializeHistory() {
    let storedHistory = localStorage.getItem("search-history");

    if (storedHistory) {
        searchHistory = JSON.parse(storedHistory);
    }
    renderSearchHistory();
}

// Function for processing form submissions
function submitSearchForm(event) {
    event.preventDefault();
    let search = searchInput.val().trim();

    fetchCoord(search);
    searchInput.val("");
}

// Function for managing clicks on search history entries
function clickSearchHistory(event) {
    if (!$(event.target).hasClass("btn-history")) {
        return;
    }
    let search = $(event.target).attr("data-search");

    fetchCoord(search);
    searchInput.val("");
}

// Initialize search history and establish event listeners
initializeHistory();
searchForm.on("submit", submitSearchForm);
searchHistoryContainer.on("click", clickSearchHistory);