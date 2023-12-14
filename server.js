let gameState = 0;
// Состояния игры
// 0 - Игра не началась
// 1 - Присоединился первый игрок
// 2 - Присоединился второй игрок (Игра началась)
let gameStatus = "in process"; // "in process", "result"
let winner = "";
let firstPlayer = "";
let secondPlayer = "";
// Поле
let gameTable = {};
let firstPlayerCanMoveCnt = 0;
let firstPlayerCanMoveHere = {};
let secondPlayerCanMoveCnt = 0;
let secondPlayerCanMoveHere = {};
let move = 0;
let dx = [ -1, -1, -1,  0,  0,  1,  1,  1];
let dy = [ -1,  0,  1, -1,  1, -1,  0,  1];

function elemName(i, j) {
	return "e_" + i + "_" + j;
}

function initGame() {
	initGameTable();
	gameState = 0;
	gameStatus = "in process";
	winner = "";
	firstPlayer = "";
	move = 0;
}

function initGameTable() {
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			gameTable[elemName(i, j)] = 0;
			// 0 - пустая клетка
			// 1 - x (крестик сделал свой ход)
			// 2 - xO (кружок перекрыл ход крестика)
			// 3 - o (кружок сделал свой ход)
			// 4 - oX (крестик перекрыл ход кружка)
		}
	}
}

function firstDFS(x, y) {
	firstPlayerCanMoveHere[elemName(x, y)] = 1;
	for (let i = 0; i < 8; i++) {
		let X = x + dx[i], Y = y + dy[i];
		if (0 <= X && X < 10 && 0 <= Y && Y < 10) {
			if (firstPlayerCanMoveHere[elemName(X, Y)] == 0) {
				if (gameTable[elemName(X, Y)] == 0 || gameTable[elemName(X, Y)] == 3) {
					firstPlayerCanMoveHere[elemName(X, Y)] = 1;
				}
				if (gameTable[elemName(X, Y)] == 1 || gameTable[elemName(X, Y)] == 4) {
					firstDFS(X, Y);
				}
			}
		}
	}
}

function secondDFS(x, y) {
	secondPlayerCanMoveHere[elemName(x, y)] = 1;
	for (let i = 0; i < 8; i++) {
		let X = x + dx[i], Y = y + dy[i];
		if (0 <= X && X < 10 && 0 <= Y && Y < 10) {
			if (secondPlayerCanMoveHere[elemName(X, Y)] == 0) {
				if (gameTable[elemName(X, Y)] == 0 || gameTable[elemName(X, Y)] == 1) {
					secondPlayerCanMoveHere[elemName(X, Y)] = 1;
				}
				if (gameTable[elemName(X, Y)] == 3 || gameTable[elemName(X, Y)] == 2) {
					secondDFS(X, Y);
				}
			}
		}
	}
}

function gameMove(x, y) {
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			firstPlayerCanMoveHere[elemName(i, j)] = 0;
			secondPlayerCanMoveHere[elemName(i, j)] = 0;
		}
	}
	if (gameTable[elemName(0, 0)] == 0) firstPlayerCanMoveHere[elemName(0, 0)] = 1;
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			if (firstPlayerCanMoveHere[elemName(i, j)] == 0 && gameTable[elemName(i, j)] == 1) {
				firstDFS(i, j);
			}
		}
	}
	if (gameTable[elemName(9, 9)] == 0) secondPlayerCanMoveHere[elemName(9, 9)] = 1;
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			if (secondPlayerCanMoveHere[elemName(i, j)] == 0 && gameTable[elemName(i, j)] == 3) {
				secondDFS(i, j);
			}
		}
	}
	firstPlayerCanMoveCnt = 0;
	secondPlayerCanMoveCnt = 0;
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			if (firstPlayerCanMoveHere[elemName(i, j)] == 1 &&
				(gameTable[elemName(x, y)] == 0 || gameTable[elemName(x, y)] == 3)) {
				firstPlayerCanMoveCnt++;
			}
			if (secondPlayerCanMoveHere[elemName(i, j)] == 1 &&
				(gameTable[elemName(x, y)] == 0 || gameTable[elemName(x, y)] == 1)) {
				secondPlayerCanMoveCnt++;
			}
		}
	}
	if (move < 3) {
		if (firstPlayerCanMoveCnt == 0) {
			gameStatus = "result";
			winner = secondPlayer;
		}
		if (firstPlayerCanMoveHere[elemName(x, y)] == 1) {
			if (gameTable[elemName(x, y)] == 0) {
				gameTable[elemName(x, y)] = 1;
				move = (move + 1) % 6;
			}
			else if (gameTable[elemName(x, y)] == 3) {
				gameTable[elemName(x, y)] = 4;
				move = (move + 1) % 6;
			}
		}
	}
	else {
		if (secondPlayerCanMoveCnt == 0) {
			gameStatus = "result";
			winner = firstPlayer;
		}
		if (secondPlayerCanMoveHere[elemName(x, y)] == 1 && gameTable[elemName(x, y)] != 3) {
			if (gameTable[elemName(x, y)] == 0) {
				gameTable[elemName(x, y)] = 3;
				move = (move + 1) % 6;
			}
			else if (gameTable[elemName(x, y)] == 1) {
				gameTable[elemName(x, y)] = 2;
				move = (move + 1) % 6;
			}
		}
	}
}

initGame();

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
		console.log("sending to client... " + instance);
		ws.send(JSON.stringify(message));
	}
	messageEmitter.on("newmessage", callback);
	ws.on("message", function incoming(message) {
		console.log("recieved: " + message);
		let mes = JSON.parse(message);
		//mes.type == "table_request"
		//mes.type == "player_move", mes.coordX, mes.coordY
		//mes.type == "history_request"
		if (mes.type == "table_request" || mes.type == "player_move") {
			console.log(mes.type + " from " + req.headers.cookie);
			if (mes.type == "player_move") {
				console.log("X = " + mes.coordX + "; y = " + mes.coordY + ";");
				if (move < 3) {
					if (req.headers.cookie == "player=" + firstPlayer) {
						gameMove(mes.coordX, mes.coordY);
					}
				}
				else {
					if (req.headers.cookie == "player=" + secondPlayer) {
						gameMove(mes.coordX, mes.coordY);
					}
				}
				
			}
			let res = {type:"table", table:gameTable, gameStatus:gameStatus};
			if (gameStatus == "result") {
				res.winner = winner;
			}
			messageEmitter.emit("newmessage", res);
			if (gameStatus == "result") {
				// отправить информацию в БД
				// обнулить состояние игры
				initGame();
				
			}
		}
		else if (mes.type == "history_request") {
			console.log(mes.type + " from " + req.headers.cookie);
			// TODO!!!
		}
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
