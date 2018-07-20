"use strict"

// WebGL
var canvas;
var gl;

// Shader code
var vsObject = `
attribute vec3 coordinates;
attribute vec4 color;

varying vec4 fColor;

void main(void)
{
    fColor = color;
    gl_Position = vec4(coordinates, 1.0);
}
`;
var fsObject = `
precision mediump float;

varying vec4 fColor;

void main(void)
{
    gl_FragColor = fColor;
}
`;

// HTML
var btnPoint;
var btnLine;
var btnCircle;
var btnPolygon;
var btnVector;

// Settings
//  Graphics
//      Resolution
var graphicsResolutionRoundness = 8;
var graphicsRadiusRadiusOuter = 0.025;
var graphicsRadiusRadiusInner = 0.020;
//      Color
var graphicsColorBackground = [0.922, 0.922, 0.922, 1.0];
var graphicsColorFill = [1.0, 1.0, 1.0, 1.0];
var graphicsColorPointStroke = [0.471, 0.647, 1.0, 1.0];
var graphicsColorLineStroke = [0.525, 0.827, 0.455, 1.0];
var graphicsColorLineSegStroke = graphicsColorLineStroke;
var graphicsColorRayStroke = graphicsColorLineStroke;
var graphicsColorVectorStroke = [1.0, 0.471, 0.471, 1.0];

// Scene
function Mesh(object)
{
    // First buffer for fill, second buffer for stroke
    this.fill = [];
    var fill2;
    this.stroke = [];
    var stroke2;

    this.fillBuffer;
    this.strokeBuffer;

    this.meshPoint = function(object)
    {
        var inner = [];
        var outer = [];
        
        // Inner ring (including center point)
        inner.push(object.x, object.y, object.z);
        var step = 0;
        var t1 = TAU / (graphicsResolutionRoundness * 2);   // Half-angle of every step
        for (var i = 0; i < graphicsResolutionRoundness; i++)
        {
            step = t1 + (i / graphicsResolutionRoundness) * TAU;
            inner.push(
                    object.x + graphicsRadiusRadiusInner * Math.cos(step),
                    object.y + graphicsRadiusRadiusInner * Math.sin(step),
                    0.0
                );
        }
        // Sorting inner array into fill array
        for (var i = 0; i < graphicsResolutionRoundness + 1; i++)
        {
            this.fill.push(
                inner[0 + i * 3], 
                inner[1 + i * 3], 
                inner[2 + i * 3],
                graphicsColorFill[0], 
                graphicsColorFill[1], 
                graphicsColorFill[2], 
                graphicsColorFill[3]);
        }
        this.fill.push(
            inner[0 + 1 * 3], 
            inner[1 + 1 * 3], 
            inner[2 + 1 * 3],
            graphicsColorFill[0], 
            graphicsColorFill[1], 
            graphicsColorFill[2], 
            graphicsColorFill[3]);
        
        // Outer ring (reusing some of the inner ring points)
        var step = 0;
        for (var i = 0; i < graphicsResolutionRoundness; i++)
        {
            step = (i / graphicsResolutionRoundness) * TAU;
            outer.push(
                    object.x + graphicsRadiusRadiusOuter * Math.cos(step),
                    object.y + graphicsRadiusRadiusOuter * Math.sin(step),
                    0.0
                );
        }
        // Sorting outer and inner into stroke array
        // for (var i = 0; i < )
        // CHECKPOINT
        
        // Quick hack in order for the draw[Object] functions to recognize their own fill and stroke arrays. 
        fill2 = this.fill;
        stroke2 = this.stroke;
    };
    this.meshLine = function(object)
    {
        
    };
    this.meshLineSeg = function(object)
    {
        
    };
    this.meshRay = function(object)
    {
        
    };
    this.meshVector = function(object)
    {
        
    };
    this.generateBuffers = function()
    {
        
    };
    this.initShaders = function()
    {

    };
    this.assignMesh = function(obj)
    {
        switch (obj.constructor)
        {
            case Point:
            {
                this.meshPoint(obj);
                this.generateBuffers();
                return;
            }
            case Line:
            {
                this.meshLine(obj);
                this.generateBuffers();
                return;
            }
            case LineSeg:
            {
                this.meshLineSeg(obj);
                this.generateBuffers();
                return;
            }
            case Ray:
            {
                this.meshRay(obj);
                this.generateBuffers();
                return;
            }
            case Vector:
            {
                this.meshVector(obj);
                this.generateBuffers();
                return;
            }
        }
        // initShaders();
    };
    this.assignMesh(object);
    console.log("fill: ", this.fill);
    
    this.drawPoint = function()
    {
        console.log("fill2: ", fill2);
        // Much of this code should happen at init time! 
        
        // Buffers
        //  Fill buffer
        var bfr_fill = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bfr_fill);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fill2), gl.STATIC_DRAW);
        this.fillBuffer = bfr_fill;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        //  Stroke buffer
        var bfr_stroke = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bfr_stroke);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stroke2), gl.STATIC_DRAW);
        this.strokeBuffer = bfr_stroke;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // Shaders
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vsObject);
        gl.compileShader(vertexShader);
        
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fsObject);
        gl.compileShader(fragmentShader);

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        
        
        // Setting attributes
        gl.useProgram(shaderProgram);
        
        // Drawing fill
        gl.bindBuffer(gl.ARRAY_BUFFER, this.fillBuffer);
        const coordLoc = gl.getAttribLocation(shaderProgram, "coordinates");
        gl.vertexAttribPointer(coordLoc, 3, gl.FLOAT, false, 4 * 7, 0);
        gl.enableVertexAttribArray(coordLoc);
        const colorLoc = gl.getAttribLocation(shaderProgram, "color");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 4 * 7, 4 * 3);
        gl.enableVertexAttribArray(colorLoc);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, graphicsResolutionRoundness + 2);
        // gl.drawArrays(gl.TRIANGLE_FAN, 0, graphicsResolutionRoundness + 1);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        // // Drawing stroke
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.strokeBuffer);
        // gl.vertexAttribPointer(coordLoc, 3, gl.FLOAT, false, 4 * 7, 0);
        // gl.enableVertexAttribArray(coordLoc);
        // gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 4 * 7, 4 * 3);
        // gl.enableVertexAttribArray(colorLoc);
        // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        // // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 2 * graphicsResolutionRoundness);
        // gl.disableVertexAttribArray(coordLoc);
        // gl.disableVertexAttribArray(colorLoc);
        // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };
    this.drawLine = function()
    {

    };
    this.drawLineSeg = function()
    {

    };
    this.drawRay = function()
    {

    };
    this.drawVector = function()
    {

    };
};
Mesh.prototype.meshPoint = function(obj)
{
    // Do the same for the other functions!
    var inner = [];
    var outer = [];

    // Inner ring (including center point)
    inner.push(obj.x, obj.y, obj.z);
    var step = 0;
    var t1 = TAU / (graphicsResolutionRoundness * 2);   // Half-angle of every step
    for (var i = 0; i < graphicsResolutionRoundness; i++)
    {
        step = t1 + (i / graphicsResolutionRoundness) * TAU;
        inner.push(
            obj.x + graphicsRadiusRadiusInner * Math.cos(step),
            obj.y + graphicsRadiusRadiusInner * Math.sin(step),
            0.0
        );
    }

    // Outer ring (reusing some of the inner ring points)
    var step = 0;
    for (var i = 0; i < graphicsResolutionRoundness; i++)
    {
        step = (i / graphicsResolutionRoundness) * TAU;
        outer.push(
            obj.x + graphicsRadiusRadiusOuter * Math.cos(step),
            obj.y + graphicsRadiusRadiusOuter * Math.sin(step),
            0.0
        );
    }

    // Buffers
    //  Fill buffer
    var bfr_fill = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bfr_fill);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inner), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // this.buffers[0] = bfr_fill;
    //  Stroke buffer
    var bfr_stroke = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bfr_stroke);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(outer), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // this.buffers[1] = bfr_stroke;

    this.buffers = [bfr_fill, bfr_stroke];
};

function Point(x, y, z)
{
    this.x = x;
    this.y = y;
    this.z = z;
};
function Line(p1, p2)
{
    this.a = p1;
    this.a = p2;
};
function LineSeg(p1, p2)
{
    this.a = p1;
    this.a = p2;
};
function Ray(p, v)
{
    this.P = p;
    this.v = v;
};
function Vector(x, y, z)
{
    this.x = x;
    this.y = y;
    this.z = z;
};
function MathObject(name, data)
{
    this.name = name;
    this.data = data;
    this.mesh = new Mesh(data);
    this.draw;
    this.assignDrawCall = function(obj, mesh)
    {
        var instance = obj.constructor;
        switch (obj.constructor)
        {
            case Point:
            {
                this.draw = mesh.drawPoint;
                break;
            }
            case Line:
            {
                this.draw = mesh.drawLine;
                break;
            }
            case LineSeg:
            {
                this.draw = mesh.drawLineSeg;
                break;
            }
            case Ray:
            {
                this.draw = mesh.drawRay;
                break;
            }
            case Vector:
            {
                this.draw = mesh.drawVector;
                break;
            }
            default:
            {
                break;
            }
        }
    }

    this.assignDrawCall(data, this.mesh); 
};
var scene = [];
var gizmos = [];




function initWebGL()
{
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext("experimental-webgl");
};

function initTestScene()
{
    scene.push(new MathObject("pointA", new Point(0.1, 0.1, 0.0)));
};

function updateGeometry()
{
    
};

function updateBuffers(gl)
{

};

function draw()
{
    for (var i = 0; i < scene.length; i++)
    {
        scene[i].draw();
    }
    for (var i = 0; i < gizmos.length; i++)
    {

    }
};

function render(gl)
{
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    updateBuffers(gl);
    draw();
};

function update(gl)
{
    // Updating input
    // Updating HTML DOM display values
    updateGeometry();
    render(gl);
};

window.onload = function initialize()
{
    initWebGL();
    initTestScene();
    update(gl);
}