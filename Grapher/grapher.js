"use strict"


/*
    To do: 
    - Convert stroke and fill size into pixel units (or point units?)
    - Setting for stroke on inner, outer, or center (center by default)
    - Click-and-drag options for points (remember that most other structures are based on points in some way)
    - Create a vertex class
        - Position
        - Color
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
var Settings = 
{
    // Global settings variables
    g_resolutionRoundness : 64,

    // Coordinate system
    g_colorBackground : new Vec4(0.922, 0.922, 0.922, 1.0),
    // Mathematical objects
        // Global
    g_radiusFill : 0.1,
    g_radiusStroke : 0.05,
    g_colorFill : new Vec4(1.0, 1.0, 1.0, 1.0),
    g_colorStroke : new Vec4(0.471, 0.647, 1.0, 1.0),
        // Point
    g_radiusFillPoint : 0.1,
    g_radiusStrokePoint : 0.05,
    g_colorFillPoint : new Vec4(1.0, 1.0, 1.0, 1.0),
    g_colorStrokePoint : new Vec4(0.471, 0.647, 1.0, 1.0),
        // Line
    g_radiusStrokeLine : 0.05,
    g_colorStrokeLine : new Vec4(0.471, 0.647, 1.0, 1.0),
        // LineSeg
    g_radiusStrokeLineSeg : 0.05,
    g_colorStrokeLineSeg : new Vec4(0.471, 0.647, 1.0, 1.0),
        // Ray
    g_radiusStrokeRay : 0.05,
    g_colorStrokeRay : new Vec4(0.471, 0.647, 1.0, 1.0),
        // Vector
    g_radiusStrokeVector : 0.05,
    g_heightArrowVector : 0.15,
    g_colorFillVector : new Vec4(1.0, 1.0, 1.0, 1.0),
    g_colorStrokeVector : new Vec4(0.471, 0.647, 1.0, 1.0),
};

function meshCountPoint()
{
    return 2 * Settings.g_resolutionRoundness + 1;
};

// Scene
function Mesh(object)
{
    // First buffer for fill, second buffer for stroke
    this.vertices = [];
    var bufferVertices;

    this.meshPoint = function(object, rotation)
    {
        var oVec = new Vec3(object.x, object.y, object.z);
        // Inner ring (including center point)
        this.vertices.push(oVec);

        var step = 0;
        var t1 = TAU / (Settings.g_resolutionRoundness * 2);   // Half-angle of every step
        for (var i = 0; i < Settings.g_resolutionRoundness; i++)
        {
            step = t1 + (rotation || 0) + (i / Settings.g_resolutionRoundness) * TAU;
            this.vertices.push(
                oVec
                .add(new Vec3(
                    Math.cos(step), 
                    Math.sin(step), 
                    0.0)
                .mul(Settings.g_radiusFill)));
        }
        // Outer ring (reusing some of the inner ring points)
        var step = 0;
        for (var i = 0; i < Settings.g_resolutionRoundness; i++)
        {
            step = (rotation || 0) + (i / Settings.g_resolutionRoundness) * TAU;
            this.vertices.push(
                oVec
            .add(new Vec3(
                Math.cos(step),
                Math.sin(step),
                0.0)
            .mul(Settings.g_radiusFill + Settings.g_radiusStroke)));
        }
    };
    this.bufferPoint = function(lap)
    {
        var tempVertices = [];

        // Sorting inner array into fill array
        // Render as gl.TRIANGLE_FAN
        for (var i = 0; i < Settings.g_resolutionRoundness + 1; i++)
        {
            tempVertices.push(
                this.vertices[i + (lap || 0) * meshCountPoint()], 
                Settings.g_colorFill
            );
        }
        tempVertices.push(
            this.vertices[1 + (lap || 0) * meshCountPoint()], 
            Settings.g_colorFill
        );
        
        // Sorting outer array into stroke array, also reusing some from the inner array
        // Render as gl.TRIANGLE_STRIP
        for (var i = 1; i < Settings.g_resolutionRoundness + 1; i++)
        {
            tempVertices.push(
                this.vertices[i + Settings.g_resolutionRoundness + (lap || 0) * meshCountPoint()],
                Settings.g_colorStroke,
                this.vertices[i + (lap || 0) * meshCountPoint()],
                Settings.g_colorStroke
            );
        }
        tempVertices.push(
            this.vertices[1 + Settings.g_resolutionRoundness + (lap || 0) * meshCountPoint()],
            Settings.g_colorStroke,
            this.vertices[1 + (lap || 0) * meshCountPoint()],
            Settings.g_colorStroke
        );

        tempVertices = flatten(tempVertices);
        return tempVertices;
    };
    this.meshLine = function(object, rotation)
    {
        // Adding points a and b
        this.vertices.push.apply(this.vertices, this.meshPoint(object.a, rotation));
        this.vertices.push.apply(this.vertices, this.meshPoint(object.b, rotation));
        // Adding line part for last to make it easier to navigate the buffer's indices
        var pa = new Vec2(object.a.x, object.a.y);
        var pb = new Vec2(object.b.x, object.b.y);
        var vab = pb.sub(pa).normalization().mul(2);    // Making sure it exceeds the viewport to make the illusion of an infinite line
        var vn = vab.rotation(90 * DEG2RAD).normalization().mul(Settings.g_radiusStrokeLine);
        var p0 = pa.sub(vab).add(vn);
        var p1 = pa.sub(vab).sub(vn);
        var p2 = pb.add(vab).add(vn);
        var p3 = pb.add(vab).sub(vn);
        this.vertices.push(
            new Vec3(p0.x, p0.y, 0.0), 
            new Vec3(p1.x, p1.y, 0.0), 
            new Vec3(p2.x, p2.y, 0.0), 
            new Vec3(p3.x, p3.y, 0.0));
    };
    this.bufferLine = function()
    {
        var tempVertices = [];
        var lap = 0;

        // Points on top
        // Point a
        // Sorting inner array into fill array
        // Render as gl.TRIANGLE_FAN
        for (var i = 0; i < Settings.g_resolutionRoundness + 1; i++)
        {
            tempVertices.push(
                this.vertices[i + (lap || 0) * meshCountPoint()], 
                Settings.g_colorFillPoint
            );
        }
        tempVertices.push(
            this.vertices[1 + (lap || 0) * meshCountPoint()], 
            Settings.g_colorFillPoint
        );
        // Sorting outer array into stroke array, also reusing some from the inner array
        // Render as gl.TRIANGLE_STRIP
        for (var i = 1; i < Settings.g_resolutionRoundness + 1; i++)
        {
            tempVertices.push(
                this.vertices[i + Settings.g_resolutionRoundness + (lap || 0) * meshCountPoint()],
                Settings.g_colorStrokePoint,
                this.vertices[i + (lap || 0) * meshCountPoint()],
                Settings.g_colorStrokePoint
            );
        }
        tempVertices.push(
            this.vertices[1 + Settings.g_resolutionRoundness + (lap || 0) * meshCountPoint()],
            Settings.g_colorStrokePoint,
            this.vertices[1 + (lap || 0) * meshCountPoint()],
            Settings.g_colorStrokePoint
        );

        // Point b
        // Sorting inner array into fill array
        // Render as gl.TRIANGLE_FAN
        lap++;
        for (var i = 0; i < Settings.g_resolutionRoundness + 1; i++)
        {
            tempVertices.push(
                this.vertices[i + (lap || 0) * meshCountPoint()], 
                Settings.g_colorFillPoint
            );
        }
        tempVertices.push(
            this.vertices[1 + (lap || 0) * meshCountPoint()], 
            Settings.g_colorFillPoint
        );
        // Sorting outer array into stroke array, also reusing some from the inner array
        // Render as gl.TRIANGLE_STRIP
        for (var i = 1; i < Settings.g_resolutionRoundness + 1; i++)
        {
            tempVertices.push(
                this.vertices[i + Settings.g_resolutionRoundness + (lap || 0) * meshCountPoint()],
                Settings.g_colorStrokePoint,
                this.vertices[i + (lap || 0) * meshCountPoint()],
                Settings.g_colorStrokePoint
            );
        }
        tempVertices.push(
            this.vertices[1 + Settings.g_resolutionRoundness + (lap || 0) * meshCountPoint()],
            Settings.g_colorStrokePoint,
            this.vertices[1 + (lap || 0) * meshCountPoint()],
            Settings.g_colorStrokePoint
        );

        // Line in the back
        tempVertices.push(
            this.vertices[2 * meshCountPoint()],
            Settings.g_colorStrokePoint,
            this.vertices[2 * meshCountPoint() + 1],
            Settings.g_colorStrokePoint,
            this.vertices[2 * meshCountPoint() + 2],
            Settings.g_colorStrokePoint,
            this.vertices[2 * meshCountPoint() + 3],
            Settings.g_colorStrokePoint
        );

        tempVertices = flatten(tempVertices);
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
                this.meshPoint(obj);
                bufferVertices = this.bufferPoint(0);
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
                this.meshLine(obj, angle);
                bufferVertices = this.bufferLine();

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
        gl.useProgram(shaderProgram);
        
        // Setting up attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        const coordLoc = gl.getAttribLocation(shaderProgram, "coordinates");
        gl.vertexAttribPointer(coordLoc, 3, gl.FLOAT, false, 4 * 7, 0);
        gl.enableVertexAttribArray(coordLoc);
        const colorLoc = gl.getAttribLocation(shaderProgram, "color");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 4 * 7, 4 * 3);
        gl.enableVertexAttribArray(colorLoc);

        // Drawing point
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
        gl.useProgram(shaderProgram);
        
        // Setting up attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        const coordLoc = gl.getAttribLocation(shaderProgram, "coordinates");
        gl.vertexAttribPointer(coordLoc, 3, gl.FLOAT, false, 4 * 7, 0);
        gl.enableVertexAttribArray(coordLoc);
        const colorLoc = gl.getAttribLocation(shaderProgram, "color");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 4 * 7, 4 * 3);
        gl.enableVertexAttribArray(colorLoc);
        
        // Drawing points
        var offset = 0;
        gl.drawArrays(gl.TRIANGLE_FAN, 0, Settings.g_resolutionRoundness + 2);
        offset += Settings.g_resolutionRoundness + 2;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, 2 * Settings.g_resolutionRoundness + 2);
        offset += 2 * Settings.g_resolutionRoundness + 2;
        gl.drawArrays(gl.TRIANGLE_FAN, offset, Settings.g_resolutionRoundness + 2);
        offset += Settings.g_resolutionRoundness + 2;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, 2 * Settings.g_resolutionRoundness + 2);
        offset += 2 * Settings.g_resolutionRoundness + 2;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, 4);
        
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