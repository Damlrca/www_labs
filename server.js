let gameState = 0;
// Состояния игры
// 0 - Игра не началась
// 1 - Присоединился первый игрок
// 2 - Присоединился второй игрок (или игра уже идёт)
let gameStatus = "in process"; // "in process", "result"
let winner = "";
let firstPlayer = "";
let secondPlayer = "";
let move = 0;
// Поле
let gameTable = {};
let firstPlayerCanMoveCnt = 0;
let firstPlayerCanMoveHere = {};
let secondPlayerCanMoveCnt = 0;
let secondPlayerCanMoveHere = {};

let dx = [ -1, -1, -1,  0,  0,  1,  1,  1];
let dy = [ -1,  0,  1, -1,  1, -1,  0,  1];

function elemName(i, j) {
	return "e_" + i + "_" + j;
}

let timeOfStart;
let timeOfEnd;

function initGame() {
	gameState = 0;
	gameStatus = "in process";
	winner = "";
	firstPlayer = "";
	secondPlayer = "";
	move = 0;
	initGameTable();
	calcCanMoves();
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

function calcCanMoves() {
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			firstPlayerCanMoveHere[elemName(i, j)] = 0;
			secondPlayerCanMoveHere[elemName(i, j)] = 0;
		}
	}
	
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			if (firstPlayerCanMoveHere[elemName(i, j)] == 0 && gameTable[elemName(i, j)] == 1) {
				firstDFS(i, j);
			}
		}
	}
	if (gameTable[elemName(0, 0)] == 0) firstPlayerCanMoveHere[elemName(0, 0)] = 1;
	
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			if (secondPlayerCanMoveHere[elemName(i, j)] == 0 && gameTable[elemName(i, j)] == 3) {
				secondDFS(i, j);
			}
		}
	}
	if (gameTable[elemName(9, 9)] == 0) secondPlayerCanMoveHere[elemName(9, 9)] = 1;
	
	firstPlayerCanMoveCnt = 0;
	secondPlayerCanMoveCnt = 0;
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			let gt = gameTable[elemName(i, j)];
			if (firstPlayerCanMoveHere[elemName(i, j)] == 1 && (gt == 0 || gt == 3)) {
				firstPlayerCanMoveCnt++;
			}
			if (secondPlayerCanMoveHere[elemName(i, j)] == 1 && (gt == 0 || gt == 1)) {
				secondPlayerCanMoveCnt++;
			}
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
	if (move < 3) { // first player
		if (firstPlayerCanMoveHere[elemName(x, y)] == 1) {
			if (gameTable[elemName(x, y)] == 0) {
				if (x == 0 && y == 0) { // Время первого хода
					timeOfStart = new Date();
				}
				gameTable[elemName(x, y)] = 1;
				move = (move + 1) % 6;
			}
			else if (gameTable[elemName(x, y)] == 3) {
				gameTable[elemName(x, y)] = 4;
				move = (move + 1) % 6;
			}
		}
	}
	else { // second player
		if (secondPlayerCanMoveHere[elemName(x, y)] == 1) {
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
	
	calcCanMoves();
	
	if (move < 3) { // first player (next move)
		if (firstPlayerCanMoveCnt == 0) {
			gameStatus = "result";
			winner = secondPlayer;
		}
	}
	else { // second player (next move)
		if (secondPlayerCanMoveCnt == 0) {
			gameStatus = "result";
			winner = firstPlayer;
		}
	}
}

initGame();

const express = require("express");
const http = require("http");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const WebSocket = require("ws");
const app = express();

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

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./games_history.db", sqlite3.OPEN_READWRITE, (err)=>{
	if (err) return console.error(err.message);
});

function initDB() {
	let sql = "CREATE TABLE IF NOT EXISTS games(id INTEGER PRIMARY KEY, date0, date1, pl1, pl2, winner)";
	db.run(sql);
}

initDB();

function pushtoDB(date0, date1, pl1, pl2, winner) {
	let sql = "INSERT INTO games(date0, date1, pl1, pl2, winner) VALUES (?,?,?,?,?)";
	dp.run(sql, [date0, date1, pl1, pl2, winner], (err) => {
		if (err) return console.error(err.message);
	});
}

const EE = require("events").EventEmitter;
const messageEmitter = new EE();

var server = http.createServer(app);
var wss = new WebSocket.Server({server});
server.listen(8181, function listening() {
	console.log("listening on port " + server.address().port);
});
wss.on("connection", function connection(ws, req) {
	console.log("new client connected. cookie: " + req.headers.cookie);
	const callback = function(message) {
		console.log("sending to client. cookie: " + req.headers.cookie);
		ws.send(JSON.stringify(message));
	}
	messageEmitter.on("newmessage", callback);
	ws.on("message", function incoming(message) {
		console.log("receiving: " + req.headers.cookie);
		let mes = JSON.parse(message);
		console.log("received: mes.type = " + mes.type);
		//mes.type == "table_request"
		//mes.type == "player_move", mes.coordX, mes.coordY
		//mes.type == "history_request"
		if (mes.type == "table_request" || mes.type == "player_move") {
			if (mes.type == "player_move") {
				console.log("move {X=" + mes.coordX + "; y=" + mes.coordY + "}");
				if (move < 3) {
					if (gameState == 2 && req.headers.cookie == "player=" + firstPlayer)
						gameMove(mes.coordX, mes.coordY);
				}
				else {
					if (gameState == 2 && req.headers.cookie == "player=" + secondPlayer)
						gameMove(mes.coordX, mes.coordY);
				}
				
			}
			let res = {type:"table", table:gameTable, gameStatus:gameStatus};
			if (gameStatus == "result")
				res.winner = winner;
			messageEmitter.emit("newmessage", res);
			if (gameStatus == "result") {
				// Время последнего хода
				timeOfEnd = new Date();
				// send result to DB
				// [timeOfStart, timeOfEnd, firstPlayer, secondPlayer, winner]
				// TODO!!!
				// reset game state
				initGame();
			}
		}
		else if (mes.type == "history_request") {
			let res = {type:"htable", htable:"aaaa"};
			// TODO!!!
			messageEmitter.emit("newmessage", res);
		}
	});
	ws.on("close", function close() {
		console.log("socket closed for client. cookie: " + req.headers.cookie);
		messageEmitter.off("newmessage", callback);
	});
});

app.get("/", function(req, res) {
	data = fs.readFileSync("index.html");
	res.end(data);
});

app.get("/game.html", function(req, res) {
	updatePlayerCookie(req, res);
	let player = req.cookies["player"];
	if (player != firstPlayer && player != secondPlayer) {
		res.redirect("/error.html?error=Вы+не+участвуете+в+текущей+игре");
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
			res.redirect("/error.html?error=Первый+игрок+уже+присоединился+к+игре");
		}
		else if (gameState == 2) {
			res.redirect("/error.html?error=Оба+игрока+уже+присоединились+к+игре");
		}
	}
	else {
		firstPlayer = player;
		gameState = 1;
		console.log("Первый игрок (" + player + ")присоединился к игре.");
		res.redirect("/game.html");
	}
});

app.get("/joingame", function(req, res) {
	updatePlayerCookie(req, res);
	let player = req.cookies["player"];
	if (gameState == 2) {
		res.redirect("/error.html?error=Оба+игрока+уже+присоединились+к+игре");
	}
	else if (gameState == 0) {
		res.redirect("/error.html?error=Первый+игрок+ещё+не+присоединился+к+игре");
	}
	else if (firstPlayer == player) {
		res.redirect("/error.html?error=Вы+уже+являеетесь+первым+игроком");
	}
	else {
		secondPlayer = player;
		gameState = 2;
		console.log("Второй игрок (" + player + ")присоединился к игре.");
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
