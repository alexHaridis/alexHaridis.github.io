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
     *  Encapsulate within the following function anything that you want to
     *  draw in your browser within the specified region allocated for canvas.
     */
    function drawScreen () {

        const imgData = ctx1.getImageData(0, 0, width, height);
        const dataLength = imgData.data.length;

        /**
         * Greyscale Conversion
         */
        let greyScales = [];
        for (let i = 0; i < dataLength; i += 4) {
            /**
             * Greyscale values mimic the brightness of each pixel, a value between 0 ... 255. 
             * To compute brightness, you must average the R-G-B values of each pixel.
             * For more information, see:
             *      https://web.stanford.edu/class/cs101/image-6-grayscale-adva.html
             * 
             * In JavaScript:
             *      (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3
             * 
             * Alternatively, see the following that mimics the p5.js code
             */
            var greyscale = Math.round(imgData.data[i]*0.222 + imgData.data[i + 1]*0.707 + imgData.data[i + 2]*0.071);
            greyScales.push(greyscale);
        }

        // Map the greyscale values that are between 0...255 into a new range 0...6
        // and round the result to obtain integers.
        var gradientToIndex = greyScales.map(function(x) {
            return Math.round(mapRange(x, 0, 255, 0, 6));
        });

        for (let gridX = 0; gridX < width; gridX += scanStep) {
            for (let gridY = 0; gridY < height; gridY += scanStep) {
                /**
                 * Because gradientToIndex is a one-dimensional array and our image is a
                 * two-dimensional array, we must create a one-dimensional index using
                 * two-dimensional image coordinates to retrieve the greyscale value at
                 * those image coordinates.
                 */
                var index = gridX + gridY*width;

                // Grab the svg shape based on the greyscale index
                var svgID = gradientToIndex[index];

                // Make sure the svgID is between 0...numOfSVGs (i.e., the length of the array
                // that holds our svg shapes; otherwise, you'll get a type error in the console)
                if (svgID < numOfSVGs) {
                    // Plot the svg shape at coordinates [gridX, gridY] with a specified scale
                    var svgToPlot = arraySvgs[svgID];
                    ctx2.drawImage(svgToPlot, gridX, gridY, SCL, SCL);
                }
            }
        }

    };

    // DIMENSIONS OF CANVAS

    // const width = window.innerWidth;
    let width = 400;
    // const height = window.innerHeight;
    let height = 400;

    const canvasOriginal = document.getElementById("canvas-original");
    const canvasChanged = document.getElementById("canvas-change");

    // Resize both Canvas elements
    canvasOriginal.width = width;
    canvasOriginal.height = height;

    canvasChanged.width = width;
    canvasChanged.height = height;

    /**
     * This specification defines the 2d context type, whose API is implemented 
     * using the CanvasRenderingContext2D interface.
     * 
     * The CanvasRenderingContext2D interface, part of the Canvas API, provides the 
     * 2D rendering context for the drawing surface of a <canvas> element. It is used 
     * for drawing shapes, text, images, and other objects.
     */

    const ctx1 = canvasOriginal.getContext("2d");
    const ctx2 = canvasChanged.getContext("2d");

    // Display the original image on its own in a separate Canvas

    const imgOriginal = new Image();
    // This string is the path to the image we want to use as a background
    imgOriginal.src = "images/img1.jpg";

    // Display the original background image in the left canvas
    ctx1.drawImage(imgOriginal, 0, 0, width, height);

    /**
     * Load the svg samples/shapes in an array
     */
    let svg1 = new Image();
    let svg2 = new Image();
    let svg3 = new Image();
    let svg4 = new Image();
    let svg5 = new Image();
    let svg6 = new Image();

    svg1.src = "svgs/svg1.svg";
    svg2.src = "svgs/svg2.svg";
    svg3.src = "svgs/svg3.svg";
    svg4.src = "svgs/svg4.svg";
    svg5.src = "svgs/svg5.svg";
    svg6.src = "svgs/svg6.svg";

    // Load all svg shapes in an array so we can index them one by one
    var arraySvgs = [svg1, svg2, svg3, svg4, svg5, svg6];

    // Store the length of the above array in a variable to be used during canvas drawing above
    var numOfSVGs = arraySvgs.length;

    /**
     * OPTIONAL SCALING FACTOR FOR PLOTTING YOUR SVG SHAPES SMALLER / LARGER
     */

    let SCL = 10;

    /**
     * OPTIONAL DEFINE AN IMAGE SCANNING STEP TO INCREASE OR DECREASE THE
     * RASTER RESOLUTION OF YOUR RESULTING IMAGE. THAT IS, HOW DENSE OR HOW
     * SPARSE THE SVG SHAPES ARE PLOTTED ON THE CANVAS. 
     * 
     * EXPERIMENT WITH DIFFERENT INTEGERS AND OBSERVE THE RESULTS.
     * 
     * To Achieve Maximum Resolution, assign scanStep = 1.
     */

    let scanStep = 10;

    /**
     * The following function maps a number that falls between a range [A, B]
     * into a number in a different range [C, D]. This function is also known
     * as a linear map of one range into another.
     * 
     * @param {T} x The number to map, given in the original range [A, B]
     * @param {*} A The first number in the first range
     * @param {*} B The second number in the first range
     * @param {*} C The first number in the second range
     * @param {*} D The second number in the second range
     * @returns A mapping of the number x into the range [C, D]
     */
    function mapRange(x, A, B, C, D) {
        return (x - A) * (D - C) / (B - A) + C;
    }

    // Call the drawScreen() function at the end of the main canvasApp()
    drawScreen();

};

window.addEventListener("load", eventWindowLoaded, false);

function eventWindowLoaded () {
    canvasApp();
};

eventWindowLoaded();
