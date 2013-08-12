var createSpec = require('spec-js'),
    EventEmitter = require('events').EventEmitter;


function pause(){
    this._run = false;
}
function resume(){
    this._run = true;
}

function GameLoop(context){
    this.context = context;
}
GameLoop = createSpec(GameLoop, EventEmitter);
GameLoop.prototype.pause = pause;
GameLoop.prototype.resume = resume;

module.exports = GameLoop;