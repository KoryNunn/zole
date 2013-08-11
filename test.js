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
    d: 68,
    space: 32
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

function getCollisions(entity){
    var collisions = [];
        x = entity.x,
        y = entity.y;

    for(var key in entity.game.entities){
        var otherEntity = entity.game.entities[key];
        if(key !== entity._id){
            if(entity.collidesWith(otherEntity)){
                collisions.push(otherEntity);
            }
        }
    }

    return collisions;
}

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

function copyPhysics(entity1, entity2){
    entity2.x = entity1.x;
    entity2.y = entity1.y;
    entity2.velocity.x = entity1.velocity.x;
    entity2.velocity.y = entity1.velocity.y;
    entity2.angle = entity1.angle;
}


function Particle(game){
    this.width = 2;
    this.height = 2;
    this.mass = 50;
    this.angle = 0; // visual angle
    this.life = 20;
}
Particle = createSpec(Particle, Entity);
Particle.prototype.type = 'bullet'
Particle.prototype.step = function(){
    if(this.life-- < 0){
        this.destroy();
        return;
    }

    this.angle += Math.random() * 180 - 90;

    applyForce(this, this.mass / 10, this.angle);
    
    if(this.x < 0 || this.x > this.game.viewPort._canvas.width){
        this.x = this.game.viewPort._canvas.width - this.x;
    }
    if(this.y < 0 || this.y > this.game.viewPort._canvas.height){
        this.y = this.game.viewPort._canvas.height - this.y;
    }

    // friction

    this.__super__.step.apply(this, arguments);
};

function Bullet(game){
    this.width = 5;
    this.height = 5;
    this.mass = 50;
    this.angle = 0; // visual angle
    this.life = 100;
}
Bullet = createSpec(Bullet, Entity);
Bullet.prototype.type = 'bullet';
Bullet.prototype.step = function(){
    if(this.life-- < 0){
        this.destroy();
    }
    
    if(this.x < 0 || this.x > this.game.viewPort._canvas.width){
        this.x = this.game.viewPort._canvas.width - this.x;
    }
    if(this.y < 0 || this.y > this.game.viewPort._canvas.height){
        this.y = this.game.viewPort._canvas.height - this.y;
    }

    for(var key in this.game.entities){
        var entity = this.game.entities[key];
        if(entity.type === 'ship'){
            if(
                this.owner !== entity &&
                this.x - this.width/2 > entity.x - entity.width / 2 && 
                this.x + this.width/2 < entity.x + entity.width / 2 &&
                this.y - this.height/2 > entity.y - entity.height / 2 && 
                this.y + this.height/2 < entity.y + entity.height / 2
            ){
                for (var i = 0; i < 10; i++) {
                    var particle = new Particle(this.game);

                    copyPhysics(this, particle);

                    this.game.addEntity(particle);
                };
                entity.destroy();
                this.destroy();
            }
        }
    }

    // friction
    this.velocity.x*=1;
    this.velocity.y*=1;

    this.__super__.step.apply(this, arguments);
};
Bullet.prototype.render = function(){
    this.game.viewPort._context.fillStyle = 'red';

    this.__super__.render.apply(this, arguments);
};

function Ship(game){
    this.width = 20;
    this.height = 20;
    this.mass = 100;
    this.angle = 0; // visual angle
    this.gunCooldown = 0;
}
Ship = createSpec(Ship, Entity);
Ship.prototype.type = 'ship'
Ship.prototype.step = function(){
    if(this.x < 0 || this.x > this.game.viewPort._canvas.width){
        this.x = this.game.viewPort._canvas.width - this.x;
    }
    if(this.y < 0 || this.y > this.game.viewPort._canvas.height){
        this.y = this.game.viewPort._canvas.height - this.y;
    }

    // for(var key in this.game.entities){
    //     var entity = this.game.entities[key];
    //     if(entity.type === 'ship'){
    //         var distance = Math.sqrt(Math.pow(this.x - entity.x, 2) + Math.pow(this.y - entity.y,2));
    //         if(
    //             this !== entity &&
    //             distance < 20
    //         ){
    //             var thisVelocityX = entity.velocity.x,
    //                 thisVelocityY = entity.velocity.y;

    //             entity.velocity.y = this.velocity.y;
    //             entity.velocity.y = this.velocity.y;

    //             this.velocity.x = thisVelocityX;
    //             this.velocity.y = thisVelocityY;
    //         }
    //     }
    // }

    if(this.gunCooldown){
        this.gunCooldown--;
    }

    // friction
    this.velocity.x*=0.99;
    this.velocity.y*=0.99;

    this.__super__.step.apply(this, arguments);
};
Ship.prototype.render = function(){
    var context = this.game.viewPort._context;

    context.translate(this.x, this.y);
    context.rotate(degreesToRadians(this.angle));
    context.translate(-this.x, -this.y);
    context.moveTo(this.x, this.y - this.height / 2);
    context.lineTo(this.x-this.width/2, this.y + this.height / 2);
    context.lineTo(this.x+this.width/2, this.y + this.height / 2);
    context.lineTo(this.x, this.y - this.height / 2);
};
Ship.prototype.destroy = function(){
    this.__super__.destroy.apply(this, arguments);
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

function spawnEnemy(game){
    var enemy = new Ship(game);

    enemy.x = Math.random() * game.viewPort._canvas.width;
    enemy.y = Math.random() * game.viewPort._canvas.height;
    enemy.angle = Math.random() * 360;


    game.processLoop.on('step', function(){
        if(enemy.destroyed){
            return;
        }
        enemy.angle += Math.random() * 5 - 2.5;

        applyForce(enemy, enemy.mass/10, enemy.angle);

        if(Math.random() * 1000 < 3){
            var bullet = new Bullet(game);
            game.addEntity(bullet);

            bullet.owner = enemy;

            bullet.angle = enemy.angle;
            bullet.x = enemy.x;
            bullet.y = enemy.y;
            bullet.velocity = {
                x: enemy.velocity.x,
                y: enemy.velocity.y
            };
            applyForce(bullet, bullet.mass * 3, bullet.angle);
        }
        enemy.velocity.x*=0.8;
        enemy.velocity.y*=0.8;
    });

    game.addEntity(enemy);
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

window.addEventListener('load', function(){
    var game = new Game();

    document.body.appendChild(game.viewPort._canvas);
});