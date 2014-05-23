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
function getParks(callback) {
    // fetch info from remote api
    callback(data);
}


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
