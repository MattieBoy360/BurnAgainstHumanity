

var MAX_WHITE_CARDS = 245;
var MAX_BLACK_CARDS = 72;

exports.createDeck = function (colour) {
	var deck = new Array();

	switch(colour) {
		case "white":
			for(i = 0; i < MAX_WHITE_CARDS; i++) {
				if(i<10) {
					deck[i] = 'white00'+i;
				}
				else if (i < 100) {
					deck[i] = 'white0'+i;
				}
				else {
					deck[i] = 'white'+i;
				}
		
			}
		break;

		case "black":
			for(i = 0; i < MAX_BLACK_CARDS; i++) {
				if(i<10) {
					deck[i] = 'black00'+i;
				}
				else if (i < 100) {
					deck[i] = 'black0'+i;
				}
				else {
					deck[i] = 'black'+i;
				}
		
			}
		break;

		default:
			break;
	}

	deck = shuffleDeck(deck);
	

	return deck;
}

function shuffleDeck(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

exports.dealWhite = function(deck) {
	var hand = new Array();

	var count = 0;
	while(count<10) {
		hand.push(deck.shift());
		count++;
	}

	return hand;
}

exports.dealCard = function(deck) {
	return deck.shift();
}

