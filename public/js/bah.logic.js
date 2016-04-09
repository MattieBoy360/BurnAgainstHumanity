
  var hand;
  var boardHand = [];
  var black;
  var lastQuestion;
  var lastAnswer;
  var hasPlayed = false;
  var playing = false;
  var cardCzar = false;
  var pickWinner = false;
  var score = 0;
  var notifying = false;

$(function($) {
  $("#blackcard").flip({
    trigger: 'manual'
  }); 

  if(lastQuestion == null) {
    $("#lastQuestion").append('<img class="blackcard" src="img/burn-back-black.png" width="130" />');
  }
  if(lastAnswer == null) {
    $("#lastAnswer").append('<img class="whitecard" src="img/burn-back-white.png" width="130" />');
  }

  for(i=0;i<10;i++) {
    $("#whitecards").append('<img class="front whitecard" src="img/burn-back-white.png" width="150" />');
  }

});

function blankHand() {
  $("#whitecards").empty();
  for(i=0;i<10;i++) {
    $("#whitecards").append('<img class="front whitecard" src="img/burn-back-white.png" width="150" />');
  }
}


 //Make the board clickable even when we append
 $(document).on('click', '#activeHand .whitecard', function() { 
  //If we're the card czar and we are picking the winner
    if(cardCzar && pickWinner) {
      //Tell the server we picked a winner
      socket.emit('pickedWinner', { card: $(this).attr('id')});
      //We've selected a winner
      pickWinner = false;
    
   }
   //If we click and we're not the card czar, inform.
   else if(!cardCzar) {
      notify("You're not the card czar!");
   }
   //If we click and we're waiting for players, inform.
   else if(!pickWinner) {
      notify("Wait for the round to finish!");
   }
   //Else we can't select this card
   else  {
      alert("You can't select this card!");
   }
  });

 //Triggers timer to deal with next round notification
 function nextRoundTimer() {
  var timer = 14;
  notifying = true;
  var tt = setInterval(function() {
    $("#timer").text('Next round in ' + timer + '...');
    timer--;
  }, 1000);
  setTimeout(function() { clearInterval(tt);
    $("#timer").remove();
    notifying = false;
   }, 15000);

 }

 //Displays notification under title bar
 function notify(message) {
  if(!notifying) {
    //Append notification 
    notifying = true;
    $("#titleBar").append('<span id="notify"></span>');
    $("#notify").html('<br>' + message);

    //Remove in NOTIFICATION_TIME seconds
    setTimeout(function() { 
      $("#notify").remove();
      $("#titleBar br").remove();
      notifying = false;
    }, NOTIFICATION_TIME);
  }
 }

 //Cleans up game in the event of game over
 function cleanUp() {
  //Set key variables to false
  //NOTE: SCORE handled away due to use in game over message
  playing = false;
  cardCzar = false;
  hasPlayed = false;
  //Empty the board of cards
  $("#activeHand").empty();
  //Replace card czar to no one
  $("#cardCzarName").text('No one!');
  $("#score").text(score);
  //Flip question back over and empty
  $("#blackcard").flip(false);
  $("#blackcard .back").empty();
  //Reset players hand to be blank
  blankHand();
  //Let the board be empty
  boardHand = [];
 }

//Sets up a new round given the new question
function newRound(data) {
  //Empty the board of last answers
  $("#activeHand").empty();
  //Reset the title text
  $("#titleBar").text('Burn Against Humanity - Play a card!');
  //Readd the selectable class to our hand
  $("#whitecards").children().each(function() {
    $(this).addClass('selectable');
  });
  //Make sure our board is empty and we haven't played
  boardHand = [];
  hasPlayed = false;

  //Add and show the question to users
  $("#blackcard .back").empty();
  $("#blackcard .back").append('<img class="blackcard" src="img/smallblack/' + data.black + '.png" width="150" />');
  $("#blackcard").flip(true);
}

//Ends a round given the winner
function endRound(data) {
  //Display who won and next round timer
  $("#titleBar").text('Burn Against Humanity - Congratulations ' + data.winName + '!');
  $("#titleBar").append('<br><span id="timer">Next round in 15...</span>');
  
  //Begin next round countdown
  nextRoundTimer();
  
  //Flip the black card so we can change it
  $("#blackcard").flip(false);
  //Add the winner name to last round winner
  $("#winnerName").text(data.winName);

  //Empty and append the last question
  $("#lastQuestion").empty();
  $("#lastQuestion").append('<img class="blackcard" src="img/smallblack/' + black + '.png" width="130" />');
  
  //Take away our card czar priviledges if we had them
  cardCzar = false;
  //Add winning card to the last answer slot
  $("#lastAnswer").empty();
  $("#lastAnswer").append('<img id="'+data.answer+'" class="back whitecard" src="img/smallwhite/' + data.answer + '.png" width="130" />');

}

//Set up a new game given a question and a hand
function setUpGame(data) {
  //Tell the game we're playing
  playing = true;
  
  //Update title text to instruct
  $("#titleBar").text('Burn Against Humanity - Play a card!');
  //Empty the hand of backs of cards
  $("#whitecards").empty();
    
  //Save our hand and the question
  hand = data.whitecards;
  black = data.blackcard;

  //Fetch question
  $("#blackcard .back").html('<img class="blackcard" src="img/smallblack/' + black + '.png" width="150" />');
  
  //For each card in our hand, add it to the hand area
  $.each(hand, function(index, value) {
    $("#whitecards").append('<img id="'+value+'" class="back selectable whitecard" src="img/smallwhite/' + value + '.png" width="150" />');
  });
  
  //Flip the question card
  $("#blackcard").flip(true);
}

//Remove a card from the board given someone left
function removeCard(data) {
  //Find the index of the card we need to remove
  var index = boardHand.indexOf(data.card);
  //If we find it
  if(index > -1) {
    //Remove it from the board
    boardHand.splice(index, 1);
    $("#activeHand img").last().remove();
  }
}

//Reveal cards on the board and allow card czar to pick
function revealCards() {
  //Empty the game board of the backs of cards
  $("#activeHand").empty();
  
  //If we're the card czar, let us pick the winner, else tell us to wait
  if(cardCzar) {
    $("#titleBar").text('Burn Against Humanity - Pick your winning card!');
    pickWinner = true;
  } 
  else {
    $("#titleBar").text('Burn Against Humanity - Card Czar is picking a winner...');
  }
  
  //For each card on the board, get the card. If we're the card czar, make it selectable.
  $.each(boardHand, function(index, value) {
    if(cardCzar) {
      $("#activeHand").append('<img id="'+value+'" class="whitecard selectable" src="img/smallwhite/' + value + '.png" width="150" />');
    }
    else {
      $("#activeHand").append('<img id="'+value+'" class="back whitecard" src="img/smallwhite/' + value + '.png" width="150" />');
    }
  });

  //For each of the cards in our hand, take away selectable.
  $("#whitecards").children().each(function() {
    $(this).removeClass('selectable');
  });
  boardHand = [];
}
