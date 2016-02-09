/**
 * Created by ASHUTOSH on 2/9/2016.
 */
var express = require('express');
var app = express();
var PORT = 3000;

var middleware = require('./middleware.js');

app.use(middleware.logger);

app.get('/about', function(req,res){
   res.send('About us');

});

app.use(express.static(__dirname + '/public'));

app.listen(PORT, function(){
   console.log("APP using on " + PORT);
});
