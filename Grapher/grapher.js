"use strict"


/*
    To do: 
    - Use vectors instead of several floats
    - Convert stroke and fill size into pixel units (or point units?)
    - Setting for stroke on inner, outer, or center (center by default)
*/


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
// Use a slider with range [2, 5]? as a power of 2
var graphicsResolutionRoundness = 32;
var graphicsRadiusRadiusOuter = 0.5;
var graphicsRadiusRadiusInner = 0.25;
//      Color
var graphicsColorBackground = [0.922, 0.922, 0.922, 1.0];
var graphicsColorFill = [1.0, 1.0, 1.0, 1.0];
var graphicsColorPointStroke = [0.471, 0.647, 1.0, 1.0];
var graphicsColorLineStroke = [0.525, 0.827, 0.455, 1.0];
var graphicsColorLineSegStroke = graphicsColorLineStroke;
var graphicsColorRayStroke = graphicsColorLineStroke;
var graphicsColorVectorStroke = [1.0, 0.471, 0.471, 1.0];

function meshCountPoint()
{
    return 2 * graphicsResolutionRoundness + 1;
};

// Scene
function Mesh(object)
{
    // First buffer for fill, second buffer for stroke
    this.vertices = [];
    var bufferVertices;

    this.meshPoint = function(object, lap, rotation)
    {
        console.log("object from within meshPoint: ", object);
        console.log("meshCountPoint(): ", meshCountPoint());

        var tempVertices = [];
        
        // Inner ring (including center point)
        this.vertices.push(
            object.x, 
            object.y, 
            0.0
        );
        var step = 0;
        var t1 = TAU / (graphicsResolutionRoundness * 2);   // Half-angle of every step
        for (var i = 0; i < graphicsResolutionRoundness; i++)
        {
            step = t1 + (rotation || 0) + (i / graphicsResolutionRoundness) * TAU;
            this.vertices.push(
                object.x + graphicsRadiusRadiusInner * Math.cos(step),
                object.y + graphicsRadiusRadiusInner * Math.sin(step),
                0.0
            );
        }
        // Outer ring (reusing some of the inner ring points)
        var step = 0;
        for (var i = 0; i < graphicsResolutionRoundness; i++)
        {
            step = (rotation || 0) + (i / graphicsResolutionRoundness) * TAU;
            this.vertices.push(
                object.x + graphicsRadiusRadiusOuter * Math.cos(step),
                object.y + graphicsRadiusRadiusOuter * Math.sin(step),
                0.0
            );
        }

        // Sorting inner array into fill array
        // Ordered to render as gl.TRIANGLE_FAN
        for (var i = 0; i < graphicsResolutionRoundness + 1; i++)
        {
            tempVertices.push(
                this.vertices[0 + i * 3 + 3 * lap * meshCountPoint()], 
                this.vertices[1 + i * 3 + 3 * lap * meshCountPoint()], 
                this.vertices[2 + i * 3 + 3 * lap * meshCountPoint()],
                graphicsColorFill[0], 
                graphicsColorFill[1], 
                graphicsColorFill[2], 
                graphicsColorFill[3]
            );
        }
        tempVertices.push(
            this.vertices[0 + 1 * 3 + 3 * lap * meshCountPoint()], 
            this.vertices[1 + 1 * 3 + 3 * lap * meshCountPoint()], 
            this.vertices[2 + 1 * 3 + 3 * lap * meshCountPoint()],
            graphicsColorFill[0], 
            graphicsColorFill[1], 
            graphicsColorFill[2], 
            graphicsColorFill[3]
        );
        
        // Sorting outer array into stroke array, also reusing some from the inner array
        // Ordered to render as gl.TRIANGLE_STRIP
        for (var i = 1; i < graphicsResolutionRoundness + 1; i++)
        {
            tempVertices.push(
                this.vertices[0 + (i + graphicsResolutionRoundness) * 3 + 3 * lap * meshCountPoint()],
                this.vertices[1 + (i + graphicsResolutionRoundness) * 3 + 3 * lap * meshCountPoint()],
                this.vertices[2 + (i + graphicsResolutionRoundness) * 3 + 3 * lap * meshCountPoint()],
                graphicsColorPointStroke[0],
                graphicsColorPointStroke[1],
                graphicsColorPointStroke[2],
                graphicsColorPointStroke[3],
                this.vertices[0 + i * 3 + 3 * lap * meshCountPoint()],
                this.vertices[1 + i * 3 + 3 * lap * meshCountPoint()],
                this.vertices[2 + i * 3 + 3 * lap * meshCountPoint()],
                graphicsColorPointStroke[0],
                graphicsColorPointStroke[1],
                graphicsColorPointStroke[2],
                graphicsColorPointStroke[3]
            );
        }
        tempVertices.push(
            this.vertices[0 + (1 + graphicsResolutionRoundness) * 3 + 3 * lap * meshCountPoint()],
            this.vertices[1 + (1 + graphicsResolutionRoundness) * 3 + 3 * lap * meshCountPoint()],
            this.vertices[2 + (1 + graphicsResolutionRoundness) * 3 + 3 * lap * meshCountPoint()],
            graphicsColorPointStroke[0],
            graphicsColorPointStroke[1],
            graphicsColorPointStroke[2],
            graphicsColorPointStroke[3],
            this.vertices[0 + 1 * 3 + 3 * lap * meshCountPoint()],
            this.vertices[1 + 1 * 3 + 3 * lap * meshCountPoint()],
            this.vertices[2 + 1 * 3 + 3 * lap * meshCountPoint()],
            graphicsColorPointStroke[0],
            graphicsColorPointStroke[1],
            graphicsColorPointStroke[2],
            graphicsColorPointStroke[3]
        );
        
        console.log("tempVertices from within meshPoint: ", tempVertices);
        console.log("this.vertices from within meshPoint: ", this.vertices);
        return tempVertices;
    };
    this.meshLine = function(object, rotation)
    {
        var tempVertices = [];
        tempVertices.push.apply(tempVertices, this.meshPoint(object.a, 0, rotation));
        tempVertices.push.apply(tempVertices, this.meshPoint(object.b, 1, rotation));
        return tempVertices;
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
                bufferVertices = this.meshPoint(obj, 0);
                console.log(bufferVertices);
                this.generateBuffers();
                return;
            }
            case Line:
            {
                // Calculate angle between x-axis and AB-vector
                var dx = obj.b.x - obj.a.x;
                var dy = obj.b.y - obj.a.y;
                var vAB = new Vec2(dx, dy).normalization();
                var vX = new Vec2(1, 0);
                var angle = vX.angleUnit(vAB);
                bufferVertices = this.meshLine(obj, angle);

                console.log("obj from within assignMesh: ", obj.a);
                console.log("obj from within assignMesh: ", obj.b);

                // var mpa = this.meshPoint(obj.a, angle);
                // var mpb = this.meshPoint(obj.b, angle);
                // console.log("mpa from within assignMesh: ", mpa);
                // console.log("mpb from within assignMesh: ", mpb);
                // console.log("bufferVertices from within assignMesh: ", bufferVertices);

                // bufferVertices.push.apply(bufferVertices, mpa);
                // bufferVertices.push.apply(bufferVertices, mpb);

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
    
    this.drawPoint = function()
    {
        // Much of this code should happen at init time! 
        
        // Buffers
        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferVertices), gl.STATIC_DRAW);
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
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        const coordLoc = gl.getAttribLocation(shaderProgram, "coordinates");
        gl.vertexAttribPointer(coordLoc, 3, gl.FLOAT, false, 4 * 7, 0);
        gl.enableVertexAttribArray(coordLoc);
        const colorLoc = gl.getAttribLocation(shaderProgram, "color");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 4 * 7, 4 * 3);
        gl.enableVertexAttribArray(colorLoc);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, graphicsResolutionRoundness + 2);
        gl.drawArrays(gl.TRIANGLE_STRIP, graphicsResolutionRoundness + 2, 2 * graphicsResolutionRoundness + 2);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };
    this.drawLine = function()
    {
        // Much of this code should happen at init time! 
        
        // Buffers
        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferVertices), gl.STATIC_DRAW);
        this.fillBuffer = vBuffer;
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

        var offset = 0;
        gl.drawArrays(gl.TRIANGLE_FAN, offset, graphicsResolutionRoundness + 2);
        offset += graphicsResolutionRoundness + 2;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, 2 * graphicsResolutionRoundness + 2);
        offset += 2 * graphicsResolutionRoundness + 2;
        gl.drawArrays(gl.TRIANGLE_FAN, offset, graphicsResolutionRoundness + 2);
        offset += graphicsResolutionRoundness + 2;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, 2 * graphicsResolutionRoundness + 2);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
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

    this.bufferPoint = function(object)
    {
        
    };
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
    this.b = p2;
};
function LineSeg(p1, p2)
{
    this.a = p1;
    this.b = p2;
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
    // scene.push(new MathObject("pointA", new Point(0.0, 0.0, 0.0)));
    scene.push(new MathObject("lineAB", new Line(new Point(-0.5, -0.5, 0.0), new Point(0.5, 0.5, 0.0))));
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