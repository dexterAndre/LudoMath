"use strict"



// WebGL
var canvas;
var gl;

// Geometry
var vertices = [
    -0.5, 0.5, 
    -0.5, -0.5, 
    0.0, -0.5,
];
var axis_x = [
    -1.0, 0.5, 
    1.0, 0.5,
];
var axis_y = [
    0.5, -1.0, 
    0.5, 1.0,
];

// Shader code
var vertexShaderCode = `
attribute vec2 coordinates;

void main(void)
{
    gl_Position = vec4(coordinates, 0.0, 1.0);
}
`;
var fragmentShaderCode = `
void main(void)
{
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);
}
`



window.onload = function initialize()
{
    // Set up WebGL
    canvas = this.document.getElementById("gl-canvas");
    gl = canvas.getContext("experimental-webgl");

    // Buffers
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    // Associate shader program to buffer objects
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var coordinatesLoc = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coordinatesLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coordinatesLoc);

    // Draw geometry
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}