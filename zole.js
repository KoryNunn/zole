var createSpec = require('spec-js');

function trigger(eventNames, event){
    var gameLoop = this,
        eventNames = eventNames.split(' ');

    if(eventNames.length > 1){
        eventNames.forEach(function(eventName){
            gameLoop.trigger(eventName, event);
        });
    }

    var eventName = eventNames.pop();

    if(this._events[eventName]){
        this._events[eventName].forEach(function(callback){
            callback(event);
        });
    }
}

function on(eventNames, callback){
    var gameLoop = this,
        eventNames = eventNames.split(' ');

    if(eventNames.length > 1){
        eventNames.forEach(function(eventName){
            gameLoop.on(eventName, callback);
        });
    }

    var eventName = eventNames[0],
        events = this._events[eventName] = this._events[eventName] || [];

    events.push(callback);
}

function gameLoop(zole){
    if(zole._run){
        zole.trigger('step', zole);
        setTimeout(function(){
            gameLoop(zole, new Date())
        }, 10);
    }
}

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

function startRender(){
    this._run = true;
    renderLoop(this);
}

function pause(){
    this._run = true;
}

function GameLoop(context){
    this._events = {};
    this.context = context;
}
GameLoop.prototype.on = on;
GameLoop.prototype.pause = pause;
GameLoop.prototype.trigger = trigger;

function ProcessLoop(context){
}
ProcessLoop = createSpec(ProcessLoop, GameLoop);
ProcessLoop.prototype.start = startGame;

function RenderLoop(context){
}
RenderLoop = createSpec(RenderLoop, GameLoop);
RenderLoop.prototype.start = startRender;

module.exports = {
    ProcessLoop: ProcessLoop,
    RenderLoop: RenderLoop
};