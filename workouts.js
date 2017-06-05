//	Author: 	Andrius Kelly
//  Dates: 		Jun  3 2017
//	Assignment: CS290 Week 09 - Database interactions and UI 


//modules
var express = require("express");
var handlebars = require("express-handlebars").create({defaultLayout: 'main'});
var	bodyParser = require('body-parser');
var mysql = require('dbcon.js');

var app = express();

//set the port number
app.set('port', 5121);

//parse json and url
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//handlebars engine
app.engine('handlebars', handlebars.engine); //apply h engine to h extensions
app.set('view engine', 'handlebars'); //omit h extension for renders


//retrieve table data
app.get('/',function(req,res,next){
  var context = {};
  mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.results = JSON.stringify(rows);
    res.render('home', context);
  });
});

//insert a name
app.get('/insert', function(req,res,next){
	var context = {}
	mysql.pool.query("INSERT INTO workouts (`name`) VALUES (?)", [req.query.name], function(err, result){
		if(err){
			next(err);
			return;
		}
		context.results = "Inserted id " + result.insertId;
		res.render('home', context);
	});
});

//get request to /reset-table to create new table
app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});


//insert into database
app.get('/insert', function(req,res,next){
	var context = {};
	mysql.pool.query("INSERT INTO workouts (`name`) VALUES (?)", [req.query.name], function(err, result){
		if(err){
			next(err);
			return;
		}
		context.results = "Inserted id" + result.insertId;
		res.render('home', context);
	});
});


//404 catch all
app.use(function(req,res){
	res.status(404);
	res.render("404");
});

//500 catch all
app.use(function(e, req, res, next){
	console.log(e.stack);
//	res.type("plain/text");
	res.status(500);
	res.render("500");
});

app.listen( app.get('port'), function() {
	console.log("Express started on http:flip3.engr.oregonstate.edu:" + app.get('port')+ " ; press Ctrl-C to terminate.");
})
