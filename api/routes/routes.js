'use strict';
module.exports = function(app) {
    var controller = require('../controllers/controller');

    app.route('/airports/search/:name')
    .get(controller.searchAirportsName);

    app.route('/flight');
}
