'use strict';

var axios = require('axios');
var apiKey = "ha506416221846351184864905536865";
 

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
