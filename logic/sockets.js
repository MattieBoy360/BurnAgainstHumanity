var Game = require('./game');

var whiteDeck;
var blackDeck;

var lastQuestion;
var lastAnswer;

var activeHand = {};
var cardCzar;
var cardCzarName;
var currentQuestion;
var clients = [];
var usernames = {};
var userHands = {};
var winner;
var playing = false;
var players = 0;
var hand = 0;
module.exports = function(io) {
	
	
io.on('connection', function(socket){
	console.log('a user connected with id ' + socket.id);
	clients.push(socket.id);

	console.log(clients);
	socket.isPlaying = false;
	socket.on('disconnect', function() {
		var left = getUsernameByID(socket.id);
		delete usernames[socket.id];
		if(socket.isPlaying) {
			players--;
		}
		if(!playing) {
			
			io.emit('waiting', {number: 3-players});
		}
		if((playing && players < 3)) {
			
			io.emit('endGame');
			
			playing = false;
			gameOver();
			io.emit('waiting', {number: 3-players});
		}	
		if(playing) {
			var take = removeUsersCards(socket.id);
			io.emit('removeCard', {card: take});
		}
		io.emit('playerLeft', left);
		clients.splice(clients.indexOf(socket.id), 1);

	});

	socket.on('adduser', function(username) {
		socket.isPlaying = true;
		if(clients.length<3) {
			
			socket.username = username;
			usernames[socket.id] = username;
			players++;
			io.emit('waiting', {number: 3-players});
			socket.broadcast.emit('playerAdded', username);
		} 
		else if(clients.length==3) {
			
				socket.username = username;
				usernames[socket.id] = username;
				players++;
				socket.broadcast.emit('playerAdded', username);
				setUpGame();
				console.log(currentQuestion);
				for(i = 0; i < clients.length; i++) {
					var wcards = Game.dealWhite(whiteDeck);
					userHands[clients[i]] = wcards;
					io.to(clients[i]).emit('join', {whitecards: wcards, blackcard: currentQuestion});
				}
				cardCzarName = selectCardCzar();
				io.emit('updateCzar', cardCzarName);
				io.to(clients[cardCzar]).emit('areCzar');

				
			
		}
		else {
			
				socket.username = username;
				usernames[socket.id] = username;
				players++;
				socket.broadcast.emit('playerAdded', username);
				var wcards = Game.dealWhite(whiteDeck);
				userHands[socket.id] = wcards;
				socket.emit('join', {whitecards: wcards, blackcard: currentQuestion});
		}
	});


	socket.on('pickedWinner', function(data) {
		winnerID = activeHand[data.card];
		winner = getUsernameByID(winnerID);
		
		io.emit('winner', {winName: winner, answer: data.card});
		io.to(winnerID).emit('scored');

		setTimeout(function() {
			newRound();
			io.emit('newRound', {black: currentQuestion});
			io.emit('updateCzar', cardCzarName);
			io.to(clients[cardCzar]).emit('areCzar');
		}, 15000);

	});


	socket.on('addCard', function(data) {
		hand++;
		activeHand[data.card] = socket.id;
		removeCardFromHand(socket.id, data.card);
		var newWhite = Game.dealCard(whiteDeck);
		userHands[socket.id].push(newWhite);
		io.emit('cardPlayed', {card: data.card});
		socket.emit('addCard', {card: newWhite});
		console.log("hand is " + hand);
		console.log("players is " + players);
		if(hand == players-1) {
			io.emit('revealCards');
			console.log("reveal");
			hand = 0;
		} 
	});
  

  	
});



};

function selectCardCzar() {
	cardCzar = Math.floor(Math.random() * clients.length);
	return getUsernameByID(clients[cardCzar]);
}

function nextCardCzar() {
	cardCzar++;
	if(cardCzar >= clients.length) {
		cardCzar = 0;
	}
	return getUsernameByID(clients[cardCzar]);
}

function getUsernameByID(id) {
	return usernames[id];
}

function removeUsersCards(id) {
	for(key in activeHand) {
		if (activeHand[key] === id) {
			delete activeHand[key];
			hand--;
			return key;
		}
	}

	var addBack = userHands[id];
	for(card in addBack) {
		whiteDeck.push(card);
	}
	delete userHands[id];
}

function setUpGame() {
	whiteDeck = Game.createDeck("white");
	blackDeck = Game.createDeck("black");
	currentQuestion = Game.dealCard(blackDeck);
	playing = true;
}

function newRound() {
	blackDeck.push(currentQuestion);
	for(key in activeHand) {
			whiteDeck.push(key);
	}
	activeHand = {};
	currentQuestion = Game.dealCard(blackDeck);
	cardCzarName = nextCardCzar();

}

function removeCardFromHand(id, card) {
	var tempHand = userHands[id];
	tempHand.splice(tempHand.indexOf(card), 1);
	userHands[id] = tempHand;
}

function gameOver() {
	
	hand = 0;
	activeHand = {};

}