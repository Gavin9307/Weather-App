import config from './config.js';
const API_KEY = config.apiKey;

const userTab = document.querySelector('[data-userWeather]');
const searchTab = document.querySelector('[data-searchWeather]');
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const notFoundContainer = document.querySelector(".not-found-container");

let currentTab = userTab;
currentTab.classList.add("current-tab");
getFromSessionStorage();

function renderWeatherInfo(data) {
    const cityName = document.querySelector('[data-cityName]');
    const countryIcon = document.querySelector('[data-countryIcon]');
    const weatherDesc = document.querySelector('[data-weatherDesc]');
    const weatherIcon = document.querySelector('[data-weatherIcon]');
    const temp = document.querySelector('[data-temp]');
    const windspeed = document.querySelector('[data-windspeed]');
    const humidity = document.querySelector('[data-humidity]');
    const clouds = document.querySelector('[data-clouds]');
    
    cityName.innerText = data?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    weatherDesc.textContent = data?.weather?.[0]?.description;
    weatherIcon.src =  `https://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.innerHTML = data?.main?.temp + " &degC";
    windspeed.innerText = data?.wind?.speed + " m/s";
    humidity.innerText = data?.main?.humidity + " %";
    clouds.innerText = data?.clouds?.all + " %";
}

async function fetchUserWeatherInfo (coordinates){
    const {lat,lon} = coordinates;
    grantAccessContainer.classList.remove('active');
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    try {
        console.log("start");
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
        console.log("stop");
    } catch (error) {
        loadingScreen.classList.remove("active");
        let notfoundmsg = document.querySelector("[data-ErrorType]");
        notfoundmsg.innerText = "Failed to fetch data";
        notFoundContainer.classList.add("active");
    }
}

function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        grantAccessContainer.classList.add('active');
        userInfoContainer.classList.remove('active');
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

function switchTab(clickedTab){
    console.log("start");
    notFoundContainer.classList.remove("active");
    if(clickedTab!=currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.add("active");
            getFromSessionStorage();
        }
    }
}+


userTab.addEventListener('click',()=>{
    switchTab(userTab);
});

searchTab.addEventListener('click',()=>{
    switchTab(searchTab);
});



// Location grant access and save in session storage
function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }else{
        notFoundContainer.classList.add("active");
    }
}

function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener('click',getLocation);


// Weather Search 

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    notFoundContainer.classList.remove("active");
    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove("active");
        if(data?.cod == "404"){
            let notfoundmsg = document.querySelector("[data-ErrorType]");
            notfoundmsg.innerText = "City Not Found";
            notFoundContainer.classList.add("active");
        }
        else {
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        }
    } catch (error) {
        loadingScreen.classList.remove("active");
        let notfoundmsg = document.querySelector("[data-ErrorType]");
        notfoundmsg.innerText = "Failed to Fetch Data";
        notFoundContainer.classList.add("active");
    }
}

let searchInput = document.querySelector('[data-searchInput]');
searchForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName.trim() === "") return;
    console.log(cityName.trim());
    fetchSearchWeatherInfo(cityName.trim());
});