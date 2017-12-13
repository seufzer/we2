"use strict";

/*
 * Uebungsblatt 2
 * @author BBK
*/


// node module imports
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
// own modules imports
const store = new (require('simple-memory-store'))();
const HttpError = require('./http-error.js');

// creating the server application
const app = express();

//app.use(bodyParser);
app.use(bodyParser.urlencoded({ extended: false }));



// error response
const resp404 = "cant find that!";
const html_not_found = "<head></head><body>ERROR</body>";
const json_not_found = '{ "error": "error" }';
const plain_not_found = "error";

store.initWithDefaultData();

/* Aufgabe 2
 add route to static file, 
 load the index.html file from the /prebuilt path prefix */
app.use(
	'/prebuild', express.static( path.join(__dirname, 'prebuild'))
	// test
);



/* Aufgabe 3a
 adding route from the /time path prefix with GET,
 get Date object, format Date with appriopriate methods,
 set type as text/plain 
  */
app.get('/time', processTime);


function processTime(req, res) {

	let date = new Date();
	let hour = pad(date.getHours());
	let minute = pad(date.getMinutes());
	let second = pad(date.getSeconds());
	// let formatedDate = " " + hour + ":" + minute + ":" + second; 
	let formatedDate = `${hour}:${minute}:${second} `;
	res.type("text/plain");
	res.send(
			formatedDate
			);
}

function pad(i){
	if (i < 10){
		return "0" + i;
	}else 
		return i;
}

//app.all('/tweets', (req, res) => {
	//if (req.accepts())
 //});

/* Aufgabe 4a
 create CRUD for tweets
 Routes
  */

app.get('/tweets', (req, res, next) => { 
	
	console.log("processing GET /tweets");

	let tweets = store.select('tweets');

	for (var i = 0; i < tweets.length; i++) {
		tweets[i].href = req.protocol+"://"+req.get("host")+req.originalUrl+"/"+tweets[i].id;
	}

	var tweetWithHref = {};
	tweetWithHref.href = req.protocol+"://"+req.get("host")+req.originalUrl;
	tweetWithHref.items = tweets;



	res.json(tweetWithHref);
});

app.post('/tweets', (req, res, next) => {
		console.log("POST to /tweets")
		// check if req.body follows the template
		let result = store.insert('tweets', req.body);
		result.href = req.protocol+"://"+req.get("host")+req.originalUrl;
		res.status(201).json(result);
		console.log("post to tweets");
});

// expected that USE includes all other methods
app.use('/tweets/:id', (req, res, next) => {
	if ( store.select('tweets', req.params.id) == undefined ) {
		let err = new HttpError('Object of id ' + req.params.id + ' not found in store', 404);
		next(err);
		return;
	}


	next();
});

function if_is_in_store( inc_id, function_to_execute) {
	if ( store.select('tweets', inc_id) == undefined ) {
		return false;
	} else {
		return true;
	}
}

// function get_tweet_by_id( id) {
// 		let tweet = store.select('tweets', id);
// 		tweet.href = req.protocol+"://"+req.get("host")+req.originalUrl;// + req.params.id;
// 		res.json(tweet);
// }

app.get('/tweets/:id', (req, res, next) => {
	if ( is_in_store(req.params.id)) {
		let tweet = store.select('tweets', req.params.id);
		tweet.href = req.protocol+"://"+req.get("host")+req.originalUrl;// + req.params.id;
		res.json(tweet);
	} else {
		let err = new HttpError('Object of id ' + req.params.id + ' not found in store', 404);
		next(err);
		return;
	}
});

app.delete('/tweets/:id', (req, res, next) => {
	store.remove('tweets', req.params.id);
	res.status(200).end();
});

app.put('/tweets/:id', (req, res, next) => {
	store.replace('tweets', req.params.id, req.body);
	res.status(200).end();
});

 



/* Aufgabe 5a
 adding ressource collection "users" \
 get user info of uid 
  */

app.get('/users/:uid', function (req, res, next){
	let users = store.select('users');

	console.log(users[0].id);

	for (var i = 0; i < users.length; i++) {
		if (users[i].id  == req.params.uid ) {
			console.log("user " + req.params.uid + " found!");
			res.json(users[i]).end();
			return;
		}
	}

	let err = new HttpError('User of id ' + req.params.uid + ' not found in store', 404);
	next(err);
	return;

	console.log("users");
});

// get all tweets of user of id 
// returns empty if user doesnot exist
app.get('/users/:uid/tweets', function (req, res, next){
	let tweets = store.select('tweets');
	let userTweets = [];

	//console.log(users[0].id);

	for (var i = 0; i < tweets.length; i++) {
		if (tweets[i].user.id  == req.params.uid ) {
			//console.log("user " + req.params.uid + " found!");
			userTweets.push(tweets[i]);
		}
	}

	res.json(userTweets).end();
});




/* Aufgabe 3b

  */


app.use('/tweets', (req, res, next) => {
	if (!req.accepts("json")) {
		console.log("not accepts json");
		let err = new HttpError('only response of application/json supported, please accept this', 406); // user has REQUESTED the wrong type
		next(err);
		return;
	} 

	if (['POST', 'PUT'].includes(req.method) && !( /application\/json/.test(req.get('Content-Type')))) {
		console.log("post/put");
		let err = new HttpError('Accept-Version (Content-Type) cannot be fulfilled', 406);
		next(err);
		return;
	} 

	next();
});
// i jak?



//for any HTTP not already handled
app.use('*', function(req, res, next) {
  var err =  new HttpError( req.originalUrl + ' not found', "not_found");
  //res.status(404).send({error: err.message});
  console.log(err.message);
  next(err);
  return;
});

// Error handling, recognized through 4 parameters

app.use((err, req, res, next) => {
	console.log("err " + err);
	res.type("text/plain");
	
	if (err.status == 404) {
		res.status(404).send("not found: 404 " + err.message);
	}

	//accept
	if (err.status == "not_found") {

		if (req.accepts("html")) {
			//res.status(404).send("not_found: 404 " + err.message);
			res.status(404).type("text/html").send(html_not_found);
			return;
		}

		if (req.accepts("json")) {
			//res.status(404).send("not_found: 404 " + err.message);
			res.status(404).type("application/json").send(json_not_found);
			return;
		}

		res.status(404).type("text/plain").send(plain_not_found);
		return;
		//res.status(302).redirect('/');
	}
	if (err.status == 406) {
		res.status(406).send("not acceptable: 406");
	}
	

});


// Start server ****************************
const server = app.listen(3000, () =>
	console.log("server running")
);
