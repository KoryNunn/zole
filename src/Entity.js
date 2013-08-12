var createSpec = require('spec-js');

function Entity(description){
    if(description){
        for(var key in description){
            this[key] = description[key];
        }
    }

    this.velocity = {x:0,y:0};

    //callbacks in here get called on destroy;
    this._cleanups = [];
}
Entity = createSpec(Entity);
Entity.prototype.width = 20;
Entity.prototype.height = 20;
Entity.prototype.mass = 100;
Entity.prototype.render = function(){};
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

    while(this._cleanups.length){
        this._cleanups.pop()();
    }
};
Entity.prototype.applyForce = function (force, angle){
    if(!force){
        return;
    }
    this.velocity.x += force / this.mass * Math.sin(this * (Math.PI/180));
    this.velocity.y -= force / this.mass * Math.cos(this * (Math.PI/180));
}

module.exports = Entity;