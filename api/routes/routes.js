'use strict';
module.exports = function(app) {
    var controller = require('../controllers/controller');

    app.route('/airports/search/:name')
    .get(controller.searchAirportsName);

    app.route('/flight');

    app.route('/flight/getAllAirportsSuggestions/:departure/:duration/')
        .get(controller.getAllAirportsLocation);

    app.route('/flight/:departure/:date/:duration/:price')
        .get(controller.getAllRealFlights);

    app.route('/session')
    .get(controller.retrieveFlightsFromSession);
}
