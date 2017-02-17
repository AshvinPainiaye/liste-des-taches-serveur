var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var sha1 = require('node-sha1');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'todo-list'
});
connection.connect(function (err) {
    if (err)
        throw err;
});


// CREATE TABLE TODO
connection.query(
    'CREATE TABLE IF NOT EXISTS todo(id int primary key AUTO_INCREMENT, task text, complete tinyint(1), user_id int)', function (err, result) {
        if (err)
            throw err;
    });


// CREATE TABLE USERS
connection.query(
    'CREATE TABLE IF NOT EXISTS users(id int primary key AUTO_INCREMENT, username varchar(250), password text)', function (err, result) {
        if (err)
            throw err;
    });


// Login
app.post('/login', function (req, res) {
    var data = req.body;
    var query = 'SELECT * FROM `users` WHERE `username` = ' + '\'' + data.username + '\' AND `password` =' + '\'' + sha1(data.password) + '\'';
    connection.query(query, function (err, result) {
        if (err)
            throw err;
        if (result != '') {
            res.status(200).send({
                'id': result[0].id,
                'connected': 1
            });
        } else {
            res.status(404).send('Username or password incorrect');
        }

    });
});


// New task
app.post('/new', function (req, res) {
    var data = req.body;
    connection.query('INSERT INTO todo SET ?', data, function (err, result) {
        if (err)
            throw err;
    });

    res.status(200).send('ok');

});


// All task
app.get('/:userId', function (req, res) {
    connection.query('SELECT * FROM todo WHERE user_id =' + '\'' + req.params.userId + '\'', function (err, results) {
        if (err)
            throw err;
        res.status(200).json(results)
    });

});



// nb tasks
app.get('/tasks/:info/:userId', function (req, res) {
    var userId = req.params.userId;
    if (req.params.info == 'count') {
        connection.query('SELECT COUNT(*) FROM todo WHERE user_id =' + '\'' + userId + '\'', function (err, results) {
            if (err)
                throw err;
            res.status(200).send(results)
        });
    } else if (req.params.info == 'complete') {
        connection.query('SELECT COUNT(*) FROM todo WHERE complete = 1 AND user_id =' + '\'' + userId + '\'', function (err, results) {
            if (err)
                throw err;
            res.status(200).send(results)
        });
    }
});



// Delete task
app.delete('/delete/:id', function (req, res) {
    connection.query('DELETE FROM todo WHERE id =' + req.params.id, function (err, results) {
        if (err)
            throw err;
    });
});

// Delete task
app.delete('/delete/all/complete/:id', function (req, res) {
    connection.query('DELETE FROM todo WHERE complete = \'1\' AND user_id =' + req.params.id, function (err, results) {
        if (err)
            throw err;
    });
});


// Delete all task
app.delete('/delete/all/:id', function (req, res) {
    connection.query('DELETE FROM todo WHERE user_id =' + req.params.id, function (err, results) {
        if (err)
            throw err;
    });
});



// Complete task
app.post('/complete', function (req, res) {
    var data = req.body;
    connection.query('SELECT * FROM todo WHERE id =' + data.id, function (err, result) {
        if (err)
            throw err;

        if (result[0].complete == 0) {
            var complete = 1;
        } else if (result[0].complete == 1) {
            var complete = 0;
        }

        connection.query('UPDATE `todo` SET `complete` =' + '\'' + complete + '\'' + ' WHERE `todo`.`id` = ' + '\'' + data.id + '\'', function (err) {
            if (err)
                throw err;
        });

    });

});


app.listen(8080);