var zole = require('./'),
    createSpec = require('spec-js'),
    crel = require('crel');

var keys = {
    left: 37,
    right: 39,
    up: 38,
    down: 40,
    w: 87,
    a:65,
    s: 83,
    d: 68
};

function initEventListeners(game){
    game.io = {};
    game.io.keysDown = {};
    game.io.mouse = {};
    window.addEventListener('keydown', function(event){
        game.io.keysDown[event.which] = true;
    });
    window.addEventListener('keyup', function(event){
        delete game.io.keysDown[event.which];
    });
    window.addEventListener('mousemove', function(event){
        game.io.mouse = event;
    });
}

var collidables = [];

function getCollisions(entity){
    var collisions = [];
        x = this.x,
        y = this.y;


    for(var key in entity.game.entities){
        var otherEntity = entity.game.entities[key];
        if(key !== entity._id){
            if(this.collidesWith(otherEntity)){
                collisions.push(otherEntity);
            }
        }
    }

    return collisions;
}

function getNetVelocity(target, otherEntity){
    var massRatio = 1 / otherEntity.mass * target.mass,
            
    
};

function Entity(game, description){
    if(description){
        if(description.type === 'ball'){
            return new Ball(description);
        }
        if(description.type === 'bat'){
            return new Bat(description);
        }
        for(var key in description){
            this[key] = description[key];
        }
    }

    this.velocity = 0;
    this.x = game.viewPort._canvas.width / 2;
    this.y = game.viewPort._canvas.height / 2;
    this.width = 20;
    this.height = 20;

    this.game = game;
}
Entity = createSpec(Entity);
Entity.prototype.render = function(){
    var halfWidth = this.width / 2,
        halfHeight = this.height / 2;

    this.game.viewPort._context.rect(
        this.x - halfWidth,
        this.y - halfHeight,
        this.width,
        this.height
    );

    this.mass = 100;
};
Entity.prototype.step = function(){
    var collisions = getCollisions(this);
    if(collisions){
        for (var i = 0; i < collisions.length; i++) {
            var collidedEntity = collisions[i];

            //left
            if(collidedEntity.x + collidedEntity.width / 2 > this.x - this.width / 2){

            }

        };
    }
};
Entity.prototype.collidesWith = function(entity){
    return 
        entity.x + entity.width / 2 > this.x - this.width / 2 &&
        entity.x - entity.width / 2 < this.x + this.width / 2 &&
        entity.y + entity.height / 2 > this.y - this.height / 2 &&
        entity.y - entity.height / 2 < this.y + this.height / 2;
};

function Ball(game, description){
    this.width = 20;
    this.height = 20;
    this.mass = 100;
}
Ball = createSpec(Ball, Entity);
Ball.prototype.type = 'ball;'

function Bat(game, description){
    this.width = 20;
    this.height = 200;
    this.mass = 1000000;
}
Bat = createSpec(Bat, Entity);
Bat.prototype.type = 'bat'
Bat.prototype.step = function(){

    //Input
    if(keys.up in this.game.io.keysDown){
        this.velocity -= 1;
    }
    if(keys.down in this.game.io.keysDown){
        this.velocity += 1;
    }

    //Simulation
    this.y += this.velocity;

    var collisions = getCollisions(this);

    this.velocity = Math.max(this.velocity, -10);
    this.velocity = Math.min(this.velocity, 10);

    this.velocity*=0.9;
};

function Wall(game, description){
    this.width = game.viewPort.width;
    this.height = 20;

    this.mass = 1000000;
}
Wall = createSpec(Wall, Entity);
Wall.prototype.type = 'wall';

function Player(game, description){
    this.bat = new Bat(game);

    game.addEntity(this.bat);
}

function ViewPort(description){
    this._canvas = crel('canvas');
    this._context = this._canvas.getContext('2d');

    for(var key in description){
        this[key] = description[key];
    }

    this._canvas.width = this.width;
    this._canvas.height = this.height;
}
ViewPort.prototype.render = function(){

    this._context.fill();
    this._context.stroke();
};


function buildWalls(game){
    game.entities.topWall = new Wall(game);
    game.entities.topWall.x = game.viewPort.width / 2;
    game.entities.topWall.y = 0;

    game.entities.bottomWall = new Wall(game);
    game.entities.bottomWall.x = game.viewPort.width / 2;
    game.entities.bottomWall.y = game.viewPort.height;
}

function Game(state){
    var game = this;
    this.viewPort = new ViewPort({
        width: 600,
        height:600
    });

    this.entities = {};
    this.players = {};

    this.processLoop = new zole.ProcessLoop(this),
    this.renderLoop = new zole.RenderLoop(this);
    initEventListeners(this);

    for(var key in state){
        this[key] = state[key];
    }

    for(var playerKey in this.players){
        this.players[key] = new Player(this, this.players[key]);
    }

    for(var entityKey in this.entities){
        this.entities[key] = new Entity(this, this.entities[key]);
    }

    buildWalls(this);

    this.currentPlayer = new Player(this);
    this.addPlayer(this.currentPlayer);

    this.processLoop.on('step', function(loop, timestamp){
        for(var key in game.entities){
            game.entities[key].step();
        }
    });

    this.renderLoop.on('frame', function(loop, timestamp){
        game.beginRender();
        for(var key in game.entities){
            game.entities[key].render();
        }
        game.endRender();
    });

    this.processLoop.start();
    this.renderLoop.start();
}
Game.prototype.addEntity = function(entity){
    entity._id = Object.keys(this.entities).length;
    this.entities[entity._id] = entity;
};
Game.prototype.addPlayer = function(player){
    player._id = Object.keys(this.players).length;
    this.players[player._id] = player;
};
Game.prototype.beginRender = function(){
    this.viewPort._context.clearRect(0,0,this.viewPort._canvas.width, this.viewPort._canvas.height);
    this.viewPort._context.beginPath();
};
Game.prototype.endRender = function(){
    this.viewPort.render();
};

window.addEventListener('load', function(){
    var game = new Game();

    document.body.appendChild(game.viewPort._canvas);
});