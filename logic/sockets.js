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
var winner;
var playing = false;
module.exports = function(io) {
	
	var players = 0;
	var hand = 0;
io.on('connection', function(socket){
	console.log('a user connected with id ' + socket.id);
	clients.push(socket.id);

	console.log(clients);

	socket.on('disconnect', function() {
		
		delete usernames[socket.id];

		players--;
		if(!playing) {
			
			io.emit('waiting', {number: 3-players});
		}
		if((playing && players < 3)) {
			
			io.emit('endGame');
			
			playing = false;
			gameOver();
			io.emit('waiting', {number: 3-players});
		}	
		clients.splice(clients.indexOf(socket.id), 1);

	});

	socket.on('adduser', function(username) {
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
					
					io.to(clients[i]).emit('join', {whitecards: Game.dealWhite(whiteDeck), blackcard: currentQuestion});
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
				socket.emit('join', {whitecards: Game.dealWhite(whiteDeck), blackcard: currentQuestion});
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
		console.log(activeHand);
		io.emit('cardPlayed', {card: data.card});
		socket.emit('addCard', {card: Game.dealCard(whiteDeck)});
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

function gameOver() {
	
	hand = 0;
	activeHand = {};

}