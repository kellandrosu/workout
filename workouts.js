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
app.set('port', 5122);

app.use(express.static('public'));

//parse json and url
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//handlebars engine
app.engine('handlebars', handlebars.engine); //apply h engine to h extensions
app.set('view engine', 'handlebars'); //omit h extension for renders


//retrieve table data and render homepage
app.get('/',function(req,res,next){
	var context = {};
  
	mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
  		if(err){
        	next(err);
        	return;
      	}
		context.rows = rows;

		//include fixed properties for readability
		for(var i=0; i < context.rows.length; i++){
			//insert a units property
			context.rows[i].units = context.rows[i].lbs ? "lbs" : "kgs";
			context.rows[i].dateFixed =  new Date(context.rows[i].date).toDateString();
		}
		res.render('home', context);
    });
});


//workout update handler
app.post('/update', function(req, res, next){
	mysql.pool.query("UPDATE workouts SET name=?, reps=?, weight=?, lbs=?, date=? WHERE id=? ", 
	[req.body.name, req.body.reps, req.body.weight, req.body.lbs, req.body.date, req.body.id], 
	function(err, result){
		if(err){
			res.type("application/json");
			res.status(500);
			res.send();
			return;
		}
		else {
			//need to send SELECT query to get updated row info to send back
			sendRowById(req.body.id, res);
		}
	});
});


//handle workout add request
app.post('/add', function(req, res, next){
	
	mysql.pool.query("INSERT INTO workouts SET ?", req.body, function(err, result){
		if(err) {
			res.type("application/json");
			res.status(500);
			res.send();
			return;
		}
		sendRowById(result.insertId, res);	
	});
});


/**************************************************
		sendRowById(id, res)
gets row information for mysql db and sends it
via express res.send() call
****************************************************/
function sendRowById(id, res){
	mysql.pool.query("SELECT * FROM workouts WHERE id=?", [id], function(err, rows, fields){
		res.type("application/json");
		if(err){
			res.status(500);
			res.send();
			return;
		}
		res.status(200)
		res.send( JSON.stringify( rows[0] ));
	});
}


//handle workout delete requests
app.post('/delete', function(req, res, next){

	mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.body.id], function(err, rows, fields){
		if(err){
			res.status(500);
		}
		else {
			res.status(200);
		}
		res.type("application/json");
		res.send(); //only need to send 200 status
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
      res.render('reset' ,context);
    })
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
	res.status(500);
	res.render("500");
});

app.listen( app.get('port'), function() {
	console.log("Express started on http:flip3.engr.oregonstate.edu:" + app.get('port')+ " ; press Ctrl-C to terminate.");
});

