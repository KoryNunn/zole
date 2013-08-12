var createSpec = require('spec-js'),
    GameLoop = require('./GameLoop');

function gameLoop(zole){
    if(zole._run){
        zole.emit('step', zole);
        setTimeout(function(){
            gameLoop(zole, new Date())
        }, 10);
    }
}

function startGame(){
    this._run = true;
    gameLoop(this);
}

function ProcessLoop(context){
}
ProcessLoop = createSpec(ProcessLoop, GameLoop);
ProcessLoop.prototype.start = startGame;

module.exports = ProcessLoop;