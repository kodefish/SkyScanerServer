'use strict';

var axios = require('axios');
var apiKey = "ha731738434387524676454915828415";
var distanceCalc = require('../modules/distanceCalc');
var durationCalc = require('../modules/durationCalc');


exports.searchAirportsName = function(req, res){
    var urlSearchAirport = "http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/GB/EUR/en-gb/?query="+req.params.name+"&apiKey="+apiKey;
    //get all airports from departure
    console.log(urlSearchAirport);
    axios({
        method: 'get',
        url: urlSearchAirport,
        headers: {
            'Accept': 'application/json'
        }
    }).then((response) => {
        //send all the places
        var places = response.data.Places;
        res.send(places);
    });
}

exports.testSession = function(req, res) {
    var pollResult = pollSession(req.query.key);
    res.send(pollSession(req.query.key));
}

// origin_place, destination_place, outbound_date
exports.retrieveFlightsFromSession = function(req, res) {
    console.log("starting session search");
    let maxPrice = req.query.maxPrice;
    let maxDuration = req.query.maxDuration;

    let originPlace = req.query.departureId;
    let destinationPlace = req.query.destinationId;
    let outbounddate = req.query.dateDep;

    console.log("creating session");
    createSession(originPlace, destinationPlace, outbounddate).then((session) => {
        setTimeout(axio(session, maxPrice, maxDuration, res), 1000, 'funky');
    });
    
}

function axio(session, maxPrice, maxDuration, res) {
    axios({
        method: 'get',
        url: "http://partners.api.skyscanner.net/apiservices/pricing/uk1/v1.0/" + session + "?apikey=" + apiKey,
        headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
        }
    }).then((response) => {
        console.log("got response");
        var pollResult = response.data;

        // get cheapest outbound ids that fit the price restriction
        var cheapestOutboundIds = getCheapestPrices(pollResult, maxPrice);
        console.log("computed cheapest flights");
        // filter out flights that are too long
        // cheapestOutboundIds = filterDurationFlights(cheapestOutboundIds, maxDuration);

        // create lookup table on all the legs and carriers
        var legLookup = new Map();
        var legs = pollResult.Legs;
        for (var i = 0; i < legs.length; i++) {
            legLookup.set(legs[i].Id, legs[i]);
        }

        var carrierLookup = new Map();
        var carriers = pollResult.Carriers;
        for (var j = 0; j < carriers.length; ++j) {
            carrierLookup.set(carriers[j].Id, carriers[j]);
        }
        console.log("computed lookup");
        // iterate through all the keys and create flight objects from the results
        var flights = [];
        console.log(cheapestOutboundIds.size);
        cheapestOutboundIds.forEach((value, key, map) => {
            var leg = legLookup.get(key);
            var priceOption = value;
            var flight = {
                departureTime: leg.Departure,
                arrivalTime: leg.Arrival,
                duration: leg.Duration,
                carrier: carrierLookup.get(leg.Carriers[0]).Name,
                price: priceOption.Price,
                ticketLink: priceOption.DeeplinkUrl
            }
            flights.push(flight);
        });
           res.send(flights);
    }).catch((err) => {
        //console.log(err);
        if (err.response.status == 304) {
            console.log("304");
            setTimeout(axio(session, maxPrice, maxDuration, res), 1000, 'funky');
        }
    });
}

function getCheapestPrices(pollResult, maxPrice) {
    // disable price filter to always have results, just take the cheapest option
    maxPrice = Number.MAX_SAFE_INTEGER;
    var outboundIds = new Map();
    if (pollResult !== undefined) {
        // loop through Itineraries and filter out by price
        var itineraries = pollResult.Itineraries;
        for (var i = 0; i < itineraries.length; ++i) {
            var itinerary = itineraries[i];
            var pricing = itinerary.PricingOptions;
            // for each itinerary only keep cheapest pricing option
            var cheapestPrice;
            for (var p = 0; p < pricing.length; ++p) {
                if (pricing[p].Price <= maxPrice) {
                    cheapestPrice = pricing[p];
                    maxPrice = cheapestPrice.Price;
                }
            }
            if (cheapestPrice !== undefined) {
                outboundIds.set(itinerary.OutboundLegId, cheapestPrice);
            }
        }
    }
    return outboundIds;
}

// TODO if need be
function filterDurationFlights(cheapestOutboudIds, maxDuration) {
    return cheapestOutboudIds;
}

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
                            console.log(AirportDetails);
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

    }).catch((err) => {
        console.log(err.response.status);
    });

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



function createSession (originPlace, destinationPlace, outbounddate) {
    console.log("init session");
    return new Promise((resolve, reject) => {
        let urlPost = "http://partners.api.skyscanner.net/apiservices/pricing/v1.0";

        var parametersToPass = "cabinclass=Economy&country=UK&currency=GBP&locale=en-GB&locationSchema=iata&originplace="+originPlace+"&destinationplace="+destinationPlace+"&outbounddate="+outbounddate+"&inbounddate="+outbounddate+"&adults=1&children=0&infants=0&apikey="+apiKey;
        
        axios.post(urlPost, parametersToPass,{
            headers: {
        "Content-Type" : "application/x-www-form-urlencoded"
            }
        }).then((response)=>{
            console.log("received session response");
            let headersArray = response.headers.location.split('/');
            //console.log(headersArray[headersArray.length-1]);
            resolve(headersArray[headersArray.length-1]);
        })
    });
    
}