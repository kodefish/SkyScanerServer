var express = require('express'),
        app = express(),
        port = process.env.PORT || 3000,
        bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

var routes = require('./api/routes/routes');
app.set('etag', false);
routes(app);

app.listen(port);
console.log('SkyTravel RESTful API server started on: ' + port);
