'use strict';

var axios = require('axios');
var apiKey = "ha731738434387524676454915828415";
 

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
    var sessionKey = req.query.session;
    var maxPrice = req.query.maxPrice;
    var maxDuration = req.query.maxDuration;

    var request = "http://partners.api.skyscanner.net/apiservices/pricing/uk1/v1.0/" + sessionKey + "?apikey=" + apiKey;
    axios({
        method: 'get',
        url: request,
        headers: {
            'Accept': 'application/json'
        }
    }).then((response) => {
        var pollResult = response.data;

        // get cheapest outbound ids that fit the price restriction
        var cheapestOutboundIds = getCheapestPrices(pollResult, maxPrice);
        // filter out flights that are too long
        // cheapestOutboundIds = filterDurationFlights(cheapestOutboundIds, maxDuration);

        // create lookup table on all the legs
        var lookup = new Map();
        var legs = pollResult.Legs;
        for (var i = 0; i < legs.length; i++) {
            lookup.set(legs[i].Id, legs[i]);
        }
        // iterate through all the keys and create flight objects from the results
        var flights = [];
        cheapestOutboundIds.forEach((value, key, map) => {
            var leg = lookup.get(key);
            var priceOption = value;
            var flight = {
                departureTime: leg.Departure,
                arrivalTime: leg.Arrival,
                duration: leg.Duration,
                carrier: leg.Carriers[0],
                price: priceOption.Price,
                ticketLink: priceOption.DeeplinkUrl
            }
            flights.push(flight);
        });
        res.send(flights);
    });

}

var pollSession = function(sessionKey, maxPrice, maxDuration, res) {
}

function getCheapestPrices(pollResult, maxPrice) {
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