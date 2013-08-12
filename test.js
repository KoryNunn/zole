var zole = require('./'),
    createSpec = require('spec-js'),
    crel = require('crel');
    Entity = require('./src/Entity');


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

    this.applyForce(this.mass / 10, this.angle);
    
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
Ship.prototype.type = 'ship';
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


function spawnEnemy(game){
    var enemy = new Ship(game);

    enemy.x = Math.random() * game.viewPort._canvas.width;
    enemy.y = Math.random() * game.viewPort._canvas.height;
    enemy.angle = Math.random() * 360;


    game.on('step', function(){
        if(enemy.destroyed){
            return;
        }
        enemy.angle += Math.random() * 5 - 2.5;

        enemy.applyForce(enemy.mass/10, enemy.angle);

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
            bullet.applyForce(bullet.mass * 3, bullet.angle);
        }
        enemy.velocity.x*=0.8;
        enemy.velocity.y*=0.8;
    });

    game.addEntity(enemy);
}

var game = new zole.Game();

var ship = new Ship();


    // game.currentPlayer = new Player();
    // game.addPlayer(this.currentPlayer);

    for(var i = 0; i < 20; i++){
        spawnEnemy(game);
    }

    game.on('step', function(){
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
            ship.applyForce(ship.mass/10, ship.angle);
        }
        if(keys.space in game.io.keysDown){
            if(!ship.gunCooldown){
                ship.gunCooldown = 5;
                var bullet = new Bullet(game);
                game.addEntity(bullet);

                bullet.owner = ship;

                copyPhysics(ship, bullet);

                bullet.applyForce(bullet.mass * 5, bullet.angle);
            }
        }
    });

    ship.x = 10;

    game.addEntity(ship);

window.addEventListener('load', function(){
    document.body.appendChild(game.viewPort._canvas);
});