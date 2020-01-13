import { Template } from 'meteor/templating';

import './main.html';

import "../public/collections.js";

//these ships should be in a different file called units
var units = {
  british_carrier: {visibility: 3, firerange: 4, moverange: 2, hitpoints: 3, sinking: "Battleship_hit.png"},
  british_cruiser: {visibility: 3, firerange: 2, moverange: 3, hitpoints: 2, sinking: "battleship_hit.png"},
  german_battleship: {visibility: 3, firerange: 2, moverange: 2, hitpoints: 3, sinking: "battleship_hit.png"},
  british_sub: {visibilty: 2, firepower: 2, moverange: 2, hitpoints: 1, sinking: "nothing.png"}
// TODO correct sinking img and more ships
};

//subscribing to reactive variables
Meteor.subscribe('games');
Meteor.subscribe('moves');

var player = "unassigned"; //multi player teams
if(navigator.userAgent.includes("Chrome")) player = "british";
if(navigator.userAgent.includes("Firefox")) player = "german";


Template.game.onRendered(function(){

//Board Dimensions by squares
var x=8;
var y=8;
var Board = document.getElementById("map");

  for (var i=0; i<y; i++){
    var row = Board.appendChild(document.createElement("div"));
    for (var j=0; j<x; j++){
        var square = document.createElement("span");
        square.setAttribute("id", i+","+j); //i=x j=y
        square.setAttribute("class", "space");
        row.appendChild(square);
    }
  }
});

var selected = null;

function checkfire(e, target){ //need target ship besides location
  //if hit
  var xdistance = Math.abs(+selected.location.substring(0, 1) - +target.id.substring(0, 1));
  var ydistance = Math.abs(+selected.location.substring(2) - +target.id.substring(2));
  var distance = xdistance + ydistance;
  var otherteam = e.id.substr(0,e.id.indexOf('_')); //e.className; //
  var yourteam = selected.ship;
  var hit = new Audio("battle_sea_normal_01_battleship_volley.mp3");

  console.log("yourteam: "+yourteam+"\notherteam: "+otherteam);
  // if the the following is true then 'Hit'
  if(distance <= units[selected.ship].firerange && otherteam !== yourteam && units[e.id].fired !== true){
    document.body.style.cursor = "default";//null;
    //document.body.removeAttribute('cursor');

    units[e.id].fired = true;
    units[e.id].hitpoints = units[e.id].hitpoints-1;
    hit.play();
    console.log("hit! from "+selected.location);
    console.log(e.id+": hitpoints left:"+units[e.id].hitpoints);
    if(units[e.id].hitpoints <1){
      document.getElementById(e.id).src = units[e.id].sinking;
      document.getElementById(e.id).classList.add("sunk");
    }
  }
}

function checkmove(unit, loc, start){
//drag posit minus drop pos dont exceed units range
  var xdistance = Math.abs(+start.substring(0, 1) - +loc.substring(0, 1));
  var ydistance = Math.abs(+start.substring(2) - +loc.substring(2));
  var distance = xdistance + ydistance;
  console.log(distance+" < "+units[unit].moverange+" s:"+start+" f:"+loc);

//space already occupied
  var tile = document.getElementById(loc).getElementsByTagName('img')[0];

  if(start=="start") return true; //placing units at start of game

  if(tile==undefined && distance <= units[unit].moverange && units[unit].moved != true){
    units[unit].moved = true;
    return true;
  }else{
    console.log("illegal move!! or not your turn");
  }
}
var dragshipid, dragstart;
Template.game.events({
  'dropped .space': function(event, temp) {
    event.preventDefault();
    console.log("drop !! "+event.target.id+" "+dragstart);
    if(checkmove(dragshipid, event.target.id, dragstart)){
      event.target.appendChild(document.getElementById(dragshipid));
      Meteor.call('move', {game: Games.findOne()._id, ship: dragshipid, start: dragstart, finish: event.target.id})
      console.log("move method");
    }
  },
  'drag img'(event, ev) {
    dragstart = event.target.parentElement.id;
    dragshipid = event.target.id;
  },
  'click #new'(event){
    if(document.getElementById("gamename").value !== null){
      Meteor.call('newGame', {name: document.getElementById("gamename").value, createdAt: new Date()})
      let currentgame = document.getElementById("gamename").value;
      console.log("create new game "+document.getElementById("gamename").value);
    }
  },
  'click #next'(event, instance) {
    //let result = Meteor.wrapAsync(
    Meteor.call('nextTurn', player, (error, result) => {
      if(result){ //deactivated on server
        console.log("turn accepted "+result);
        selected = null;
        for(x=0; x<Object.keys(units).length; x++){
          Object.values(units)[x].moved = false;
          Object.values(units)[x].fired = false;
        }
        //remove sunken ships
        document.querySelectorAll(".sunk").forEach(e => e.parentNode.removeChild(e));
      }else{
console.log("other move");
      }
    });
  },
  'click img'(e){
      console.log("click "+selected);
   var selectedTeam = e.target.id.substr(0,e.target.id.indexOf('_'));
  Meteor.call('checkTurn', selectedTeam, (error, result) => {
    if(result==true){

    if(selected==null){
      selected = { ship: e.target.id, location: e.target.parentNode.id };
      console.log("Selected: "+JSON.stringify(selected));
      //e.target.style.backgroundImage = "url('0_6.png')";
      document.getElementById(e.target.parentNode.id).classList.add('selected');//////////////////////
      //document.body.classList.add('cursor');
      document.body.style.cursor = "crosshair";
    }
    }else if(selected){ //if deselecting ship //select!=null and its the same as current select
      if(selected.location==e.target.parentNode.id){
        document.body.style.cursor = null; //"default";
      }else{ //fire
        checkfire(e.target, e.target.parentNode);
      }

      console.log("deselecting");
        selected = null;
    //}
   } //end of if result
   });
  }
});

Template.gamestats.helpers({
  current: function () {
//var currentgame = document.getElementById("gamename").value;
//console.log("helper "+currentgame);//{_id : currentgame}
var themove = Moves.find().fetch();
themove = themove[themove.length - 1];
var theship = document.getElementById(themove.ship);
document.getElementById(themove.finish).appendChild(theship);
    return Games.findOne().name; //.fetch();
  },
  gamelist: function() {
    return Games.find({}, {sort: {createdAt: -1}}).fetch();
  }
});
///build a game from server

///multiplayer sessions
//navigator.userAgent.includes("Chrome")

///place a piece
//document.getElementById().appendChild()

///get latest move
//find({}).sort({'_id': -1}).limit(1)

