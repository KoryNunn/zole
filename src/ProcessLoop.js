var createSpec = require('spec-js'),
    GameLoop = require('./GameLoop');

function renderLoop(zole){
    if(zole._run){
        zole.trigger('frame', zole);
        window.requestAnimationFrame(function(timestamp){
            renderLoop(zole, timestamp)
        });
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