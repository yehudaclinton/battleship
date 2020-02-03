import { Meteor } from 'meteor/meteor';
import "../public/collections.js";

Meteor.startup(() => {

//Games.find({"name":"multigame"}).fetch()[0].turn
//if no game saved from before
var turn = "british"; //game starts with british

Meteor.publish('games', function() {
//  this is all rather insecure i know
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
  nextTurn: function(player, gameid){ 
    if(player=="british" && turn=="british"){
      turn = "german";
    }else if(player=="german" && turn=="german"){
      turn = "british";
    }else{ return false; }
    Games.update(gameid, { $set: { "turn":turn } });
    return true;
  },
  checkTurn: function(player){
    if(player==turn) return true;
  }
});


});
