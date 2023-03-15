function draw() {

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

    // Define the <current> color fill style
    ctx.fillStyle = "rgb(220, 220, 220)";
    ctx.fillRect(0, 0, width, height);
    //Use it to fill a rectangle
    ctx.fill();
    // Redefine the <current> color fill style
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.beginPath();
    ctx.ellipse(50, 50, 40, 40, 0, 0, 2 * Math.PI);
    // Use it to fill an ellipse shape
    ctx.fill();
    // Traces an ellipse path with default stroke style
    ctx.stroke();

    /**
     * A simple line path using .beginPath() and .closePath() methods
     */

    ctx.lineWidth = 10;
    ctx.lineCap = "butt"; // "square", "butt", "round"
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(120, 120);
    ctx.lineTo(120, 150);
    ctx.lineTo(200, 150);
    ctx.lineTo(200, 180);
    ctx.lineTo(220, 200);
    ctx.stroke();
    // ctx.closePath();

    /**
     * This method tells the browser that you wish to perform an animation 
     * and requests that the browser calls a specified function to 
     * update an animation before the next repaint. The method takes a 
     * callback function as an argument to be invoked before the repaint.
     * 
     * draw: The callback function to call when it's time to update your animation 
     * for the next repaint. The callback function is passed one single argument, 
     * a DOMHighResTimeStamp, indicating the point in time when requestAnimationFrame() 
     * starts to execute callback functions.
     */

    window.requestAnimationFrame(draw);

}

draw();