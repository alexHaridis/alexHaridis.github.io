/**
 * This is a basic TEMPLATE for developing applications with the HTML5 Canvas API.
 * 
 * The main drawing functionality is implemented within the canvasApp() function.
 * The canvasApp() function is called once the browser listens to the event that
 * loads the page. This is done by adding the event listerner "load":
 *          window.addEventListener("load", eventWindowLoaded, false);
 * 
 * Resources:
 *      https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
 *      
 */

function canvasApp() {

    /**
     * Encapsulate within the following function anything that you want
     * to draw in your browser within the specified region allocated for canvas.
     */
    function drawScreen () {

        // Anything you need to draw is based on ctx.<your drawing methods> 

    }

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
     * 
     * See:
     * 
     *      https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
     */

    const ctx = canvas.getContext("2d");

    // Call the drawScreen() function at the end of the main canvasApp()
    drawScreen();

}

window.addEventListener("load", eventWindowLoaded, false);

function eventWindowLoaded () {
    canvasApp();
}

eventWindowLoaded();
