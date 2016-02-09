/**
 * Created by ASHUTOSH on 2/9/2016.
 */
var middleware = {
    requireAuthorisation: function(req,res,next){
        console.log('secret secret');
        next();
    },
    logger: function(req,res,next){
        console.log('Request: ' +  new Date().toString() );
        next();
    }
};

module.exports = middleware;