// dependencies
const express = require("express");
const path = require("path");
const pug = require("pug"); // view engine
const bodyParser = require("body-parser");
const fs = require("fs"); // allows read/write to json

const app = express();
const PORT = 8080;

// socket
var http = require("http").Server(app);
const io = require("socket.io")(http);

// reading game state
const STATEPATH = "./state.json";
var stateFile = fs.readFileSync(STATEPATH);
var gameState = JSON.parse(stateFile);

// setting file paths
app.set("views", path.join(__dirname, "views"));
app.use("/static", express.static(path.join(__dirname, "public")));

// rendering engine
app.set("view engine", "pug");

// post request parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//routes
app.get("/", function(req, res) {
  readGameState();
  res.render("index", {
    logs: gameState["logs"],
    stats: gameState["stats"],
    items: gameState["items"]
  });
});

function userInput(input, socket) {
  // var input = req.body.input;
  console.log("Received user input: " + input);

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
      return next("not a valid integer value for stat", socket);
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

    var maxVal = gameState["stats"][statName]["maxValue"];

    newLog = {
      time: Date.now(),
      type: "update",
      value: "you now have " + newValue + " of " + maxVal + " " + statName
    };

    io.emit("stat update", statName, newValue, maxVal);
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
      return next("not a valid integer value for item", socket);
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

    io.emit(
      "item update",
      itemName,
      gameState["items"][itemName]["count"],
      gameState["items"][itemName]["descript"]
    );
  } else {
    return next("not a valid command", socket);
  }

  if (typeof newLog != "undefined") {
    io.emit("log", newLog); // send to all sockets
    gameState["logs"].push(newLog);
    saveGameState();
  }
}

// socket connection
io.on("connection", function(socket) {
  console.log("a user connected");
  socket.on("user input", function(msg) {
    userInput(msg, socket);
  });
});

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

// socket specific error handling of inputs
function next(err, socket) {
  socket.emit("err", err);
  console.log(new Error(err));
}

// serving application
http.listen(PORT, function() {
  console.log("Running onionvale on port " + PORT + "!");
});
