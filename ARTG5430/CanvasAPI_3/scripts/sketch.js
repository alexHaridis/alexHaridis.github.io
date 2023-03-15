// Specify the dimensions of the Canvas

// const width = window.innerWidth;
let width = 400;
// const height = window.innerHeight;
let height = 400;

const canvas = document.getElementById("canvas");

// Resize the Canvas element
canvas.width = width;
canvas.height = height;

/**
 * This specification defines the 2d context type, whose API is implemented 
 * using the CanvasRenderingContext2D interface.
 * 
 * The CanvasRenderingContext2D interface, part of the Canvas API, provides the 
 * 2D rendering context for the drawing surface of a <canvas> element. It is used 
 * for drawing shapes, text, images, and other objects.
 * 
 * The 2D context represents a flat Cartesian surface whose origin (0,0) 
 * is at the top left corner, with the coordinate space having x values 
 * increasing when going right, and y values increasing when going down.
 */

const ctx = canvas.getContext("2d");

/**
 * The rest of the methods used below are all methods taken from the
 * CanvasRenderingContext2D object.
 */

canvas.onmousedown = canvas.onmousemove = function(e) {

    if (e.buttons) {
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(e.offsetX, e.offsetY, 20, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
    
};