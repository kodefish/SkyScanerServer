'use strict';
module.exports = function(app) {
    var controller = require('../controllers/controller');
    var controller2 = require('../controllers/controller2');

    // server routes
    app.route('/')
        .get(controller.hello);

    app.route('/flight');

    app.route('/flight/getAllAirportsSuggestions/:departure/:duration/')
        .get(controller2.getAllAirportsLocation);

    app.route('/flight/:departure/:date/:duration/:price')
        .get(controller2.getAllRealFlights);

}
