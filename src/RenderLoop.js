var createSpec = require('spec-js'),
    GameLoop = require('./GameLoop');

function renderLoop(zole){
    if(zole._run){
        zole.emit('frame', zole);
        window.requestAnimationFrame(function(timestamp){
            renderLoop(zole, timestamp)
        });
    }
}

function startRender(){
    this._run = true;
    renderLoop(this);
}

function RenderLoop(context){
}
RenderLoop = createSpec(RenderLoop, GameLoop);
RenderLoop.prototype.start = startRender;

module.exports = RenderLoop;