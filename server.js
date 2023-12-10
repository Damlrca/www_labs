const express = require("express");
const http = require("http");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const WebSocket = require("ws");
const bodyParser = require("body-parser")
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const EE = require("events").EventEmitter;
const messageEmitter = new EE();

var server = http.createServer(app);
var wss = new WebSocket.Server({server});
server.listen(8181, function listening() {
	console.log("listening on port " + server.address().port);
});
let numberOfClients = 0;
wss.on("connection", function connection(ws, req) {
	let instance = numberOfClients++;
	console.log("new client connected " + instance);
	console.log("cookie: " + req.headers.cookie)
	const callback = function(message) {
		console.log("in callback: message=" + message);
		console.log("aaaa: message=" + message);
		ws.send(String(message));
		console.log("sending to client... " + instance);
	}
	messageEmitter.on("newmessage", callback);
	ws.on("message", function incoming(message) {
		console.log("recieved: " + message);
		let message_JSON = JSON.parse(message);
		console.log("x=" + message_JSON.X + " y=" + message_JSON.Y);
		messageEmitter.emit("newmessage", message)
	});
	ws.on("close", function close() {
		console.log("socket closed for client " + instance);
		messageEmitter.off("newmessage", callback);
	});
});

app.use(cookieParser());
let playersCount = 0;
function updatePlayerCookie(req, res) {
	if (!req.cookies["player"]) {
		let player = "player" + playersCount;
		playersCount++;
		res.cookie("player", player);
		req.cookies["player"] = player;
	}
}

let gameState = 0; // 0 - Игра не началась
// 1 - Присоединился первый игрок
// 2 - Присоединился второй игрок (Игра началась)
let firstPlayer = "";
let secondPlayer = "";

app.get("/", function(req, res) {
	data = fs.readFileSync("index.html");
	res.end(data);
});

app.get("/game.html", function(req, res) {
	updatePlayerCookie(req, res);
	let player = req.cookies["player"];
	if (player !== firstPlayer && player !== secondPlayer) {
		res.redirect("/error.html?error=Вы+не+правильный+игрок");
	}
	else {
		data = fs.readFileSync("game.html");
		res.end(data);
	}
});

app.get("/startgame", function(req, res) {
	updatePlayerCookie(req, res);
	let player = req.cookies["player"];
	if (gameState != 0) {
		if (gameState == 1) {
			res.redirect("/error.html?error=Первый+игрок+уже+присоединился");
		}
		else if (gameState == 2) {
			res.redirect("/error.html?error=Игра+уже+началась");
		}
	}
	else {
		firstPlayer = player;
		gameState = 1;
		console.log("Первый игрок (" + player + ")присоединился к игре: ");
		res.redirect("/game.html");
	}
});

app.get("/joingame", function(req, res) {
	updatePlayerCookie(req, res);
	let player = req.cookies["player"];
	if (gameState == 2) {
		res.redirect("/error.html?error=Игра+уже+идёт");
	}
	else if (gameState == 0) {
		res.redirect("/error.html?error=Первый+игрок+ещё+не+присоединился");
	}
	else if (firstPlayer == player) {
		res.redirect("/error.html?error=Вы+уже+первый+игрок");
	}
	else {
		secondPlayer = player;
		gameState = 2;
		console.log("Второй игрок (" + player + ")присоединился к игре: ");
		res.redirect("/game.html");
	}
});

app.get("/history.html", function(req, res) {
	data = fs.readFileSync("history.html");
	res.end(data);
});

app.get("/error.html", function(req, res) {
	data = fs.readFileSync("error.html");
	res.end(data);
});

app.listen(3000);
