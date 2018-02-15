//set environment variables with the dotenv package 
require("dotenv").config();
// Required NPM Packages
var inquirer = require('inquirer');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require("request");
//To access exports from keys.js file
var keys = require("./keys.js");
// fs is a core Node package for reading and writing files
var fs = require("fs");

//object initialised for the constructors - Spotify & Twitter
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

//array to store commands&name that needs to be written in logfile
var logFile = [];
//getting the command line arguments
var nodeArgs = process.argv;
var commands = "";
var name = "";

//checking the command line arguments for LIRI commands
if (nodeArgs.length > 2) {
	commands = process.argv[2];
	//if command line argument has LIRI command and moviename or songname
	if (nodeArgs.length > 3) {
		name = concatString(nodeArgs);
	}
	//function call
	commandExecution(commands, name);
} else {
	logFile[0] = "Invalid Command";
	log();
	console.log("Please Enter Valid Command");
}

/*if the user specified command matches LIRI commands 
then the correspponding action takes place and logged */
function commandExecution(commands, name) {
	logFile.push(commands);
	switch (commands) {
		case "my-tweets":
			my_tweets();
			log();
			break;

		case "spotify-this-song":
			spotify_this_song(name);
			log();
			break;

		case "movie-this":
			movie_this(name);
			log();
			break;

		case "do-what-it-says":
			do_what_it_says();
			log();
			break;
		default:
			logFile[0] = "Invalid Command";
			log();
			console.log("Please Enter Valid Command");

	}
}

/*function for the my-tweets command, it shows last 20 tweets and their created datetime*/
function my_tweets() {
	var limit = 20;
	// get request to the Twitter API for my tweets and their createdat values
	client.get('statuses/user_timeline', function (error, tweets, response) {
		if (!error) {
			for (var i = 0; i < limit; i++) {
				if (tweets[i]) {
					console.log(tweets[i].text);
					console.log(tweets[i].created_at);
				}
			}
		}
		else{
			console.log('Error occurred: ' + error);
			logFile.push(error);
		}
	});
}

/*function for the spotify-this-song command, if song name is given 
in command line then it displays specific information for that song, 
else it takes default songname and displays its info*/
function spotify_this_song(songName) {
	//if songname is not given in command line
	if (songName === "") {
		songName = "The+Sign";
	}

	// search request to the Spotify API for the given songname 
	spotify.search({
		type: 'album',
		query: songName,
		limit: 2
	}, function (err, data) {

		if (err) {
			console.log('Error occurred: ' + err);
			logFile.push(err);
		}
		console.log("Artists: " + data.albums.items[0].artists[0].name);
		console.log("________");
		console.log("The Song's Name: " + data.albums.items[1].name);
		console.log("________________");
		console.log("Preview link from Spotify: " + data.albums.href);
		console.log("__________________________");
		console.log("Album: " + data.albums.items[0].uri);
		console.log("______");
	});

	//songname added to logfile to be logged
	logFile.push(songName);
}

/*function for the movie-this command, if movie name is given 
in command line then it displays specific information for that movie, 
else it takes default moviename and displays its info*/
function movie_this(movieName) {
	//if moviename is not given in command line
	if (movieName === "") {
		movieName = "Mr. Nobody";
	}
	// a request to the OMDB API with the movie specified
	request("http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy", function (error, response, body) {
		// If the request is successful (i.e. if the response status code is 200)
		if (!error && response.statusCode === 200) {

			console.log("Title of the movie: " + JSON.parse(body).Title);
			console.log("___________________");
			console.log("Year the movie came out: " + JSON.parse(body).Year);
			console.log("_______________________ ");
			console.log("IMDB Rating of the movie: " + JSON.parse(body).Rated);
			console.log("_________________________");
			console.log("Rotten Tomatoes Rating of the movie: " + JSON.parse(body).Ratings[1].Value);
			console.log("___________________________________");
			console.log("Country where the movie was produced: " + JSON.parse(body).Country);
			console.log("____________________________________");
			console.log("Language of the movie: " + JSON.parse(body).Language);
			console.log("_____________________");
			console.log("Plot of the movie: " + JSON.parse(body).Plot);
			console.log("_________________");
			console.log("Actors in the movie: " + JSON.parse(body).Actors);
			console.log("___________________");

		}
	});
	//moviename added to logfile to be logged
	logFile.push(movieName);

}

/*function for the do-what-it-says command, this will take the text inside of random.txt 
and then uses it to call one of LIRI's commands */
function do_what_it_says() {
	fs.readFile("random.txt", "utf8", function (err, data) {

		// If the code experiences any errors it will log the error to the console.
		if (err) {
			console.log('Error occurred: ' + err);
			logFile.push(err);
		}

		//removes whitespaces from both sides of the text 
		data = data.trim();
		//splits the text with , separator and stores values in array
		var dataArr = data.split(",");
		//LIRI command first array item 
		var command = dataArr[0];
		//songName or movieName if given second array item
		var name = dataArr[1];
		//replace "" in name and concat movie or song name with + 
		name = (name.replace('"', '').split(" ")).join("+");

		//function call to perform LIRI command read in the text file
		commandExecution(command, name);

	});
}

/*function to concat the command line arguments with + for the names (movie or song) */
function concatString(nodeArgs) {
	var name = "";
	for (var i = 3; i < nodeArgs.length; i++) {
		if (i > 3 && i < nodeArgs.length) {
			name = name + "+" + nodeArgs[i];
		} else {
			name = nodeArgs[i];
		}
	}
	return name;
}

/* function to write log file , logarray is used to write commands in the log file */
function log() {
	fs.appendFile("log.txt", logFile + "\n", function (err) {
		// If the code experiences any errors it will log the error to the console.
		if (err) {
			return console.log(err);
		}
	});
}