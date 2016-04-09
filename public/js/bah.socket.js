var socket = io();

socket.on('connect', function(){
		// call the server-side function 'adduser' and send one parameter (value of prompt)
		socket.emit('adduser', prompt("What's your name?"));

		socket.on('endGame', function() {
			alert("Game over!\nYou scored: " + score);
			cleanUp();
		});

		socket.on('newRound', function(data) {
			newRound();
			$("#blackcard .back").empty();
			$("#blackcard .back").append('<img class="blackcard" src="img/smallblack/' + data.black + '.png" width="150" />');
			$("#blackcard").flip(true);
		});

		socket.on('winner', function(data) {
			$("#titleBar").text('Burn Against Humanity - Congratulations ' + data.winName + '!');
			$("#titleBar").append('<br><span id="timer">Next round in 15...</span>');
			nextRoundTimer();
			$("#blackcard").flip(false);
			$("#winnerName").text(data.winName);

			$("#lastQuestion").empty();
			$("#lastQuestion").append('<img class="blackcard" src="img/smallblack/' + black + '.png" width="130" />');
			
			cardCzar = false;
			$("#lastAnswer").empty();
			$("#lastAnswer").append('<img id="'+data.answer+'" class="back whitecard" src="img/smallwhite/' + data.answer + '.png" width="130" />');

		});

		socket.on('scored', function() {
			score++;
			$("#score").text(score);
		});

		socket.on('areCzar', function () {
			cardCzar = true;
			$("#titleBar").text('Burn Against Humanity - You are the card czar!');
		});

		socket.on('updateCzar', function(name) {
			$("#cardCzarName").text(name);
		});

		socket.on('addCard', function(data) {
			$("#whitecards").append('<img id="'+data.card+'" class="back selectable whitecard" src="img/smallwhite/' + data.card + '.png" width="150" />');
		});

		socket.on('playerAdded', function(username) {
			$("#titleBar").append('<br><span id="notify">Player ' + username + ' joined!</span>');
			notifyTimer();
		});


		socket.on('join', function(data) {
			console.log(data);
			playing = true;
			$("#titleBar").text('Burn Against Humanity - Play a card!');
			$("#whitecards").empty();
			console.log("test");
			hand = data.whitecards;
			black = data.blackcard;

			$("#blackcard .back").html('<img class="blackcard" src="img/smallblack/' + black + '.png" width="150" />');
			
			$.each(hand, function(index, value) {
				$("#whitecards").append('<img id="'+value+'" class="back selectable whitecard" src="img/smallwhite/' + value + '.png" width="150" />');
				
			});
			$("#blackcard").flip(true);
		});

		socket.on('cardPlayed', function(data) {
			console.log("card received");
			boardHand.push(data.card);
			$("#activeHand").append('<img class="front whitecard" src="img/burn-back-white.png" width="150" />');
		});

		socket.on('waiting', function(data) {
			$("#titleBar").text('Burn Against Humanity - Waiting for ' + data.number + ' more player(s).');
		});

		socket.on('revealCards', function() {
			$("#activeHand").empty();
			if(cardCzar) {
				$("#titleBar").text('Burn Against Humanity - Pick your winning card!');
				pickWinner = true;
			} else {
				$("#titleBar").text('Burn Against Humanity - Card Czar is picking a winner...');
			}
			$.each(boardHand, function(index, value) {
				if(cardCzar) {
					$("#activeHand").append('<img id="'+value+'" class="whitecard selectable" src="img/smallwhite/' + value + '.png" width="150" />');
				}
				else {
					$("#activeHand").append('<img id="'+value+'" class="back whitecard" src="img/smallwhite/' + value + '.png" width="150" />');
				}
			});

			$("#whitecards").children().each(function() {
				$(this).removeClass('selectable');
			})
			boardHand = [];
		});
	});



 $(document).on('click', '#whitecards .whitecard', function() { 
    if(!hasPlayed && playing && !cardCzar) {
    	console.log("clicked on: " + $(this).attr('id'));
    	socket.emit('addCard', { card: $(this).attr('id')});
    	hasPlayed = true;
    	$("#titleBar").text('Burn Against Humanity - Waiting for others...');
    	$(this).remove();
    
   }
   else if(cardCzar) {
   		alert("You're the card czar!");
   }
   else if(!playing) {
      alert("You're not in a game!");
   }
   else  {
      alert("You've already played a card this round!");
   }
  });

 $(document).on('click', '#activeHand .whitecard', function() { 
    if(cardCzar && pickWinner) {
    	console.log("clicked on: " + $(this).attr('id'));
    	socket.emit('pickedWinner', { card: $(this).attr('id')});
    	pickWinner = false;
    
   }
   else if(!cardCzar) {
   		alert("You're not the card czar!");
   }
   else if(!pickWinner) {
      alert("Wait for the round to finish!");
   }
   else  {
      alert("You can't select this card!");
   }
  });

 function nextRoundTimer() {
 	var timer = 14;

 	var tt = setInterval(function() {
 		$("#timer").text('Next round in ' + timer + '...');
 		timer--;
 	}, 1000);
 	setTimeout(function() { clearInterval(tt);
 		$("#timer").remove();
 	 }, 15000);

 }

 function notifyTimer() {
 	setTimeout(function() { 
 		$("#notify").remove();
 	 }, 5000);
 }

 function cleanUp() {
 	playing = false;
	cardCzar = false;
	score = 0;
 	$("#activeHand").empty();
 	$("#cardCzarName").text('No one!');
 	$("#score").text(score);
 	$("#blackcard").flip(false);
 	$("#blackcard .back").empty();
 	blankHand();
 	boardHand = [];
 	hasPlayed = false;
 }

function newRound() {
	$("#activeHand").empty();
	$("#titleBar").text('Burn Against Humanity - Play a card!');
	$("#whitecards").children().each(function() {
				$(this).addClass('selectable');
			})
	boardHand = [];
	hasPlayed = false;
}
