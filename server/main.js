import { Meteor } from 'meteor/meteor';
import "../public/collections.js";

//export const Games = new Mongo.Collection('games');

//Games = new Mongo.Collection('games');

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
      return true;
    }else if(player=="german" && turn=="german"){
      return true;
    }else{ return false; }
  }
});


});
