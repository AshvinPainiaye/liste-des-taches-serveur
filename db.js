var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');

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
connection.query('CREATE TABLE IF NOT EXISTS todo(id int primary key AUTO_INCREMENT, task text, complete tinyint(1), user int)', function (err, result) {
    if (err)
        throw err;
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
app.get('/', function (req, res) {
    connection.query('SELECT * FROM todo', function (err, results) {
        if (err)
            throw err;
        res.status(200).json(results)
    });

});

// Delete task
app.delete('/:id', function (req, res) {
    connection.query('DELETE FROM todo WHERE ID =' + req.params.id, function (err, results) {
        if (err)
            throw err;
    });
});

app.listen(8080);