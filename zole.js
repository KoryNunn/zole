var createSpec = require('spec-js'),
    EventEmitter = require('events'),
    crel = require('crel'),
    ProcessLoop = require('./src/ProcessLoop'),
    RenderLoop = require('./src/RenderLoop');

function Game(state){
    var game = this;
    this.viewPort = new ViewPort({
        width: 600,
        height:600
    });

    this.entities = {};
    this.players = {};

    this._processLoop = new ProcessLoop(this),
    this._renderLoop = new RenderLoop(this);

    for(var key in state){
        this[key] = state[key];
    }

    for(var playerKey in this.players){
        this.players[key] = new Player(this, this.players[key]);
    }

    for(var entityKey in this.entities){
        this.entities[key] = new Entity(this, this.entities[key]);
    }

    this._processLoop.on('step', function(loop, timestamp){
        for(var key in game.entities){
            game.entities[key].step();
        }
    });

    this._renderLoop.on('frame', function(loop, timestamp){
        game.render();
    });

    this._processLoop.start();
    this._renderLoop.start();
}
Game = createSpec(Game, EventEmitter);
Game.prototype.addEntity = function(entity){
    if(entity._id && entity._id in this.entities[entity.type]){
        return;
    }
    entity._id = new Date().getTime() + '-' + Math.random();
    if(!this.entities[entity.type]){
        this.entities[entity.type] = {};
    }
    this.entities[entity.type][entity._id] = entity;

    entity._cleanups.push(this.on('frame', entity.render));

    entity.x = entity.x || this.viewPort._canvas.width / 2;
    entity.y = entity.y || this.viewPort._canvas.height / 2;
};
Game.prototype.addPlayer = function(player){
    player._id = new Date().getTime() + '-' + Math.random();
    this.players[player._id] = player;
};
Game.prototype.render = function(){
    this.viewPort._context.clearRect(0,0,this.viewPort._canvas.width, this.viewPort._canvas.height);
    this.viewPort._context.beginPath();

    for(var key in this.entities){
        this.viewPort._context.save();
        this.entities[key].render();
        this.viewPort._context.restore();
    }
    this.viewPort._context.closePath();
    this.viewPort._context.fillStyle = 'white';
    this.viewPort._context.fill();
    this.viewPort.render();
};


function ViewPort(description){
    this._canvas = crel('canvas');
    this._context = this._canvas.getContext('2d');
    this._context.fillStyle = 'white';

    for(var key in description){
        this[key] = description[key];
    }

    this._canvas.width = this.width;
    this._canvas.height = this.height;
}
ViewPort.prototype.render = function(){
};


function Player(game, description){
}

module.exports = {
    ProcessLoop: require('./src/ProcessLoop'),
    RenderLoop: require('./src/RenderLoop'),
    Game: Game,
    geometry: require('./src/geometry')
};