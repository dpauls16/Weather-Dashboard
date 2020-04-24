function loadPage() {
    slideNum = 0;

    // Creates the swiper carousel
    swiper = new Swiper('.swiper-container', {
        slidesPerView: 3,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    // Add lottie animation for the add location card
    insertAnimation = lottie.loadAnimation({
        container: document.getElementById("add_item"), // the dom element that will contain the animation
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: 'Animations/add_city_button.json' // the path to the animation json
    });

    // Add reset listener to add location card.
    insertAnimation.addEventListener('complete', function(){
        insertAnimation.goToAndStop(0);
    });

    // Load first place.
    setUpRequest();
}


// A call back function used to get the lat long cords from the users current position.
function formatLocationInfo(position) {
    var lng = position.coords.longitude + "";
    var lat = position.coords.latitude + "";

    // Makes an ajax request to open weather. Its lat long is used to figure out where the place is that is being looked for.
    getPlace("https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&units=imperial&appid=7af4cbe2e11b694a08ea0c3b132c6977");
}


function getPlace(queryURL) {
    // Makes the Ajax
    $.ajax({
        url: queryURL,
        type: 'GET',
        dataType: 'json',
        success: addCard,
        error:  invalidRequest
    });
}

function invalidRequest() {
    console.log("invalid request");
}

function setUpRequest() {
    let inputVal = null;
    let parsedInfo = null;
    let url = null;

    // Note info would usually be gotten by auto complete. Out of scope of this project.
    if ($(".swiper-slide").length == 1 && $(".form-control").val() == "") {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(formatLocationInfo);
        } else {
            // Set a default location
            getPlace("https://api.openweathermap.org/data/2.5/weather?q=Newberg,USA&units=imperial&appid=7af4cbe2e11b694a08ea0c3b132c6977");
        }
    }
    else {
        // Gets the value from the input section
        inputVal = $(".form-control").val();
        $(".form-control").val("");

        // Play the lottie insert animation
        insertAnimation.play();

        document.getElementById("myInput").value = "";

        // figure out the url
        parsedInfo = inputVal.split(",");;

        // Makes a Request as lat lon
        // Google uses DMS not lat lon.
        if (isNaN(parsedInfo[0]) == false && isNaN(parsedInfo[1]) == false)
        {
            url = "https://api.openweathermap.org/data/2.5/weather?lat=" + parsedInfo[0] + "&lon=" + parsedInfo[1] + "&units=imperial&appid=7af4cbe2e11b694a08ea0c3b132c6977"
        }
        // Makes a request as city, country.
        else if (parsedInfo.length == 2) {
            url = "https://api.openweathermap.org/data/2.5/weather?q=" + parsedInfo[0] +"," + parsedInfo[1] + "&units=imperial&appid=7af4cbe2e11b694a08ea0c3b132c6977";
        }


        // make the ajax request.
        getPlace(url);
    }
}

function deleteCard(slideIndex) {
    // Removes a slide from the swiper Carosel.
    swiper.removeSlide(slideIndex.slice(-1));

    // Loop over each data point and decrease its id by one.
    $( ".delete" ).each (function() {
        let cardId = parseInt(this.id.slice(-1));

        if (cardId != 0)
        {
            cardId -= 1;

            this.id = "";
            this.id = "slide" + cardId;
        }
    });

    swiper.update();
}

function addCard(data) {
    let cardId = "card" + slideNum;
    let animationId = "animation" + slideNum;

    // Gets the temp from the open weather json object
    let temp = data["main"].temp + "";

    // Figures out what animation to use
    let weatherCode = data["weather"][0].icon.slice(0, 2);
    let weatherGif = null;
    let isDark = true;
    let weatherSaying = null;


    // Gets current time
    if (data["weather"][0].icon.slice(-1) == "d") {
        isDark = false;
    }

    // Figures out what lottie json file to use and what to say on card.
    if (weatherCode == "01") {
        // clear sky

        if (isDark) {
            weatherGif = 'Animations/day-night-weather.json';
            weatherSaying = "So, it's Dark.";
        }
        else {
            weatherGif = 'Animations/sun-weather.json';
            weatherSaying = "So, it's Sunny.";
        }
    }
    else if (weatherCode == "50") {
        // fog
        weatherSaying = "So, it's Foggy.";

        if (isDark) {
            weatherGif = 'Animations/fog-weather-night.json';
        }
        else {
            weatherGif = 'Animations/sunny fog.json';
        }
    }
    else if (weatherCode == "09") {
        // sprinkling
        weatherSaying = "So, it's Sprinkling.";

        weatherGif = 'Animations/rainy-weather.json';
    }
    else if (weatherCode == "10") {
        // Rain showers
        weatherSaying = "So, it's Raining.";

        weatherGif = 'Animations/torrential-rain-weather.json';

    }
    else if (weatherCode == "11") {
        // Thunder storm
        weatherSaying = "So, it's Lightning.";
        weatherGif = "Animations/thunder storm.json";
    }
    else if (weatherCode == "13") {
        // Snowy weather
        weatherSaying = "So, it's Snowing.";
        weatherGif = "Animations/light-snowy-weather.json";
    }
    else {
        // cloudy
        weatherSaying = "So, it's Cloudy.";

        if (isDark) {
            weatherGif = 'Animations/night-cloudy.json';
        }
        else {
            weatherGif = 'Animations/day cloudy.json';
        }
    }

    // Loop over each data point and increase its id by one.
    $( ".delete" ).each (function() {
        let cardId = parseInt(this.id.slice(-1));

        cardId += 1;

        this.id = "";
        this.id = "slide" + cardId;
    });

    // Add a new bootstrap card to the screen
    swiper.prependSlide('<div class="swiper-slide">\n' +
        '                    <div class="card" style="width: 18rem">\n' +
        '<div class="container">' +
        '<div class="row">' +
        // Adds a button to the card that allows the card to be deleted.
        '<div class="col-12">' +
        '<button type="button" id="slide0" class="btn btn-circle btn-sm delete" onclick="deleteCard(this.id)">X</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '                       <h1 class="card-title place">' + data["name"] + '</h1>\n' +
        // Adds a div where lottie animations can go
        '                       <div id="' + animationId +'"></div>\n' +
        '<h1>' + temp.slice(0,2) + '°</h1>'+
        // Gets weather condition from the open weather json object
        '<p>' + weatherSaying + '</p>'+
        '                       </div>\n' +
        '               </div>');


    // Add a new lottie animation the the card added
    lottie.loadAnimation({
        container: document.getElementById(animationId), // the dom element that will contain the animation
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: weatherGif // the path to the animation json
    });
}
