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

    this.currentPlayer = new Player(this);
    this.addPlayer(this.currentPlayer);

    for(var i = 0; i < 20; i++){
        spawnEnemy(this);
    }

    this.processLoop.on('step', function(loop, timestamp){
        for(var key in game.entities){
            game.entities[key].step();
        }
    });

    this.renderLoop.on('frame', function(loop, timestamp){
        game.beginRender();
        for(var key in game.entities){
            game.viewPort._context.save();
            game.entities[key].render();
            game.viewPort._context.restore();
        }
        game.endRender();
    });

    this.processLoop.start();
    this.renderLoop.start();
}
Game.prototype.addEntity = function(entity){
    entity._id = new Date().getTime() + '-' + Math.random();
    this.entities[entity._id] = entity;
};
Game.prototype.addPlayer = function(player){
    player._id = new Date().getTime() + '-' + Math.random();
    this.players[player._id] = player;
};
Game.prototype.beginRender = function(){
    this.viewPort._context.clearRect(0,0,this.viewPort._canvas.width, this.viewPort._canvas.height);
    this.viewPort._context.beginPath();
};
Game.prototype.endRender = function(){
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
    var ship = this.ship = new Ship(game);

    game.processLoop.on('step', function(){
        if(ship.destroyed){
            return;
        }
        if(keys.left in game.io.keysDown){
            ship.angle -= 3;
        }
        if(keys.right in game.io.keysDown){
            ship.angle += 3;
        }
        if(keys.up in game.io.keysDown){
            applyForce(ship, ship.mass/10, ship.angle);
        }
        if(keys.space in game.io.keysDown){
            if(!ship.gunCooldown){
                ship.gunCooldown = 5;
                var bullet = new Bullet(game);
                game.addEntity(bullet);

                bullet.owner = ship;

                copyPhysics(ship, bullet);

                applyForce(bullet, bullet.mass * 5, bullet.angle);
            }
        }
    });

    this.ship.x = 10;

    game.addEntity(this.ship);
}

function Entity(game, description){
    if(description){
        if(description.type === 'ball'){
            return new Ball(description);
        }
        for(var key in description){
            this[key] = description[key];
        }
    }

    this.velocity = {x:0,y:0};
    this.x = game.viewPort._canvas.width / 2;
    this.y = game.viewPort._canvas.height / 2;
    this.width = 20;
    this.height = 20;
    this.mass = 100;

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
};
Entity.prototype.step = function(){
    var nextLocation = {
        x: this.x,
        y: this.y
    };

    nextLocation.x += this.velocity.x;
    nextLocation.y += this.velocity.y;

    //check collision

    this.x = nextLocation.x;
    this.y = nextLocation.y;

    // friction
};
Entity.prototype.collidesWith = function(entity){
    return 
        entity.x + entity.width / 2 > this.x - this.width / 2 &&
        entity.x - entity.width / 2 < this.x + this.width / 2 &&
        entity.y + entity.height / 2 > this.y - this.height / 2 &&
        entity.y - entity.height / 2 < this.y + this.height / 2;
};
Entity.prototype.destroy = function(){
    this.destroyed = true;
    delete this.game.entities[this._id];
};


function addAngle(velocity, angle){
    entity.velocity.x += force / entity.mass * Math.sin(angle * (Math.PI/180));
    entity.velocity.y -= force / entity.mass * Math.cos(angle * (Math.PI/180));
}

function polarToCartesian(velocity){
    return {
        x: velocity.speed * Math.sin(velocity.angle * (Math.PI/180)),
        y: velocity.speed * Math.cos(velocity.angle * (Math.PI/180))
    };
}

function cartesianToPolar(velocity){
    return {
        speed: Math.sqrt(Math.pow(velocity.x,2) * Math.pow(velocity.y,2)),
        angle: Math.atan(velocity.y / velocity.x) || 0
    };
}

function reflect(angleToRelect, surfaceAngle){
    return 360 - (surfaceAngle % 180 + angleToRelect) % 360;
}

function getNetAngle(angle1, angle2, ratio){
    return (Math.max(angle1, angle2) + Math.min(angle1, angle2)) / (ratio == null ? 2 : ratio);
}

function degreesToRadians(angle){
    return angle * (Math.PI/180);
}

function radiansToDegrees(angle){
    return (Math.PI*180) / angle;
}

function applyForce(entity, force, angle){
    if(!force){
        return;
    }
    entity.velocity.x += force / entity.mass * Math.sin(angle * (Math.PI/180));
    entity.velocity.y -= force / entity.mass * Math.cos(angle * (Math.PI/180));
}

module.exports = {
    ProcessLoop: ProcessLoop,
    RenderLoop: RenderLoop
};