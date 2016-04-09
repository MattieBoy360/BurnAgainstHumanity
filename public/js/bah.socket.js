var socket = io();
var NOTIFICATION_TIME = 5000;

socket.on('connect', function(){
		// call the server-side function 'adduser' and send one parameter (value of prompt)
		socket.emit('adduser', prompt("What's your name?"));

		//Game over, let us know our final score and reset
		socket.on('endGame', function() {
			cleanUp();
			alert("Game over!\nYou scored: " + score);
			score = 0;
		});

		//Each new round
		socket.on('newRound', function(data) {
			newRound(data);
		});

		//When player who played leaves, remove their card from board
		socket.on('removeCard', function(data) {
			removeCard(data);
		});

		//Notify us a player has left
		socket.on('playerLeft', function(username) {
			notify('Player ' + username + ' left!');
		});

		//End round and let us know who won
		socket.on('winner', function(data) {
			endRound(data);
		});

		//We scored, so add a point and update
		socket.on('scored', function() {
			score++;
			$("#score").text(score);
		});

		//We are the card czar
		socket.on('areCzar', function() {
			cardCzar = true;
			$("#titleBar").text('Burn Against Humanity - You are the card czar!');
		});

		//Display who is the card czar
		socket.on('updateCzar', function(name) {
			$("#cardCzarName").text(name);
		});

		//Add a card to our hand
		socket.on('addCard', function(data) {
			$("#whitecards").append('<img id="'+data.card+'" class="back selectable whitecard" src="img/smallwhite/' + data.card + '.png" width="150" />');
		});

		//Notify us player has joined
		socket.on('playerAdded', function(username) {
			notify('Player ' + username + ' joined!');
		});

		//Set up our new game
		socket.on('join', function(data) {
			setUpGame(data);
		});

		//A new card has been played, add it to the board
		socket.on('cardPlayed', function(data) {
			boardHand.push(data.card);
			$("#activeHand").append('<img class="front whitecard" src="img/burn-back-white.png" width="150" />');
		});

		//Tell us how many players needed to start the game
		socket.on('waiting', function(data) {
			$("#titleBar").text('Burn Against Humanity - Waiting for ' + data.number + ' more player(s).');
		});

		//We're ready to view the cards, show them and trigger card czar rights
		socket.on('revealCards', function() {
			revealCards();
		});
	});


//Make whitecards clickable even when we append
 $(document).on('click', '#whitecards .whitecard', function() { 
 	//If we havent played, and are playing a game, and aren't the card czar
    if(!hasPlayed && playing && !cardCzar) {
 		//Tell server we picked this card
    	socket.emit('addCard', { card: $(this).attr('id')});
    	//We've played a card
    	hasPlayed = true;
    	//Update the title telling us to wait and remove our card
    	$("#titleBar").text('Burn Against Humanity - Waiting for others...');
    	$(this).remove();
    
   }
   //If we click and we're the card czar, inform.
   else if(cardCzar) {
   		notify("You're the card czar!");
   }
   //If we click and we're not playing, inform.
   else if(!playing) {
      notify("You're not in a game!");
   }
   //Else we've already played a card.
   else  {
      notify("You've already played a card this round!");
   }
  });

