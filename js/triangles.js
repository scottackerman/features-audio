var x = 0;
var y = 0;
var prevX = x;
var prevY = y;
var triangleSize = 20;
var triangleHeight;
var stageWidth = triangleSize * 60; //158;
var stageHeight = triangleSize * 30; //60;
var bgColor = 0;
var bgOpacity = 3.5;
var gridStrokeWeight = 1;
var gridStrokeOpacity = 80;
var gridStrokeColor = [153, 183, 232, gridStrokeOpacity];
var drawStrokeWeight = 2;
var drawStrokeColor = [255, 255, 255];
var lineEndDotWeight = 5;
var posNeg = 1;
var iteration = 0;
var lineSteps = 1;
var framerate = 60;
var direction;
var lineStepSize;
var coordinates = {};
var gridLineArray = [];
var drawnLineArray = [];
var currentLinePoints;
var useMouse = false;

var count = 0;

function reset() {
    strokeWeight(0);
    rect(0, 0, width, height);
    background(bgColor);
    stroke(gridStrokeColor);
    strokeWeight(gridStrokeWeight);
    frameRate(framerate);
    iteration = 0;
    drawGrid();
}

function toggleMouse() {
    if(useMouse == false) {
        useMouse = true;
        $('.audioControllerDisplay span').text('Mouse controling audio');
    }
    else {
        useMouse = false;
        $('.audioControllerDisplay span').text('Viz controling audio');
    }
    muteAudio();
    reset();
    // Don't refresh the page
    return false;
}

function processForm() {
    var form = document.getElementById('params');
    framerate = parseInt(form.elements.framerate.value);
    drawStrokeWeight = parseInt(form.elements.drawStrokeWeight.value);
    lineSteps = parseInt(form.elements.lineSteps.value);
    reset();
    // Don't refresh the page
    return false;
}

function drawGrid() {
    // Draw angled lines
    for(var i=0; i<height/triangleHeight; i++) {
        if(i % 2 === 1) {
            x = 0;
        } else {
            x = -triangleSize/2;
        }
        y = triangleHeight * iteration;
        prevX = x;
        prevY = y;
        for(var j=0; j<((width/triangleSize)*2) + triangleSize/2; j++) {
            line(x, y, prevX, prevY);
            prevX = x;
            prevY = y;
            posNeg *= -1;
            x += triangleSize/2;
            y += triangleHeight * posNeg;
        }
        iteration++;
    }
    iteration = 1;
    // Draw horizontal lines
    for(var i=0; i<height/triangleHeight; i++) {
        x = 0;
        y = triangleHeight * iteration;
        prevX = x;
        prevY = y;
        for(var j=0; j<(width/triangleSize)*2; j++) {
            x += triangleSize;
            line(x, y, prevX, prevY);
            prevX = x;
            prevY = y;
        }
        iteration++;
    }

    console.log('gridLineArray l = ' + gridLineArray.length);

    // Reset vars and set origin point of drawing
    x = -triangleSize;
    y = -triangleHeight;
    prevX = x;
    prevY = y;
    iteration = 0;
}

function getNextCoordinates() { // sets coords to one of 6 options; 3 o'clock, 1:30, 10:30, 9, 7:30 and 4:30
    coordinates = {};
    direction = floor(random(6));
    switch(direction) {
        case 0:
            coordinates = {'x': triangleSize, 'y': 0};
            break;
        case 1:
            coordinates = {'x': triangleSize/2, 'y': triangleHeight};
            break;
        case 2:
            coordinates = {'x': -triangleSize/2, 'y': triangleHeight};
            break;
        case 3:
            coordinates = {'x': -triangleSize, 'y': 0};
            break;
        case 4:
            coordinates = {'x': -triangleSize/2, 'y': -triangleHeight};
            break;
        case 5:
            coordinates = {'x': triangleSize/2, 'y': -triangleHeight};
            break;
        default:
            //
    }
}

function setup() {
    createCanvas(stageWidth, stageHeight);
    background(bgColor);
    stroke(gridStrokeColor);
    strokeWeight(gridStrokeWeight);
    // Pythagorean theorem to get triangle height
    triangleHeight = sqrt(pow(triangleSize, 2) - pow(triangleSize/2, 2));
    drawGrid();
    frameRate(framerate);
}

function draw() {
    if(count < 30) {
        count ++;
    }
    // New semi-transparent overlay on each cycle to
    // fade the last several line drawings
    fill(bgColor, bgOpacity);
    strokeWeight(0);
    rect(0, 0, width, height);
    if(useMouse === false) {
        stroke(drawStrokeColor);
        strokeWeight(drawStrokeWeight);
        getNextCoordinates();
        // How many steps this line will draw
        lineStepSize = (floor(random(lineSteps)) + 1);
        x += coordinates.x * lineStepSize;
        y += coordinates.y * lineStepSize;
        if (x < -(triangleSize/2) || x > width + (triangleSize/2)) {
            x = prevX;
            y = prevY;
        }
        if (y < -triangleHeight/2 || y > height+triangleHeight/2) {
            x = prevX;
            y = prevY;
        }
        // Check here for x, y
        line(x, y, prevX, prevY);
        strokeWeight(lineEndDotWeight);
        point(x, y);
        if(count >= 30) {
            crossfade(x, y);
        }
    }

    stroke(153, 183, 232, gridStrokeOpacity);
    strokeWeight(6);
    line(0, stageHeight, stageWidth/2, 0);
    line(stageWidth/2, 0, stageWidth, stageHeight);
    line(0, stageHeight - 2, stageWidth, stageHeight - 2);
    strokeWeight(0);
    fill(153, 183, 232, gridStrokeOpacity);
    textFont('Optimist');
    textSize(18);
    textAlign(LEFT);
    text('Privacy', 60, stageHeight - 20);
    textAlign(CENTER);
    text('Security', stageWidth/2, 60);
    textAlign(RIGHT);
    text('Convenience', stageWidth - 60, stageHeight - 20);

    prevX = x;
    prevY = y;
    iteration++;
}