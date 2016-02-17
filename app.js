/**
 * Created by ASHUTOSH on 2/9/2016.
 */
var express = require('express');
var bodyParser = require('body-parser');
var db = require('./db.js')
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
    var query = req.query;

    var where = {};
    if(query.hasOwnProperty('completed') && query.completed === 'true'){
        where.completed = true;
    }else if(query.hasOwnProperty('completed') && query.completed === 'false'){
        where.completed = false;
    }

    if(query.hasOwnProperty('q') && query.q.length > 0){
        where.description = {
            $like: '%' + query.q + '%'
        };
    }

    db.todo.findAll({where:where}).then(function(todos){
        res.json(todos);
    },function(e){
        res.status(500).send();
    });
   // var filteredTodos = todos;
   // if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true'){
   //     filteredTodos = _.where(filteredTodos, {completed: true});
   // }else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false'){
   //     filteredTodos = _.where(filteredTodos, {completed: false});
   // }
   //
   // if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0){
   //     filteredTodos = _.filter(filteredTodos, function(todo){
   //         return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
   //     });
   // }
   //res.json(filteredTodos);
});

app.get('/todos/:id', function(req,res){
    var todoId = parseInt(req.params.id, 10);
    db.todo.findById(todoId).then(function(todo){
        if(!!todo){
            res.json(todo.toJSON());
        }else{
            res.status(404).send();
        }
    }, function(e){
       res.status(500).json(e);
    });


    //var mtodo;
    //
    //mtodo = _.findWhere(todos, {id:todoId});
    //
    ////todos.forEach(function(todo){
    ////   if(parseInt(todoId, 10) === todo.id){
    ////       mtodo = todo;
    ////   }
    ////});
    //
    //if(mtodo){
    //    res.json(mtodo);
    //}else{
    //    res.status(404).send();
    //}


});

app.post('/todos', function(req,res){
   var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function(todo){
        res.json(todo.toJSON());
    },function(e){
        res.status(400).json(e);
    });
    //body.id = todoNextId;
    //todoNextId++;
    //
    //
    //console.log("description: " + body.description);
    //
    //if(!_.isBoolean(body.completed)|| !_.isString(body.description) || body.description.trim().length === 0){
    //    return res.status(400).send();
    //}
    //body.description = body.description.trim();
    //
    //todos.push(body);
    //res.json(body);
});

app.delete('/todos/:id', function(req,res){
   var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id:todoId
        }
    }).then(function(rowsDeleted){
        if(rowsDeleted === 0){
            res.status(404).json({
                "error": "No todo With That id"
            });
        }else{
            res.status(204).send();
        }
    },function(e){
        res.status(500).send();
    })
    //var matchedTodo = _.findWhere(todos, {id: todoId});
    //
    //if(!matchedTodo){
    //    res.status(404).json({"error": "no json found with that id"});
    //}else{
    //    todos = _.without(todos,matchedTodo);
    //    res.json(matchedTodo);
    //}
});

app.put('/todos/:id', function(req,res){
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};

    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
        validAttributes.completed = body.completed;

    }else if(body.hasOwnProperty('completed')){
        return res.status(400).send();
    }else{
        return res.json({"error": "no object found"});
    }

    if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
        validAttributes.description = body.description;
    }else if(body.hasOwnProperty('description')){
        return res.status(400).send();
    }

    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});

    if(!matchedTodo){
        return res.status(400).send();
    }

    _.extend(matchedTodo, validAttributes);
    res.json(matchedTodo);
});

app.use(express.static(__dirname + '/public'));

db.sequelize.sync().
    then(function(){
        app.listen(PORT, function(){
            console.log("APP using on " + PORT);
        });

    });
