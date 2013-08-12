var createSpec = require('spec-js'),
    EventEmitter = require('events');

function gameLoop(zole){
    if(zole._run){
        zole.emit('step', zole);
        setTimeout(function(){
            gameLoop(zole, new Date())
        }, 10);
    }
}

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