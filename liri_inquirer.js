require("dotenv").config();
var inquirer = require('inquirer');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require("request");
var keys=require("./keys.js");
// fs is a core Node package for reading and writing files
var fs = require("fs");

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

var logFile=[];

inquirer.prompt([
{
	type:"input",
	message:"Enter Your name: ",
	name:"username"
},
{
	type:"list",
	message:"Choose One:  ",
	name:"command",
	choices:["my-tweets","spotify-this-song","movie-this","do-what-it-says"]
},
{	
	type:"input",
	message:"Do you have anything specific to get details of ? ",
	name:"name"
}
{
  type: "confirm",
  message: "Is that all:",
  name: "confirm",
  default: true
}
]).then(function(response){
	if (response.confirm) {
      console.log("\nWelcome " + response.username);
      commandExecution(response.command,response.name);
    }
    
});

//var commands=process.argv[2];
//logFile.push(response.command);

function commandExecution(commands,name)
{
	logFile.push(commands);
			
	switch(commands)
	{
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
			logFile[0]="Invalid Command";
			log();
			console.log("Invalid command. Please Try Again!!");
	}
}


function my_tweets()
{
	//add tweets limit to 20
	client.get('statuses/user_timeline', function(error, tweets, response) {
	  if (!error) {
	  	for(var i=0;i<tweets.length;i++)
	  	{
	  		console.log(tweets[i].text);
	  	}	    
	  }
	});
}

function spotify_this_song(songName)
{
	if(songName === "")
	{
		songName="The+Sign";
	}
	var songName="The+Sign";
	//change to inquirer
	var nodeArgs = process.argv;
	if(nodeArgs.length > 3 )
	{
		songName = concatString(nodeArgs);
		console.log("song   " + songName);
	}
	
	console.log("song   " + songName);
	  spotify.search({ type: 'album', query: songName, limit:2 }, function(err, data) {
	  //spotify.search({ type: 'track', query: songName, limit:1 }, function(err, data) {
 
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
	logFile.push(songName);
}

function movie_this(){
	var movieName="Mr. Nobody";
	//change to inquirer
	var nodeArgs = process.argv;
	//console.log(nodeArgs.length);
	if(nodeArgs.length > 3 )
	{
		movieName = concatString(nodeArgs);
	}
	// Then run a request to the OMDB API with the movie specified
	request("http://www.omdbapi.com/?t="+ movieName +"&y=&plot=short&apikey=trilogy", function(error, response, body) {
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

	logFile.push(movieName);
}

function do_what_it_says()
{
	fs.readFile("random.txt", "utf8", function(err, data) {

	  // If the code experiences any errors it will log the error to the console.
	  if (err) {
	    console.log(err);
	    }

	  // We will then print the contents of data
	  console.log(data);

	  // Then split it by commas (to make it more readable)
	  var dataArr = data.split(",");

	  var command=dataArr[0];
	  var name=dataArr[1];
	  name=((name.slice(1,name.length-1)).split(" ")).join("+");
	  
	  console.log(command);
	  console.log(name);
	  commandExecution(command,name);
	  
	});

	//logFile.push("Hi");	
}


function concatString(nodeArgs)
{
	var name="";
	for (var i = 3; i < nodeArgs.length; i++) {
	  if (i > 3 && i < nodeArgs.length) {
	    name = name + "+" + nodeArgs[i];
	  }
	  else {
	    name = nodeArgs[i];
	  }
	}
	return name;
}

function log()
{
	console.log(logFile);	
	fs.appendFile("log.txt", logFile + "\n", function(err) {
	  // If the code experiences any errors it will log the error to the console.
	  if (err) {
	    return console.log(err);
	  }

	  logFile=[];
	});
}
