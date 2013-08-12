
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

function Input(){
    var input = this;
    this.keysDown = {};
    this.mouse = {};

    window.addEventListener('keydown', function(event){
        input.keysDown[event.which] = true;
    });
    window.addEventListener('keyup', function(event){
        delete input.keysDown[event.which];
    });
    ["mousemove", "mousedown", "mouseup","click"].forEach(function(eventName){
        window.addEventListener(eventName, function(event){
            input.mouse = event;
        });
    });
}

module.exports = Input;
