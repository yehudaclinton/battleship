import { Meteor } from 'meteor/meteor';
import "../public/collections.js";

Meteor.startup(() => {

var turn = "british"; //game starts with british

Meteor.publish('games', function() {
//  console.log("publishing");
  return Games.find();
});
Meteor.publish('moves', function() {
  return Moves.find();
});
Meteor.methods({
  newGame: function(gameData) {
   // console.log("server function\n"+JSON.stringify(gameData));
    var gameID = Games.insert(gameData);
    return gameID;
  },
  move: function(moveData){
    return Moves.insert(moveData);
  },
  nextTurn: function(player){
    //console.log(player);
    if(player=="british" && turn=="british"){
      turn == "german";
      return true;
    }else if(player=="german" && turn=="german"){
      turn == "british";
      return true;
    }else{ return false; }
  },
  checkTurn: function(player){
    if(player==turn) return true;
  }
});


});
