// dependencies
const express = require("express");
const path = require("path");
const pug = require("pug"); // view engine
const bodyParser = require("body-parser");
const fs = require("fs"); // allows read/write to json
const mongoose = require("mongoose");

const config = require("./config.js");

const app = express();
const PORT = 8080;

// database connection
//mongoose.connect("mongodb://localhost/onionvale");
mongoose.connect(config.MONGOLAB_URI);
var connection = mongoose.connection;
connection.on("error", console.error.bind(console, "connection error:"));
connection.on("connected", function() {
  console.log("database connected!");
});

// mongoose models
var Logs = mongoose.model(
  "Logs",
  new mongoose.Schema({
    time: { type: Date, required: true, default: Date.now() },
    type: String,
    value: String
  }),
  "Logs"
);
var Stats = mongoose.model(
  "Stats",
  new mongoose.Schema({
    name: { type: String, required: true },
    maxValue: mongoose.Schema.Types.Mixed,
    nowValue: Number
  }),
  "Stats"
);
var Items = mongoose.model(
  "Items",
  new mongoose.Schema({
    name: { type: String, required: true },
    descript: String,
    count: Number
  }),
  "Items"
);

// socket
var http = require("http").Server(app);
const io = require("socket.io")(http);

// reading game state
// const STATEPATH = "./state.json";
// var stateFile = fs.readFileSync(STATEPATH);
// var gameState = JSON.parse(stateFile);
var gameState = { logs: null, stats: {}, items: {} };

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
  readGameState(function() {
    res.render("index", {
      logs: gameState["logs"],
      stats: gameState["stats"],
      items: gameState["items"]
    });
  });
});

// handling user response
function userInput(input, socket) {
  console.log("Received user input: " + input);

  var cmd = input.substring(0, input.indexOf(" "));
  var val = input.substring(input.indexOf(" ") + 1);
  var newLog = undefined;

  if (cmd === "!player") {
    newLog = { time: Date.now(), type: "player", value: val };
    saveLogToGameState(newLog);
  } else if (cmd === "!game") {
    newLog = { time: Date.now(), type: "game", value: val };
    saveLogToGameState(newLog);
  } else if (cmd === "!stat") {
    statInput(val, socket);
  } else if (cmd === "!item") {
    itemInput(val, socket);
  } else {
    return next("not a valid command", socket);
  }
}

function statInput(val, socket) {
  var statPuts = val.split(" ");
  var statName = statPuts[0];
  var newValue = parseInt(statPuts[1]);
  var newMax = parseInt(statPuts[2]);
  var maxVal = "?";

  // check if integer was parsed
  if (isNaN(newValue)) {
    return next("not a valid integer value for stat", socket);
  }

  // update value
  if (statName in gameState["stats"]) {
    Stats.findOne({ _id: gameState["stats"][statName].id }, function(
      err,
      stat
    ) {
      stat.nowValue = newValue;
      maxVal = stat.maxValue;
      if (!isNaN(newMax)) {
        stat.maxValue = newMax;
        maxVal = newMax;
      }

      stat.save(function(err, data) {
        if (err) {
          console.log(err);
          next(err, socket);
        }
      });

      newLog = {
        time: Date.now(),
        type: "update",
        value: "you now have " + newValue + " of " + maxVal + " " + statName
      };

      saveLogToGameState(newLog);
      io.emit("stat update", statName, newValue, maxVal);
      console.log("saved stat");
    });
  } else {
    var newStat = { name: statName, maxValue: "?", nowValue: newValue };
    if (!isNaN(newMax)) {
      newStat["maxValue"] = newMax;
      maxVal = newMax;
    }
    Stats.create(newStat, function(err, stat) {
      if (err) {
        console.log(err);
        next(err, socket);
      }
    });

    newLog = {
      time: Date.now(),
      type: "update",
      value: "you now have " + newValue + " of " + maxVal + " " + statName
    };

    saveLogToGameState(newLog);
    io.emit("stat update", statName, newValue, maxVal);
    console.log("saved stat");
  }
}

function itemInput(val, socket) {
  var spacedex = val.indexOf(" ");
  var descripdex = val.indexOf(" ", spacedex + 1);
  var itemName = val.substring(0, spacedex);
  var itemDescript = undefined;
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
    var newItem = { name: itemName, descript: undefined, count: newValue };

    if (descripdex > spacedex) {
      newItem["descript"] = newDescript;
      itemDescript = newDescript;
    }

    Items.create(newItem, function(err, item) {
      if (err) {
        console.log(err);
        next(err, socket);
      }
    });
  } else {
    Items.findOne(
      { _id: mongo.ObjectId(gameState["items"][itemName].id) },
      function(err, item) {
        item.count = newValue;
        if (descripdex > spacedex) {
          item.descript = newDescript;
        }
        itemDescript = item.descript;

        item.save(function(err, data) {
          if (err) {
            console.log(err);
          }
        });
      }
    );
  }

  newLog = {
    time: Date.now(),
    type: "update",
    value: "you now have " + newValue + " of " + itemName
  };

  saveLogToGameState(newLog);
  io.emit("item update", itemName, newValue, itemDescript);
  console.log("saved item");
}

// socket connection
io.on("connection", function(socket) {
  console.log("a user connected");
  socket.on("user input", function(msg) {
    userInput(msg, socket);
  });
});

// helper functions for Mongo game states
function readGameState(callback) {
  Logs.find({}, function(err, logs) {
    if (err) {
      console.log(err);
    } else if (logs) {
      gameState["logs"] = logs;
    }

    Stats.find({}, function(err, stats) {
      if (err) {
        console.log(err);
      } else if (stats) {
        for (s of stats) {
          gameState["stats"][s.name] = s;
        }
      }

      Items.find({}, function(err, items) {
        if (err) {
          console.log(err);
        } else if (items) {
          for (i of items) {
            gameState["items"][i.name] = i;
          }

          callback();
        }
      });
    });
  });
}

function saveLogToGameState(newLog) {
  if (typeof newLog != "undefined") {
    io.emit("log", newLog); // send to all sockets
    Logs.create(newLog, function(err, log) {
      if (err) {
        console.log(err);
        next(err, socket);
      } else {
        console.log("saved log");
      }
    });
  }
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
