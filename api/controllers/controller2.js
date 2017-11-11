'use strict';

var axios = require('axios');
var request = require('request');
var distanceCalc = require('../modules/distanceCalc');
var durationCalc = require('../modules/durationCalc');
var apiKey = "ha129292138013702875479911846997";


exports.getAllAirportsLocation = function (req, res) {

    let urlGetAll = 'http://partners.api.skyscanner.net/apiservices/geo/v1.0?apikey=' + apiKey;
    let departure = req.params.departure;
    let duration = req.params.duration;

    var AirportDetails = {};

    axios.get(urlGetAll).then((response) => {

        let continents = response.data.Continents;
        for (let i = 0; i < continents.length; i++) {
            let currentContinent = continents[i];
            for (let j = 0; j < currentContinent.Countries.length; j++) {
                let currentCountry = currentContinent.Countries[j];
                for (let k = 0; k < currentCountry.Cities.length; k++) {
                    let currentCity = currentCountry.Cities[k];
                    for (let l = 0; l < currentCity.Airports.length; l++) {
                        let currentAirport = currentCity.Airports[l];
                        if (departure.toLowerCase() == currentAirport.Name.toLowerCase()) {
                            AirportDetails = currentAirport;
                            //console.log(AirportDetails);
                            break;
                        }
                    }
                }
            }
        }

        let suggestions = [];

        for (let i = 0; i < continents.length; i++) {
            let currentContinent = continents[i];
            for (let j = 0; j < currentContinent.Countries.length; j++) {
                let currentCountry = currentContinent.Countries[j];
                for (let k = 0; k < currentCountry.Cities.length; k++) {
                    let currentCity = currentCountry.Cities[k];
                    for (let l = 0; l < currentCity.Airports.length; l++) {
                        let currentAirport = currentCity.Airports[l];
                        if (departure != currentAirport.Name) {
                            let currentLocation = currentAirport.Location.trim().split(',');
                            //console.log(currentAirport.Name);
                            let takeOff_Airport_location = AirportDetails.Location.trim().split(',');
                            let km = distanceCalc.getDistanceFromLatLonInKm(takeOff_Airport_location[1], takeOff_Airport_location[0], currentLocation[1], currentLocation[0]);
                            let durationInMin = durationCalc.durationCalcTime(km);
                            //console.log(duration);
                            if (durationInMin <= duration) {
                                suggestions.push(currentAirport);
                            }
                        }
                    }
                }
            }
        }

        //console.log(suggestions);

        var finalObject = {
            departure: AirportDetails,
            suggestions: suggestions
        };

        res.send(JSON.stringify(finalObject));

    })

}

exports.getAllRealFlights = function (req, res) {

    //NEED TO CHANGE THE URL TO BE ABLE TO REQUEST
    let urlSuggestions = "https://skytravel-server.herokuapp.com/flight/getAllAirportsSuggestions/" + req.params.departure + "/" + req.params.duration;
    let date = req.params.date;
    let price = req.params.price;

    axios.get(urlSuggestions).then((response) => {
        //console.log(response);
        let promises = [];
        for (let i = 0; i < response.data.suggestions.length; i++) {
            let currentSuggestion = response.data.suggestions[i];
            //console.log(currentSuggestion.Name);
            let departureId = response.data.departure.Id;
            let urlGetQuotes = "http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/gb/EUR/en-GB/" + departureId + "/" + currentSuggestion.Id + "/" + date + "/?apikey=" + apiKey;


            promises.push(sortDataSuggestion(urlGetQuotes, currentSuggestion, price));

        }

        Promise.all(promises).then((allSuggestions) => {
            let newSuggestions = [];
            for (let i = 0; i < allSuggestions.length; i++) {
                if (allSuggestions[i].MinPrice != null) {
                    newSuggestions.push(allSuggestions[i]);
                }
            }
            var finalObject = {
                departure: response.data.departure,
                suggestions: newSuggestions
            };
            res.send(JSON.stringify(finalObject));
        });

    });

}

function sortDataSuggestion(url, currentSuggestion, price) {
    return new Promise((resolve, reject) => {
        axios.get(url).then((quote) => {
            //console.log(quote);
            for (let j = 0; j < quote.data.Quotes.length; j++) {
                let currentQuote = quote.data.Quotes[j];
                if (currentQuote.Direct == true) {
                    if (currentQuote.MinPrice < Number(price)) {
                        //console.log("JE SUIS DANS LE IF");
                        currentSuggestion.MinPrice = currentQuote.MinPrice;

                    }
                }
            }
            resolve(currentSuggestion);
        });
    });
}



exports.createSession = function (req, res) {

    let originPlace = req.params.departureId;
    let destinationPlace = req.params.destinationId;
    let outbounddate = req.params.dateDep;
    //console.log(dataToPost);

    let urlPost = "http://partners.api.skyscanner.net/apiservices/pricing/v1.0";

    var parametersToPass = "cabinclass=Economy&country=UK&currency=GBP&locale=en-GB&locationSchema=iata&originplace="+originPlace+"&destinationplace="+destinationPlace+"&outbounddate="+outbounddate+"&inbounddate="+outbounddate+"&adults=1&children=0&infants=0&apikey="+apiKey;
    
    axios.post(urlPost, parametersToPass,{
        headers: {
    "Content-Type" : "application/x-www-form-urlencoded"
        }
    }).then((response)=>{
        let headersArray = response.headers.location.split('/');
        //console.log(headersArray[headersArray.length-1]);
        res.send(headersArray[headersArray.length-1]);
    })

}