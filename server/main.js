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
    var gameID = Games.insert(gameData);
    return gameID;
  },
  joingame: function(game){//{_id: game}  creator
    if(Games.find({"_id":game}).fetch()[0].creator==this.userId) return "cant play against yourself";
    var cb = Games.update(game, { $set: {otherplayer: this.userId}});
    return cb;
  },
  move: function(moveData){
    return Moves.insert(moveData);
  },
  nextTurn: function(player, gameid){

  if(Games.find(gameid).fetch()[0].creator==this.userId && Games.find({"_id":gameid}).fetch()[0].turn=="british"){
      turn = "german";
    }else if(Games.find(gameid).fetch()[0].otherplayer==this.userId && Games.find({"_id":gameid}).fetch()[0].turn=="german"){
      turn = "british";
    }else{ return false; }
    Games.update(gameid, { $set: { "turn":turn } });
    return true;
  },
  checkTurn: function(player){
//    console.log("p "+player+" t "+turn);
    if(player==turn) return true;
  }
});


});
