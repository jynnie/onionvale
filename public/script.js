// var xhttp = new XMLHttpRequest();
var socket = io();
var light;

function init() {
  setLight();
  bottomScroll();
}

function bottomScroll() {
  var height = 0;
  var logs = document.getElementById("logs");
  var height = logs.scrollHeight;

  logs.scrollTop = height;
}

// light switch functions
function setLight() {
  light = window.localStorage.getItem("light");
  if (light == null || light === "true") {
    light = "true";
  } else if (light === "false") {
    light = "false";
    document.body.classList.add("darkness");
  }
}

function lightToggle() {
  document.body.classList.toggle("darkness");

  light = window.localStorage.getItem("light");
  if (light == null || light === "true") {
    light = "false";
  } else if (light === "false") {
    light = "true";
  }
  window.localStorage.setItem("light", light);
}

function enterInput() {
  if (event.key === "Enter") {
    sendInput();
  }
}

// mobile sidebar handler
function toggleSidebar() {
  let wrap = document.getElementById("wrapper");
  wrap.classList.toggle("open-sidebar");
}

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

// error handler
socket.on("err", function(err) {
  var logs = document.getElementById("logs");
  var errorDOM = document.createElement("div");

  errorDOM.classList.add("log");
  errorDOM.classList.add("error");

  errorDOM.innerHTML = "error: " + err;

  logs.appendChild(errorDOM);
  bottomScroll();
});

function sendInput() {
  var inputValue = sanitize(document.getElementById("play").value);
  console.log("Sent input: " + inputValue);

  socket.emit("user input", inputValue);

  document.getElementById("play").value = "";
}

// sanitize inputs
// citation: https://github.com/cure53/DOMPurify
function sanitize(dirty) {
  console.log(dirty);
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "em", "marquee", "img", "a"],
    FORBID_TAGS: ["style", "script"]
  });
}
