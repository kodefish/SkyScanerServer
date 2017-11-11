'use strict';
module.exports = function(app) {
    var controller = require('../controllers/controller');

    // server routes
    app.route('/')
        .get(controller.hello);

    app.route('/flight');
}
