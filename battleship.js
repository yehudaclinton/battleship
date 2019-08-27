
/*
Scope

-drag
-checkmove
-select
-checkfire

TODO fix toggle select, sound, ai, visibility, multiplayer
*/

//Board Dimension 
var x=8;
var y=8;

var hit = new Audio("battle_sea_normal_01_battleship_volley.mp3"); // buffers automatically when created

var Board = document.getElementById("map");

for (var i=0; i<y; i++){
    var row = Board.appendChild(document.createElement("div"));
    for (var j=0; j<x; j++){
        var square = document.createElement("span");
        square.setAttribute("id", i+","+j);//i=x j=y
        square.setAttribute("ondrop", "drop(event, '"+i+","+j+"')");
        square.setAttribute("ondragover", "allowDrop(event)");
        //square.setAttribute("onclick", "select(event)");// dont know how to avoid duplicate call to function
        row.appendChild(square);
    }
}

//should use class like https://www.digitalocean.com/community/tutorials/understanding-classes-in-javascript
var units = {
  british_carrier: {
    visibility: 3,
    firerange: 4,
    moverange: 2,
    hitpoints: 3,
    sinking: "Battleship_hit.png"
  },
  british_cruiser: {
    visibility: 3,
    firerange: 2,
    moverange: 3,
    hitpoints: 2,
    sinking: "battleship_hit.png"
  },
  german_battleship: {
    visibility: 3,
    firerange: 2,
    moverange: 2,
    hitpoints: 3,
    sinking: "battleship_hit.png"
  }
};

//drag and drop
function allowDrop(ev) {
  ev.preventDefault();
}
function drag(ev) {
  ev.dataTransfer.setData("shipid", ev.target.id);//text
  ev.dataTransfer.setData("startloc", ev.target.parentNode.id);
}
function drop(ev, loc) {
  ev.preventDefault();
  var ship = ev.dataTransfer.getData("shipid");
  var start = ev.dataTransfer.getData("startloc");
  if(checkmove(ship, loc, start)){
    ev.target.appendChild(document.getElementById(ship));
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


  if(start=="") return true;//placing units at start of game

  if(tile==undefined && distance <= units[unit].moverange && units[unit].moved != true){
    units[unit].moved = true;
    return true;
  }else{
    console.log("illegal!! already moved or not your turn");
  }
}

var selected = null;
function select(e){//tile or ship -------------------------------
  if(e.target.childNodes[0]){//selected tile-- I need to allow select empty and miss
console.log("select tile");
    /*if(selected==null){//selected tile to use ship --- disable this function
      selected = { ship: e.target.childNodes[0].id, location: e.target.id };
      console.log("Selected: "+JSON.stringify(selected));
      //e.target.style.backgroundImage = "url('0_6.png')";
      document.getElementById(e.target.id).classList.add('selected');//////////////////////
      document.body.classList.add('cursor');
    }else*/ if(selected){ //if deselecting ship //select!=null and its the same as current select
      if(selected.location==e.target.id){
        document.body.style.cursor = null;//"default";
      //tile background to default style

console.log("deselecting1");
//document.getElementById(e.target.id).add('selected');

        selected = null;

      
      }else{//fire
        checkfire(selected, e.target.id);
        selected = null
      }
    }
  }else{//clicked on ship ------------/-/-/-/-/-//-/-/-/--------------
console.log("click on ship itself");

    if(selected==null){//selected tile to use ship
      selected = { ship: e.target.id, location: e.target.parentNode.id };
      console.log("Selected: "+JSON.stringify(selected));
      //e.target.style.backgroundImage = "url('0_6.png')";
      document.getElementById(e.target.parentNode.id).classList.add('selected');//////////////////////
      //document.body.classList.add('cursor');
      document.body.style.cursor = "crosshair";
    }else if(selected){ //if deselecting ship //select!=null and its the same as current select
      if(selected.location==e.target.parentNode.id){
        document.body.style.cursor = null;//null//"default";

console.log("deselecting2");
        selected = null;

      
      }else{//fire
        checkfire(e.target, e.target.parentNode);
        selected = null
      }
    }

  }
}//end of select function
function checkfire(e, target){//need target ship besides location
  //if hit
  var xdistance = Math.abs(+selected.location.substring(0, 1) - +target.id.substring(0, 1));
  var ydistance = Math.abs(+selected.location.substring(2) - +target.id.substring(2));
  var distance = xdistance + ydistance;
  //console.log("units "+distance+" < "+units[selected.ship].firerange+" s:"+selected.location+" t:"+target.id);
  //console.log("distance: "+distance+" range:"+units[selected.ship].firerange);
  //console.log("eship:"+e+" selectedship: "+selected.ship);
  var otherteam = e.className;//
  var yourteam = selected.ship;
  console.log("yourteam: "+yourteam+"\notherteam: "+otherteam);
  if(distance <= units[selected.ship].firerange && otherteam != yourteam && units[e.id].fired != true){// Hit
    document.body.style.cursor = "default";//null;
    //document.body.removeAttribute('cursor');

    units[e.id].fired = true;
    units[e.id].hitpoints = units[e.id].hitpoints-1;
    hit.play();
    console.log("hit! from "+selected.location);
    console.log(e.id+": hitpoints left:"+units[e.id].hitpoints);
    if(units[e].hitpoints <1){
      document.getElementById(e.id).src = units[e.id].sinking;
      document.getElementById(e.id).classList.add("sunk");
    }
  }
}
function next(){//next turn reset //maybe i should stop using objects and convert to array
  for(x=0; x<Object.keys(units).length; x++){
    Object.values(units)[x].moved = false;
    Object.values(units)[x].fired = false;
  }
  //remove sunken ships
  document.querySelectorAll(".sunk").forEach(e => e.parentNode.removeChild(e));
}
