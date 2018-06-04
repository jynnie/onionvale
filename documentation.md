# onionvale

is a super simple collaborative node.js game I'm making. here's some of the steps and design choices i made to build it.

while this takes a kind of tutorial-y tone, i also plan to discuss some design choices (which will also be addressed in the final section specifically)

i'm using node.js with express framework

## setting up

first install node and npm (node package manager)

```
$ mkdir onionvale
$ cd onionvale
$ npm init -y
$ npm install express --save
```

this initiates a node project in our folder `onionvale` and creates the relevant `package.json`

add the following script to `scripts` of `package.json` so that it looks like:

```
"scripts": {
  "dev": "node app",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

now we're ready to start writing our actual application

## basic app.js

while i'm making an express app, i've chosen not to use express-generator. this is because 1) express-generator is out of date and 2) i want to learn how to write an express app from scratch

so, this means we need to set up an `app.js` ourself. create a `app.js` file.

let's start with the following basic app code:

```
const express = require("express");
const app = express();

const PORT = 3000;

app.get("/", function(req, res) {
  res.send("Hello World!");
});

app.listen(PORT, function() {
  console.log("Running onionvale on port 3000!");
});
```

we can run the app with `npm run dev` and on port 3000 we'll get a page that says "Hello World!"

cool, let's now setup the middleware that handles serving up html, static files, and whatnot let's add the following to `app.js`:

```
const path = require("path");

app.set("views", path.join(__dirname, "views"));
app.use("/static", express.static(path.join(__dirname, "public")));
```

this now allows us to serve up static files in the public directory and views in a directory view, both of which we haven't made yet, so go ahead and do

```
mkdir public
mkdir views
```

i'll be doing all routing in `app.js` since this is a really small app. bigger apps will modularize and put routes in a seperate folder/file(s).

let's try making a basic page in views that we'll render

## rendering a basic html page

in views, make `index.pug`. pug is a templating markdown language that makes html indentation based. here's our very basic pug page:

```
html
  head
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    title onionvale
  body
    h1 hello onionvale
    p #{content}
```

now the app needs to be able to handle rendering pug - so download pug

```
$ npm install pug --save
```

and we'll tell our app we're using pug by adding the following to `app.js`:

```
app.set("view engine", "pug");
```

now let's route our index page to that pug page with:

```
app.get("/", function(req, res) {
  res.render("index", { content: "hey boss" });
});
```

onionvale is a one page site, thus i'm not doing anything interesting with templating and there's gonna be just one style sheet (boring i know). i'll go ahead and setup the actual index page (below) before continuing

### index page code

html:

```
html
  head
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    link(rel="stylesheet" href="/static/style.css")
    script(src="/static/script.js")
    title onionvale
  body(onload="bottomScroll()")
    .game-wrapper
      .sidebar
        ul#stats.side-wrapper
          li.stat
            span.stat-name health
            span.stat-num 5/10
        ul#items.side-wrapper

      .main-wrapper
        .title hello, onionvale
        .log-wrapper
          #logs.logs
            .log.update
              | welcome to onionvale, the most
              | incredible place of all
            .log.player
              | opens game
            .log.game
              | the game hits you with a hard bat for being stupid
            .log.update
              | health decreases by 5
            .log.player
              | accepts death
        .player-input
          .input-wrapper
            .input-background
            input(type="text" placeholder="!bang" autofocus="true" alt="player input")#play
          input(type="submit" value="submit" alt="submit")#submit

      .sidebar
        .side-title controls
        ul
          li !player [text]
          li !game [text]
          li !stat [name] [integer change]
          li !item [name] [integer change]

  footer
    p a collaborative text RPG played by 2E
    ul
      li
        a(onclick="lightToggle()") light switch
      li
        a(href="") github
```

css:

```
@import url("https://fonts.googleapis.com/css?family=Sunflower:300");

:root {
  --grey: #ddd;

  --font: "Sunflower";
}

body {
  --black: #404040;
  --white: #fff;

  font-family: var(--font) !important;
  color: var(--black);
  max-width: 850px;
  width: 100vw;
  padding: 20px 10px;
  margin: auto;
  background: var(--white);
}

body.darkness {
  --black: #fff;
  --white: #404040;
}

footer {
  position: fixed;
  bottom: 1em;
  display: flex;
  width: 100vw;
  max-width: 850px;
  justify-content: space-between;
  font-size: 0.9em;
}

footer p {
  margin: 0;
}

footer ul li {
  display: inline-block;
  margin-left: 1em;
}

ul {
  margin: 0;
  padding: 0;
  -webkit-margin: 0;
  -webkit-padding: 0;
}

li {
  list-style-type: none;
}

a {
  cursor: pointer;
  color: var(--black);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.game-wrapper {
  display: grid;
  grid-column-gap: 20px;
  grid-template-columns: 200px auto 200px;
}

.side-wrapper {
  border: 1px solid var(--black);
  margin: 10px 0 20px;
  position: relative;
  padding: 5px;
}

.side-title {
  font-weight: bold;
  margin-bottom: 0.5em;
}

#stats:before {
  content: "character stats";
  background: var(--white);
  position: absolute;
  left: 4px;
  top: -14px;
}

#items:before {
  content: "items";
  background: var(--white);
  position: absolute;
  left: 4px;
  top: -14px;
}

.stat,
.item {
  display: flex;
  justify-content: space-between;
}

.title {
  margin-bottom: 1em;
  font-size: 1.2em;
  font-weight: bold;
  font-style: italic;
}

.log-wrapper {
  width: 100%;
  height: 400px;
  margin-bottom: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  overflow-y: auto;}

.logs {
  height: 400px;
  overflow-y: auto;
  width: 100%;
}

.logs .log.update {
  font-style: italic;
}

.logs .log.player {
  position: relative;
  padding-left: 14px;
  margin-top: 1em;
}

.logs .log.player:before {
  content: ">";
  position: absolute;
  left: 0px;
}

.player-input {
  position: relative;
  display: flex;
  justify-content: space-between;
}

.player-input input {
  font-family: var(--font);
  font-size: 0.9em;
}

.player-input input[type="text"] {
  position: absolute;
  width: calc(100% - 0.3em);
  padding: 0.2em 0 0.2em 0.3em;
  border: none;
  background: none;
  color: var(--white);
  z-index: 9;
}

.player-input input[type="text"]:focus {
  outline: none;
  border-bottom-color: var(--black);
}

.player-input input[type="text"]::placeholder {
  color: var(--white);
  opacity: 0.6;
}

.player-input .input-wrapper {
  position: relative;
  height: 1.3em;
  width: calc(100% - 70px - 0.3em);
  padding: 0.2em 0.3em;
  margin-right: 0.3em;
}

.player-input .input-background {
  height: calc(100%);
  width: calc(100%);
  background: var(--black);
  position: absolute;
  top: 0;
  left: 0;
  animation: wipe 0.5s ease-in-out;
}

.player-input input[type="submit"] {
  background: none;
  color: var(--black);
  border-radius: 0;
  border: 1px solid var(--black);
  cursor: pointer;
}

.player-input input[type="submit"]:active {
  background: var(--grey);
  outline: none;
}

.player-input input[type="submit"]:focus {
  outline: none;
}

@keyframes wipe {
  from {
    width: 0;
  }
  to {
    width: calc(100%);
  }
}
```

javascript:

```
function bottomScroll() {
  var height = 0;
  var logs = document.getElementById("logs");
  var height = logs.scrollHeight;

  logs.scrollTop = height;
}

function lightToggle() {
  document.body.classList.toggle("darkness");
}
```

## JSON storage

since my app is really simple, i'm just going to store all my data in a JSON file. our `state.json` will have the following structure:

```
{
  "logs": [
    {
      "time": TIMESTAMP,
      "type": STRING,
      "value": STRING | INT
    }
  ],
  "stats": {
    STRING: // stat name
    {
      "maxValue": INT,
      "nowValue": INT
    }
  },
  "items": {
    STRING: // item name
    {
      "descript": STRING,
      "count": INT
    }
  }
}
```

for now i'll fill in a made up value for each to do testing. now we have to get `app.js` to read our file.

```
const fs = require("fs");

// reading game state
const STATEPATH = "./state.json";
const stateFile = fs.readFileSync(STATEPATH);
var gameState = JSON.parse(stateFile);

...

// helper functions for game states
function readGameState() {
  stateFile = fs.readFileSync(STATEPATH);
  if (stateFile !== undefined) {
    console.log("Game state data received");
    gameState = JSON.parse(stateFile);
  } else {
    console.log("Error reading game state");
  }
}

function saveGameState() {
  var saveState = JSON.stringify(gameState);
  fs.writeFile(STATEPATH, saveState, function(err) {
    if (err) throw err;
    console.log("Game state saved");
  });
}
```

now we can pass in this data to the front end to render. our route for the index page in `app.js` will now look like:

```
app.get("/", function(req, res) {
  readGameState();
  res.render("index", {
    logs: gameState["logs"],
    stats: gameState["stats"],
    items: gameState["items"]
  });
});
```

and we'll change our pug code to handle this data

```
ul#stats.side-wrapper
  each detail, stat in stats
    li.stat
      span.stat-name= stat
      span.stat-num #{detail.nowValue}/#{detail.maxValue}
ul#items.side-wrapper
  each detail, item in items
    if detail.count != 0
      li.item
        span.item-name= item
        span.item-num= detail.count

...

#logs.logs
  each log in logs
    if log.type === "game"
      .log.game= log.value
    else if log.type === "update"
      .log.update= log.value
    else if log.type === "player"
      .log.player= log.value
```

awesome, we can now read and write to our database - now its time to handle user inputs

## sending user inputs

our server needs to be able to both receive, parse, and update the frontend for all users and the JSON file in the server

lets first tackle how to send input data to our server. our html should run a javascript function that will send a post request to the server

html changes:

```
.player-input
  .input-wrapper
    .input-background
    input(type="text" placeholder="!bang" autofocus="true" alt="player input" onkeydown="enterInput()")#play
  input(type="submit" value="submit" alt="submit" onclick="sendInput()")#submit
```

we'll use XMLHttpRequest to send requests with javascript (i've chosen to not submit with a form so that the front end doesn't have to refresh each time)

```
var xhttp = new XMLHttpRequest();

...

function enterInput() {
  if (event.key === "Enter") {
    sendInput();
  }
}

function sendInput() {
  var inputValue = escapeRegExp(document.getElementById("play").value);
  console.log("Received input: " + inputValue);

  xhttp.open("POST", window.location.href, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("input=" + inputValue);

  document.getElementById("play").value = "";
}

// sanitize inputs
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```

_input sanitization [credits](https://codereview.stackexchange.com/questions/153691/escape-user-input-for-use-in-js-regex)_

we'll later add some verification and error handling to the front-end, but for now, this sends a post request with our input (sanitized) and clears the input field as well. now to receive and handle post requests on the server end we'll add the following to `app.js`:

```
const bodyParser = require("body-parser");

// post request parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// receives post requests to route
app.post("/", function(req, res) {
  var input = req.body.input;
  console.log(input);
});
```

you can now test and see the console on the server and in the front end register inputs. the next step is to process the !input commands.

## processing input

we'll do a check on our server to see if the input was a valid command, and then attempt to process it. (the following was added to `app.post`):

```
var cmd = input.substring(0, input.indexOf(" "));
var val = input.substring(input.indexOf(" ") + 1);
var newLog = undefined;

if (cmd === "!player") {
  newLog = { time: Date.now(), type: "player", value: val };
} else if (cmd === "!game") {
  newLog = { time: Date.now(), type: "game", value: val };
} else if (cmd === "!stat") {
  var statPuts = val.split(" ");
  var statName = statPuts[0];
  var newValue = parseInt(statPuts[1]);
  var newMax = parseInt(statPuts[2]);

  // check if integer was parsed
  if (isNaN(newValue)) {
    return next(new Error("not a valid integer value for stat"));
  }

  // update value
  if (statName in gameState["stats"]) {
    gameState["stats"][statName]["nowValue"] = newValue;
    if (!isNaN(newMax)) {
      gameState["stats"][statName]["maxValue"] = newMax;
    }
  } else {
    gameState["stats"][statName] = { maxValue: "?", nowValue: undefined };
    gameState["stats"][statName]["nowValue"] = newValue;
    if (!isNaN(newMax)) {
      gameState["stats"][statName]["maxValue"] = newMax;
    }
  }

  newLog = {
    time: Date.now(),
    type: "update",
    value: "you now have " + newValue + " " + statName
  };
} else if (cmd === "!item") {
  var spacedex = val.indexOf(" ");
  var descripdex = val.indexOf(" ", spacedex + 1);
  var itemName = val.substring(0, spacedex);
  var newValue = undefined;
  var newDescript = undefined;
  if (descripdex > 0) {
    newValue = parseInt(val.substring(spacedex + 1, descripdex));
    newDescript = val.substring(descripdex + 1);
  } else {
    newValue = parseInt(val.substring(spacedex + 1));
  }

  // check if integer was parsed
  if (isNaN(newValue)) {
    return next(new Error("not a valid integer value for item"));
  }

  // update item
  if (!(itemName in gameState)) {
    gameState["items"][itemName] = { descript: undefined, count: undefined };
  }
  gameState["items"][itemName]["count"] = newValue;
  if (descripdex > spacedex) {
    gameState["items"][itemName]["descript"] = newDescript;
  }

  newLog = {
    time: Date.now(),
    type: "update",
    value: "you now have " + newValue + " of " + itemName
  };
} else {
  return next(new Error("not a valid command"));
}

if (typeof newLog != "undefined") {
  gameState["logs"].push(newLog);
  saveGameState();
}
```

what this basically does is see if the first thing you typed was a command and then try to match that with an action that modifies the database. however, if you make an invalid change, all it does right now is throw an error on the server side. let's give some indication to the user that something bad has happened. we'll do this as part of the live updating.

## live updates

_with aid from [socket tutorial](https://socket.io/get-started/chat/)_

let's start by enabling live updates - for if you noticed above, a refresh was required to repopulate with the latest database changes. we'll be using socket for this, so start by installing that

```
$ npm install socket.io --save
```

socket allows you to broadcast a signal to all users accessing and make live changes to all their sites to create real-time-iness.

we'll start by initializing socket on the server.

```
var http = require('http').Server(app);
const io = require('socket.io')(http);
```

and change `app.listen` to `http.listen` so it looks like:

```
http.listen(PORT, function() {
  console.log("Running onionvale on port " + PORT + "!");
});
```

the socket needs to listen to an HTTP server in order to create a connection. now to connect on the client-side we'll add socket by adding

```
script(src="/socket.io/socket.io.js")
```

to `index.pug` and before `script.js`, and then the following to `script.js`

```
var socket = io();
```

now our server `app.js` can recognize when a connection is established and can execute code on connection such as:

```
io.on('connection', function(socket){
  console.log('a user connected');
});
```

before we enable live updates - let's explore how socket works with error handling. in `script.js` we'll create the following error handler:

```
socket.on("error", function(err) {
  var logs = document.getElementById("logs");
  var error = document.createElement("div");

  error.classList.add("log");
  error.classList.add("error");

  error.innerHTML = "error: " + err;

  logs.appendChild(error);
  bottomScroll();
});
```

for this to work, we need to modify our server side error messages to. so errors will be thrown like:

```
return next("not a valid integer value for stat");
```

and not

```
return next(new Error("not a valid integer value for stat"))
```

and we'll modify the `next()` function:

```
function next(err) {
  io.emit("error", err);
  console.log(new Error(err));
}
```

now if we throw an error, a line will be added to the logs. we can style it as below in `style.css`.

```
.logs .log.error {
  color: orangered;
}
```

but right now, it broadcasts the error message to everyone - and we only want to send that to the person who made the error. `io.emit` sends to everyone connected on the server, so we're actually gonna have to make a couple of big changes to make emits socket specific.

we'll change our post route into a function:

```
function userInput(input, socket) {
  // var input = req.body.input;
  console.log("Received user input: " + input);
  ...
  return next('ERROR TEXT', socket)
  ...
}
```

then on connection and the socket emitting an input we'll trigger that function

```
io.on("connection", function(socket) {
  console.log("a user connected");
  socket.on("user input", function(msg) {
    userInput(msg, socket);
  });
});
```

in `next()` we'll only emit to this socket now

```
function next(err, socket) {
  socket.emit("err", err);
  console.log(new Error(err));
}
```

and we need to emit instead of post in `script.js`

```
function sendInput() {
  var inputValue = escapeRegExp(document.getElementById("play").value);
  console.log("Received input: " + inputValue);

  socket.emit("user input", inputValue);

  document.getElementById("play").value = "";
}
```

(xhttp is now not used). with these modifications, errors are socket specific. with this understanding, lets add live-updates with socket.

sending information from the server `app.js`:

```
else if (cmd === "!stat") {
  ...

  var maxVal = gameState["stats"][statName]["maxValue"];

  newLog = {
    time: Date.now(),
    type: "update",
    value: "you now have " + newValue + " of " + maxVal + " " + statName
  };

  io.emit("stat update", statName, newValue, maxVal);
} else if (cmd === "!item") {
  ...

  io.emit(
    "item update",
    itemName,
    gameState["items"][itemName]["count"],
    gameState["items"][itemName]["descript"]
  );
}

...

if (typeof newLog != "undefined") {
  io.emit("log", newLog); // send to all sockets
  gameState["logs"].push(newLog);
  saveGameState();
}
```

to update the front-end, we're going to add some ids to `index.pug`:

```
ul#stats.side-wrapper
  each detail, stat in stats
    li.stat
      span.stat-name= stat
      span.stat-num(id= stat) #{detail.nowValue}/#{detail.maxValue}
ul#items.side-wrapper
  each detail, item in items
    if detail.count != 0
      li.item
        span.item-name= item
        span.item-num(id= item + "Count")= detail.count
```

finally to display updates on the front-end, we'll have `script.js` interact with the html

```
// live log updates
socket.on("log", function(log) {
  var logs = document.getElementById("logs");

  var logDOM = document.createElement("div");
  logDOM.classList.add("log");

  if (log.type === "player") {
    logDOM.classList.add("player");
  } else if (log.type === "game") {
    logDOM.classList.add("game");
  } else if (log.type === "update") {
    logDOM.classList.add("update");
  }

  logDOM.innerHTML = log.value;

  logs.appendChild(logDOM);
  bottomScroll();
});

// live stat updates
socket.on("stat update", function(name, val, max) {
  var stat = document.getElementById(name);
  if (stat == null) {
    // new stat
    var statDOM = document.createElement("li");
    statDOM.classList.add("stat");
    var nameDOM = document.createElement("span");
    nameDOM.classList.add("stat-name");
    nameDOM.innerHTML = name;
    var valueDOM = document.createElement("span");
    valueDOM.classList.add("stat-num");
    valueDOM.id = name;
    valueDOM.innerHTML = val + "/" + max;

    statDOM.appendChild(nameDOM);
    statDOM.appendChild(valueDOM);
    document.getElementById("stats").appendChild(statDOM);
  } else {
    // pre-existing stat
    stat.innerHTML = val + "/" + max;
    stat.classList.add("fade");
    setTimeout(function() {
      stat.classList.remove("fade");
    }, 60);
  }
});

// live item updates
socket.on("item update", function(name, count, descript) {
  var itemCount = document.getElementById(name + "Count");
  if (itemCount == null) {
    // new item
    var itemDOM = document.createElement("li");
    itemDOM.classList.add("item");
    var nameDOM = document.createElement("span");
    nameDOM.classList.add("item-name");
    nameDOM.innerHTML = name;
    var countDOM = document.createElement("span");
    countDOM.classList.add("item-num");
    countDOM.id = name + "Count";
    countDOM.innerHTML = count;

    itemDOM.appendChild(nameDOM);
    itemDOM.appendChild(countDOM);
    document.getElementById("items").appendChild(itemDOM);
  } else {
    // pre-existing item
    itemCount.innerHTML = count;
    itemCount.classList.add("fade");
    setTimeout(function() {
      itemCount.classList.remove("fade");
    }, 60);
  }
});
```

and that's live updating! this is the barebones of onionvale. as you may have noticed, i did not implement anything to do with users or rules into the game - its merely a platform. read design evaluations to learn more about why i've done this. thanks for reading~

## design evaluations

onionvale is designed for play by 2E, a small community of friends. as such, this implementation stresses less on enforcing community rules (such as not allowing replies to one's own message or timeouts before another message). instead, i've tried to create much more of an open platform for the community to iterate, be creative, and follow an honor system. this system, of course, is much less viable when the community grows much larger. i have, however, prevented javascript and html injection, but am considering allowing some (tbd)

future versions may include small enforcements of rules such as not being able to reply to one's self, cooldowns before one can reply again, and disallowing two !player calls in a row.

onionvale welcomes comments and reccomendations
