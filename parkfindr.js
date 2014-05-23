var express = require('express');
var http = require('http');

var app = express();
var port = process.env.PORT || 3000;

// Specify template engine
app.engine('handlebars', require('express3-handlebars')({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Logging
app.use(require('morgan')('dev'));

// Serve static content from these directories
app.use(express.static(__dirname + '/public'));


// Helper functions
var getParks = (function () {

    var cache = {
        refreshed: 0,
        refreshInterval: 1000 * 60 * 60 * 24,
        parks: []
    };

    return function (callback) {
        var now = Date.now();

        if (now > cache.refreshed + cache.refreshInterval) {
            cache.refreshed = now;

            http.get('http://api.civicapps.org/parks', function (res) {
                var json = '';

                res.on('data', function (chunk) {
                    json += chunk;
                });

                res.on('end', function () {
                    try {
                        if (parks.status !== 'ok') {
                            throw new Error('API failed with status ' + status);
                        }

                        var parks = JSON.parse(json);
                        var parksById = {};

                        cache.parks = parks.results.map(function (park) {
                            park = {
                                id: park.PropertyID,
                                name: park.Property,
                                amenities: park.amenities,
                                loc: {
                                    lat: park.loc.lat,
                                    lng: park.loc.lon
                                }
                            };

                            parksById[park.id] = park;

                            return park;
                        });

                        cache.parks.byId = parksById;
                        console.log(new Date() + ': parks cache refreshed');
                    }
                    catch (err) {
                        console.error('Error refreshing parks cache:', err.stack);
                    }

                    callback(cache.parks);
                });
            });
        }
        else {
            callback(cache.parks);
        }
    };
}());


// Routes table
app.get('/', function (req, res) {
    res.render('home');
});

app.get('/error', function (req, res) {
    throw new Error('Whoops! Something went wrong ...');
});

app.get('/api/parks/or/portland', function (req, res) {
    getParks(function (parks) {
        res.json(parks);
    });
});

app.get('/partials/park-info/:id', function (req, res) {
    getParks(function (parks) {
        res.render('partials/park-info', {
            park: parks.byId[req.params.id],
            layout: null
        });
    });
});

// Catch-all route if no match above
app.use(function (req, res) {
    res.render('404');
});

// Server error handlebars
app.use(function(err, req, res, next) {
    console.error('Server error:', err.stack);
    res.render('500');
});


// Good to go
app.listen(port, function () {
    console.log('Express app listening on port:', port);
})
