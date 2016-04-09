
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
