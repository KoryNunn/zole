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

module.exports = {
    polarToCartesian: polarToCartesian,
    cartesianToPolar: cartesianToPolar,
    reflect: reflect,
    getNetAngle: getNetAngle,
    degreesToRadians: degreesToRadians,
    radiansToDegrees: radiansToDegrees
};