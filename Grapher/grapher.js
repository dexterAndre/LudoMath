"use strict"

var canvas;
var gl;

window.onload = function initialize()
{
    canvas = this.document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
}