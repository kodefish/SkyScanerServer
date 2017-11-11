'use strict';
module.exports = function(app) {
    var controller = require('../controllers/controller');
    var controller2 = require('../controllers/controller2');

    app.route('/airports/search/:name')
    .get(controller.searchAirportsName);

    app.route('/flight');

<<<<<<< Updated upstream
    app.route('/flight/getAllAirportsSuggestions/:departure/:duration/')
        .get(controller2.getAllAirportsLocation);

    app.route('/flight/:departure/:date/:duration/:price')
        .get(controller2.getAllRealFlights);

    app.route('/session/create/:departureId/:destinationId/:dateDep')
        .get(controller2.createSession);

=======
    app.route('/session')
    .get(controller.retrieveFlightsFromSession);
>>>>>>> Stashed changes
}
