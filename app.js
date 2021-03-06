/**
 * Created by ASHUTOSH on 2/9/2016.
 */
var express = require('express');
var bodyParser = require('body-parser');
var db = require('./db.js');
var middleware = require('./middleware.js')(db);
var app = express();
var _ = require('underscore');
var bcrypt = require('bcrypt-nodejs');
var PORT = process.env.PORT || 3000;
var todoNextId = 1;
app.use(bodyParser.json());

var todos = [];




app.get('/', function(req,res){
   res.send('Todo Api root');
});

app.get('/about', function(req,res){
   res.send('About us');

});

app.get('/todos', middleware.requireAuthentication, function(req,res){
    var query = req.query;

    var where = {
        userId: req.user.get('id')
    };
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

app.get('/todos/:id', middleware.requireAuthentication, function(req,res){
    var todoId = parseInt(req.params.id, 10);
    db.todo.findOne({
        id: todoId,
        userId: req.user.get('id')
    }).then(function(todo){
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

app.post('/todos', middleware.requireAuthentication, function(req,res){
   var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function(todo){
        req.user.addTodo(todo).then(function(todo){
            return todo.reload();
        },function(){
            res.status(400).send()
        }).then(function(todo){
            res.json(todo.toPublicJSON());
        },function(){
            res.status(400).send();
        });

        //res.json(todo.toJSON());
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

app.delete('/todos/:id',middleware.requireAuthentication, function(req,res){
   var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id:todoId,
            userId: req.user.get('id')
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

app.put('/todos/:id',middleware.requireAuthentication, function(req,res){
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};

    if(body.hasOwnProperty('completed')){
        attributes.completed = body.completed;

    }

    if(body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    var todoId = parseInt(req.params.id, 10);
    db.todo.findOne({
        id: todoId,
        userId: req.user.get('id')
    }).then(function(todo){
        if(todo){
            return todo.update(attributes);
        }else{
            res.status(404).send();
        }
    },function(e){
        res.status(500).send();
    }).then(function(todo){
        res.json(todo.toJSON());
    },function(e){
        res.send(400).send(e);
    });
});

app.post('/users', function(req,res){
    var body = _.pick(req.body, 'email', 'password');
    db.user.create(body).then(function(user){
        res.json(user.toPublicJSON());
    },function(e){
        res.status(500).send(e);
    });
});

app.post('/users/login', function(req,res){
   var body = _.pick(req.body, 'email', 'password');
    var userInstance;
    db.user.authenciate(body).then(function(user){
        var token = user.generateToken('authentication');
        userInstance = user;
        return db.token.create({
           token: token
        });

    }).then(function(tokenInstance){
        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
    }).catch(function(){
        res.status(401).send();
    });
    //if(typeof body.email !== 'string' || typeof body.password !== 'string'){
    //    return res.status(400).send();
    //}
    //db.user.findOne({
    //    where: {
    //        email: body.email
    //    }
    //}).then(function(user){
    //    if(!user || !bcrypt.compareSync(body.password, user.get('password_hash'))){
    //        return res.status(401).send();
    //    }
    //
    //    res.json(user.toPublicJSON());
    //},function(e){
    //    return res.status(500).send();
    //});
});

app.delete('/users/login', middleware.requireAuthentication, function(req,res){
   req.token.destroy().then(function(){
       res.status(204).send()
   }).catch(function(){
       res.status(500).send();
   });
});

app.use(express.static(__dirname + '/public'));

db.sequelize.sync({force:true}).
    then(function(){
        app.listen(PORT, function(){
            console.log("APP using on " + PORT);
        });

    });
