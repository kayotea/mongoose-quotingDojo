/*
Startup
*/
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var path = require('path');
app.set('views', path.join(__dirname, './views'));

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/quote_db');
    var QuoteSchema = new mongoose.Schema({
        name: String,
        quote: String,
        created_at: String,
        likes: Number
    })
    //set schema as 'Quote'
    mongoose.model('Quote', QuoteSchema);
    //retrieve 'Quote'-named schema from mongoose models
    var Quote = mongoose.model('Quote');
    //use native promises (since mongoose promise will be deprecated)
    mongoose.Promise = global.Promise;

// Set View Engine to EJS
app.set('view engine', 'ejs');

/* 
Routes
*/
// Root Request
app.get('/', function(req, res) {
    console.log('root entered');
    res.render('index');
})
// Add Quote Request 
app.post('/quotes', function(req, res) {
    console.log("POST DATA", req.body);
    // create new Quote with given post data
    var quote = new Quote({name: req.body.name, quote: req.body.quote, created_at: formatDate(new Date()), likes: 0});
    // save new quote to database. use callbacks for error (if any)
    quote.save(function(err){
        if (err){
            console.log('Error! (post route)');
        } else { //no error
            console.log('Success! Quote added.');
            res.redirect('/quotes');  //redirect WITHIN success
        }
    });
})
// Add Quote Page
app.get('/quotes', function(req, res){
    console.log('quote page entered');
    // retreive quotes from database

    Quote.find({}, function(err, data){
    //Quote.find().sort({likes: -1}, function(err, data){
        if (err){
            console.log('Error! (get route)');
        } else { //no error
            console.log('Success! Quotes retrieved.');
            quotes = data;

            

            console.log(quotes);
            // include them in view page when rendering
            res.render('quotes', {quotes: quotes});
        }
    });
})
//Like a Quote
app.get("/:id", function (req, res){
    console.log("The user id requested is:", req.params.id);
    //increment like
    Quote.update({_id: req.params.id}, {$inc: {likes: 1}}, function(err, data){
        if (err){
            console.log('Error! (like route)');
            //console.log(err);
        } else {
            //console.log(data);
            res.redirect('quotes');
        }
    });
    // redirect to page
});


function formatDate(date) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes:minutes;
  var strTime = hours+':'+minutes+ampm;
  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return strTime+' '+monthNames[monthIndex]+' '+day+' '+ year;
}

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})
