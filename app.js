/**
 * Created by ASHUTOSH on 2/9/2016.
 */
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _ = require('underscore');
var PORT = process.env.PORT || 3000;
var todoNextId = 1;
app.use(bodyParser.json());

var todos = [];

var middleware = require('./middleware.js');

app.use(middleware.logger);
app.get('/', function(req,res){
   res.send('Todo Api root');
});

app.get('/about', function(req,res){
   res.send('About us');

});

app.get('/todos', function(req,res){
   res.json(todos);
});

app.get('/todos/:id', function(req,res){
    var todoId = req.params.id;
    var mtodo;

    mtodo = _.findWhere(todos, {id:todoId});

    //todos.forEach(function(todo){
    //   if(parseInt(todoId, 10) === todo.id){
    //       mtodo = todo;
    //   }
    //});

    if(mtodo){
        res.json(mtodo);
    }else{
        res.status(404).send();
    }


});

app.post('/todos', function(req,res){
   var body = _.pick(req.body, 'description', 'completed');

    body.id = todoNextId;
    todoNextId++;


    console.log("description: " + body.description);

    if(!_.isBoolean(body.completed)|| !_.isString(body.description) || body.description.trim().length === 0){
        return res.status(400).send();
    }
    body.description = body.description.trim();

    todos.push(body);
    res.json(body);
});

app.delete('/todos/:id', function(req,res){
   var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});

    if(!matchedTodo){
        res.status(404).json({"error": "no json found with that id"});
    }else{
        todos = _.without(todos,matchedTodo);
        res.json(matchedTodo);
    }
});

app.use(express.static(__dirname + '/public'));

app.listen(PORT, function(){
   console.log("APP using on " + PORT);
});
