"use strict"






/*
    To do: 
    - Convert points to Vec2
    - Make a flatten function for lists of vectors
    - Clean up shader code
    - - Use shaders from files
    - - Use materials with properties
    - Clean up code structure - use a generic rendering function for each of the different types
    - Enable refraction code to handle > 1 values for n1 / n2
    - Remember to also refract the first ray, which is an exception from the for-loop
    - Add color property to the vectors, decreasing opacity for each light bounce
    - Make light bouncing a recursive function with max bounce times
    - Fix so that the r_d shows the correct amount of rays (minus 1?)

    1. Correct ray placement
    2. Varying density of rays
    3. Line segment upon collision
    3.1 Add another refracted segment within the circle
    3.2 Add the last ray exiting the circle
    4. Add drag-n-drop to points
*/


// WebGL
var canvas;
var gl;

var mouseDown = 0;
var mouseX = 0;
var mouseY = 0;

// Geometry
var pointA = [-0.5, -0.5];
var pointB = [-0.75, 0.23];
var pointC = [0.0, 0.0];
var points = [
    pointA[0], pointA[1],
    pointB[0], pointB[1],
    pointC[0], pointC[1]
];

var circle = [];
var circleResolution = 128;
var circleRadius = 0.25;

var lineAB = [
    pointA[0], pointA[1], 
    pointB[0], pointB[1]
];
var gizmos = [];

var rays = [];
var rayLength = 1000;
var rayDensity = 3;
var n1 = 1.0;
var n2 = 1.5168;








// Shader code
var pointVSCode = `
attribute vec2 coordinates;

void main(void)
{
    gl_PointSize = 10.0;
    gl_Position = vec4(coordinates, 0.0, 1.0);
}
`;
var pointFSCode = `
void main(void)
{
    gl_FragColor = vec4(0.2, 0.2, 0.8, 1.0);
}
`;

var lineVSCode = `
attribute vec2 coordinates;

void main(void)
{
    gl_Position = vec4(coordinates, 0.0, 1.0);
}
`;
var lineFSCode = `
void main(void)
{
    gl_FragColor = vec4(0.2, 0.8, 0.2, 1.0);
}
`;

var gizmoVSCode = `
attribute vec2 coordinates;

void main(void)
{
    gl_Position = vec4(coordinates, 0.0, 1.0);
}
`;
var gizmoFSCode = `
void main(void)
{
    gl_FragColor = vec4(0.8, 0.2, 0.2, 1.0);
}
`;

var rayVSCode = `
attribute vec2 coordinates;
attribute vec4 color;

varying vec4 fColor;

void main(void)
{
    fColor = color;
    gl_Position = vec4(coordinates, 0.0, 1.0);
}
`;
var rayFSCode = `
precision mediump float;

varying vec4 fColor;

void main(void)
{
    gl_FragColor = fColor;
}
`;



// HTML objects
var sliderRD = document.getElementById("sliderRD");
var sliderRDText = document.getElementById("sliderRDText");
var sliderN1 = document.getElementById("sliderN1");
var sliderN1Text = document.getElementById("sliderN1Text");
var sliderN2 = document.getElementById("sliderN2");
var sliderN2Text = document.getElementById("sliderN2Text");



function update(gl)
{
    console.clear();

    // Updating input
    updateInput(rayDensity, n1, n2);
    
    // Updating the sliders' value texts
    updateValueText();
    
    updateGeometry();

    render(gl);
}

function updateInput(RD, N1, N2)
{
    rayDensity = sliderRD.value;
    n1 = sliderN1.value;
    n2 = sliderN2.value;

    // Click-and-drag
    if (mouseDown)
    {
        points.push(mouseX, mouseY);
    }
}

// Updates the sliders' values
function updateValueText()
{
    var sliderRDTemp = sliderRD.value;
    // Adds zeroes in front to keep formatting
    if (sliderRD.value < 10)
    {
        sliderRDTemp = "00" + sliderRDTemp;
    }
    else if (sliderRD.value < 100)
    {
        sliderRDTemp = "0" + sliderRDTemp;
    }
    sliderRDText.textContent = sliderRDTemp;
    // Forces 2 decimal places
    sliderN1Text.textContent = (sliderN1.value / 100).toFixed(2);
    sliderN2Text.textContent = (sliderN2.value / 100).toFixed(2);
}

function updateGeometry()
{
    // Emptying lists
    points = [];
    circle = [];
    gizmos = [];
    rays = [];

    // Points
    points.push(
        pointA[0], pointA[1],
        pointB[0], pointB[1],
        pointC[0], pointC[1]);
    // Circle
    for (var i = 0; i < circleResolution * 4; i++)
    {
        circle.push(pointC[0] + circleRadius * Math.cos(((i) / (circleResolution)) * Math.PI * 2));
        circle.push(pointC[1] + circleRadius * Math.sin(((i) / (circleResolution)) * Math.PI * 2));

        circle.push(pointC[0] + circleRadius * Math.cos(((i + 1) / (circleResolution)) * Math.PI * 2));
        circle.push(pointC[1] + circleRadius * Math.sin(((i + 1) / (circleResolution)) * Math.PI * 2));
    }
    // Gizmos
    gizmos.push(lineAB[0], lineAB[1], lineAB[2], lineAB[3]);
    // Rays
    // Line-circle intercept
    function interceptLinesegCircle(cR, cP, p1, p2)
    {
        // Taken from https://stackoverflow.com/questions/37224912/circle-line-segment-collision

        var a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
        v1 = new Vec2(p2.x - p1.x, p2.y - p1.y);
        v2 = new Vec2(p1.x - cP.x, p1.y - cP.y);
        b = (v1.x * v2.x + v1.y * v2.y);
        c = 2 * (v1.x * v1.x + v1.y * v1.y);
        b *= -2;
        d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - cR * cR));
        if(isNaN(d)){ // no intercept
            return null;
        }
        u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
        u2 = (b + d) / c;    
        retP1 = new Vec2();   // return points
        retP2 = new Vec2();  
        ret = []; // return array
        if(u1 <= 1 && u1 >= 0){  // add point if on the line segment
            retP1.x = p1.x + v1.x * u1;
            retP1.y = p1.y + v1.y * u1;
            ret[0] = retP1;
        }
        if(u2 <= 1 && u2 >= 0){  // second add point if on the line segment
            retP2.x = p1.x + v1.x * u2;
            retP2.y = p1.y + v1.y * u2;
            ret[ret.length] = retP2;
        }       
        return ret;
    };
    function closestPoint(p, p1, p2)
    {
        var mag1 = p1.sub(p).magSqr();
        var mag2 = p2.sub(p).magSqr();

        return mag1 < mag2 ? p1 : p2;
    };
    function farthestPoint(p, p1, p2)
    {
        var mag1 = p1.sub(p).magSqr();
        var mag2 = p2.sub(p).magSqr();

        return mag1 < mag2 ? p2 : p1;
    };
    

    var vAB = new Vec2(pointB[0] - pointA[0], pointB[1] - pointA[1]);
    // console.log("vAB: ", vAB);
    var vA = new Vec2(pointA[0], pointA[1]);
    // console.log("vA:  ", vA);
    var vAC = new Vec2(pointC[0], pointC[1]).sub(vA);
    // console.log("vAC: ", vAC);
    var vN = vAC.rejection(vAB).normalization();
    // console.log("vN:  ", vN);

    // Adding rays
    for (var i = 0; i <= rayDensity; i++)
    {
        var vP;         // Point along AB
        // Taking the first point into account. JS didn't want to divide 0 by rayDensity. 
        i == 0 ? vP = vA : vP = (vA.add(vAB.mul(i / rayDensity)));
        
        // Collecting both collision points from point along red line onto circle. 
        // The multiplicand in the last line is the full distance from the point to the end of circle, and then + 1. 
        var colPointsFirst = interceptLinesegCircle(
            circleRadius, new Vec2(pointC[0], pointC[1]), 
            vP, 
            vP.add(vN.mul(new Vec2(pointC[0], pointC[1]).sub(vP).mag() + 2 * circleRadius + 1)));

        // If collision, we create a line segment from the red line to the collision point
        var tempVec;
        if (colPointsFirst)
        {
            // Adding first line segment
            var nearPoint = closestPoint(vP, colPointsFirst[0], colPointsFirst[1]);
            rays.push(
                vP.x, vP.y, 0.8, 0.8, 0.2, 1.0,
                nearPoint.x, nearPoint.y, 0.8, 0.8, 0.2, 1.0);

            // Adding second line segment (inside circle)
            tempVec = 
                vN
                .refraction((nearPoint.sub(new Vec2(pointC.x, pointC.y))), n1, n2);
            
            if (tempVec != null)
            {
                vN.normalize();

                // Collecting both collision points from first collision point along refracted ray
                var colPointsSecond = interceptLinesegCircle(
                    circleRadius, new Vec2(pointC[0], pointC[1]), 
                    nearPoint.sub(tempVec), 
                    nearPoint.add(tempVec.mul(2 * circleRadius + 1)));
    
                var farPoint = farthestPoint(vP, colPointsSecond[0], colPointsSecond[1]);
                rays.push(
                    nearPoint.x, nearPoint.y, 0.2, 0.8, 0.8, 1.0,
                    farPoint.x, farPoint.y, 0.2, 0.8, 0.8, 1.0);
    
                // Adding third line segment (escaping from circle)
                tempVec = 
                    tempVec
                    .refraction(new Vec2(pointC[0], pointC[1]).sub(farPoint), n1, n2);

                if (tempVec != null)
                {
                    tempVec.normalize();
                    tempVec.mulThis(1000);
                    rays.push(
                        farPoint.x, farPoint.y, 0.8, 0.2, 0.8, 1.0,
                        tempVec.x, tempVec.y, 0.8, 0.2, 0.8, 1.0);
                }
                else
                {
                    // If having to reflect
                    var reflectedVec = 
                        farPoint
                        .sub(nearPoint)
                        .reflection(new Vec2(pointC[0], pointC[1])
                            .sub(farPoint))
                        .normalization();
                    var points = interceptLinesegCircle(
                        circleRadius, 
                        new Vec2(pointC[0], pointC[1]), 
                        farPoint.sub(reflectedVec), 
                        farPoint.add(reflectedVec.mul(2 * circleRadius + 1)));
                    var fartherPoint = farthestPoint(farPoint, points[0], points[1]);

                    rays.push(
                        farPoint.x, farPoint.y, 0.0, 0.0, 0.0, 1.0,
                        fartherPoint.x, fartherPoint.y, 0.0, 0.0, 0.0, 1.0);
                }
            }
            else
            {
                // If having to reflect
                tempVec = 
                    nearPoint
                    .add(nearPoint
                        .sub(vP)
                        .reflection(nearPoint
                            .sub(new Vec2(pointC[0], pointC[1])))
                        .normalization()
                        .mul(1000));
                rays.push(
                    nearPoint.x, nearPoint.y, 1.0, 1.0, 1.0, 1.0,
                    tempVec.x, tempVec.y, 1.0, 1.0, 1.0, 1.0);
            }
        }
        // If no collision, just draw a ray and move to next iteration
        else
        {
            tempVec = vP.add(vN.mul(1000));
            rays.push(
                vP.x, vP.y, 0.8, 0.8, 0.2, 1.0, 
                tempVec.x, tempVec.y, 0.8, 0.8, 0.2, 1.0);

            console.log("Didn't hit circle");
        }
    }
}

function render(gl)
{
    // General rendering
    {
        gl.clearColor(0.5, 0.5, 0.5, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // Points
    {
        // Buffers
        var vbo_points = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo_points);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // Shaders
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, pointVSCode);
        gl.compileShader(vertexShader);

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, pointFSCode);
        gl.compileShader(fragmentShader);

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);

        // Associate shader program to buffer objects
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo_points);
        var coordinatesLoc = gl.getAttribLocation(shaderProgram, "coordinates");
        gl.vertexAttribPointer(coordinatesLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coordinatesLoc);

        // Draw geometry
        gl.drawArrays(gl.POINTS, 0, points.length / 2);
    }

    // Circle
    {
        // Buffers
        var vbo_circle = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo_circle);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circle), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // Shaders
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, lineVSCode);
        gl.compileShader(vertexShader);

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, lineFSCode);
        gl.compileShader(fragmentShader);

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);

        // Associate shader program to buffer objects
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo_circle);
        var coordinatesLoc = gl.getAttribLocation(shaderProgram, "coordinates");
        gl.vertexAttribPointer(coordinatesLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coordinatesLoc);

        // Draw geometry
        gl.drawArrays(gl.LINES, 0, circleResolution * 2);
    }

    // Gizmos
    {
        // Buffers
        var vbo_gizmos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo_gizmos);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gizmos), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // Shaders
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, gizmoVSCode);
        gl.compileShader(vertexShader);

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, gizmoFSCode);
        gl.compileShader(fragmentShader);

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);

        // Associate shader program to buffer objects
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo_gizmos);
        var coordinatesLoc = gl.getAttribLocation(shaderProgram, "coordinates");
        gl.vertexAttribPointer(coordinatesLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coordinatesLoc);

        // Draw geometry
        gl.drawArrays(gl.LINES, 0, 2);
    }

    // Rays
    {
        // Buffers
        var vbo_rays = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo_rays);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rays), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // Shaders
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, rayVSCode);
        gl.compileShader(vertexShader);

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, rayFSCode);
        gl.compileShader(fragmentShader);

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);

        // Associate shader program to buffer objects
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo_rays);
        const coordinatesLoc = gl.getAttribLocation(shaderProgram, "coordinates");
        gl.vertexAttribPointer(coordinatesLoc, 2, gl.FLOAT, false, 4 /* sizeof(gl.FLOAT) */ * 6, 0);
        gl.enableVertexAttribArray(coordinatesLoc);
        const colorLoc = gl.getAttribLocation(shaderProgram, "color");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 4 /* sizeof(gl.FLOAT) */ * 6, 4 /* sizeof(gl.FLOAT) */ * 2);
        gl.enableVertexAttribArray(colorLoc);

        // Draw geometry
        gl.drawArrays(gl.LINES, 0, rays.length / 6);
    }
}

function getMousePosition(canvas, evt)
{
    return [
        (evt.offsetX / canvas.width) * 2 - 1, 
        ((512 - evt.offsetY) / canvas.height) * 2 - 1];
}



window.onload = function initialize()
{
    // Set up WebGL
    canvas = this.document.getElementById("canvas-refraction-circle");
    gl = canvas.getContext("experimental-webgl");

    // Enabling mouse controls
    canvas.onmousedown = function(evt) 
    { 
        mouseDown = 1; 
        var mousePos = getMousePosition(canvas, evt); 
        mouseX = mousePos[0];
        mouseY = mousePos[1];
    }
    canvas.onmouseup = function(evt) { mouseDown = 0; }
    
    // Updating and rendering scene
    update(gl);
}
