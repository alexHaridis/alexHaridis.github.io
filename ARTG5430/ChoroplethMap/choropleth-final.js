// 1. Initialize SVG Canvas and group `g` element

// Grab the dimensions of the open window in the browser.
// Our geographical map will extend throughout the window.

const windowWidth = window.innerWidth, windowHeight = window.innerHeight;

// Store the svg canvas element (see html) associated with the #chart,
// and define its viewport parameters.
const svg = d3.select("div#chart")
            .append("svg")
            .attr("width", windowWidth)
            .attr("height", windowHeight)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .style("background-color", "#fff");

// Create a group `g` HTML element to append all of our objects to.
const g = svg.append("g");

/**
 * 2. Preliminary Initializations and Settings for:
 *       Projection function, Geo Path generator, Graticule
 */

/**
 * Define the settings for the projection function.
 * 
 * In this demonstration, we use the geoOrthographic() method. This projection
 * is called the "Orthographic Projection" and it is a perspective (azimuthal) 
 * orthographic projection.  It “depicts a hemisphere of the globe as it appears 
 * from outer space, where the horizon is a great circle.” See this link for
 * general perspective projection: https://observablehq.com/@d3/satellite
 * and an animated world tour: https://observablehq.com/@d3/world-tour
 * 
 * The following article explains orthographic projection in more detail: 
 * https://en.wikipedia.org/wiki/Orthographic_map_projection
 * 
 * As illustrated in class, to understand what projectionScale, .translate(), .scale(), 
 * and .center() do try using different values and observe the behavior on the map visualization.
 */

let projectionScale = 250;

// define the settings for map projection
const projection = d3.geoOrthographic()
    .translate([window.innerWidth / 2, window.innerHeight / 2])
    // .rotate([90, -20, 0]) // Mexico side
    // .rotate([-33, -20, 0]) // Africa side
    // .rotate([-121, -20, 0]) // Eastern side
    .scale(projectionScale)
    .center([0, 0]);

// Create the Geo Path generator
let geoPathGenerator = d3.geoPath().projection(projection);

// We will use this constructor below to draw graticule over our map
const graticule = d3.geoGraticule();

/**
 *  3. Loading Data
 * 
 *  Here, we load data of two different types both of which are fetched from online sources.
 *  The first dataset is the World GeoJSON file that we fetch from the online
 *  D3 gallery. The second is a CSV file and it is a simple tabular dataset of all countries
 *  with their ISO code and population.
 *  The CSV file's first line has the following names:
 *      "name", "code", "pop"
 */

let promises = [];

promises.push(d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"));
promises.push(d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv"));

/**
 * When all the data have been loaded, we call the function that draws a map in terms of them.
 * Experiment with console.log() to see how d3.json and d3.csv load files.
 * Promises have three states: pending, fulfilled, and rejected
 * What you want is to have all primises being fulfilled before you move forward
 * with working with the data you loaded.
 * 
 * Promise.all() is a static method that waits for all promises to be fullfilled.
 * 
 * For more information on JavaScript promises, see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */

Promise.all(promises).then(function (values) {
    // console.log(values)
    drawMap(values[0], values[1])
});

/**
 * 4. The following function accepts two datasets, the first a GeoJSON file
 * and the second a CSV file.
 * 
 * The function implements:
 * (1) Color scale for achieving the chloropleth effect
 * (2) Drawing of a Legend that encodes the color's intensity in relation to a data parameter (i.e., population)
 * (3) Drawing of the GeoJSON polygons
 * (4) Tooltip functionality over the polygons, where each polygon's boundary is highlighted
 * (5) Drawing of graticule (see this: https://desktop.arcgis.com/en/arcmap/10.7/map/page-layouts/what-are-grids-and-graticules-.htm)
 * (6) Zoom and Pan behaviour
 * (7) A Drag behaviour, which is common when we want to rotate geometries with our mouse movement
 * 
 * @param {*} geo A GeoJSON data type storing geographical information
 * @param {*} data A CSV file representing an array of JavaScript objects
 */
function drawMap(geo, data) {
    // console.log("GEO: ", geo.features)
    // console.log("dataset: ", data)

    // We want to color the polygons based on the population of the country
    // they represent. In the CSV dataset, we have a column for population
    // given by "pop". The d3.extent() function in D3 is used to create a 
    // domain with the minimum and maximum values of an array of numbers. Here, these
    // numbers are the populations of countries given in the CSV file. 
    // Once this domain is created, we map it into a new range of color values.
    // Here, the color values start from white to dark red.
    //
    // See, this D3 description of scales for the meaning of .nice():
    //              https://www.d3indepth.com/scales/
    var colorScale = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return +d.pop }))
        .range(["white", "#9c1c25"])
        .nice();

    // console.log("BINS: ", colorScale.domain())

    // The following groups of code create a legend in the upper left corner.
    // The drawing of the legend utilizes the colorScale function defined above.

    // translation is with respect to [0, 0], top-left point of browser
    var legend = svg.append("g")
                .attr("transform", "translate(100,100)");

    legend.append("rect")
        .attr("width", 20)
        .attr("height", 100)
        .attr("stroke-weight", 0.5)
        .attr("stroke", "gray")
        .attr("fill", "white");

    legend.append("text")
        .attr('x', 40)
        .attr('y', 10)
        .text(colorScale.domain()[1])

    legend.append("text")
        .attr('x', 40)
        .attr('y', 90)
        .text(colorScale.domain()[0])

    // draw legend
    for (var i = 1; i < 6; i++) {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", (i * 20) - 20)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", function () {
                return colorScale(colorScale.domain()[1] / i);
            })
    }

    // The following two groups of code handle the drawing of the  graticule 
    // grid lines on the map and the outline of those maps.
    // The geoPathGenerator function is used here as well, since it is just
    // an SVG Path constructor and we can take advantange of it everytime we want
    // to draw paths on the map. Unlike in the BubbleMap demonstration, here we
    // don't create a separate outline for graticule lines.
    svg.append("path")
        .datum(graticule)
        .attr("d", geoPathGenerator)
        .attr("fill", "none")
        .attr("stroke", "lightgrey")
        .attr("stroke-width", "0.5px");

    // console.log(geo.features)

    // Draw the Polygons of the GeoJSON file using the Geo Path generator
    g.selectAll("path")
        .data(geo.features)
        .join("path")
        .attr("class", 'continent')
        // draw each country
        .attr("d", geoPathGenerator)
        .attr("country", function (d) { return d.id })
        // set the color of each country
        .attr("fill", function (d) {
            /**
             * In this demonstration, we are coloring polygons of countries
             * by making a linear map between the population of the country
             * and a color scale. To chose for each polygon with the right color, 
             * we need to somehow associate a polygon's id with a country's ISO code.
             * The "id" of a polygon and the country's code and population are given
             * in different files: the former is in the GeoJSON file and the latter in
             * the CSV file. So, to achieve what we want we initialize a country variable
             * and check inside the CSV data file whether we can find a polygon's id.
             * Note, a country's "code" and a polygon's "id have to match in order to
             * color that polygon. If we have a match, we retrieve that country's population
             * from the CSV file, pass it into the colorScale function to compute a color value,
             * and assign that color value to the polygon.
             * 
             * Here, "d" parameter refers to a feature entry in the GeoJSOn file, namely, a polygon.
             */
            let country = data.find(el => el.code == d.id);

            if (country == undefined) {
                console.log("no match: ", d.properties.name)
                return colorScale(0)
            } else {
                console.log("match: ", d.properties.name)
                d.properties.pop = +country.pop;
                return colorScale(+country.pop);
            }
        }) // Tooltip over polygons
        .on('mouseover', function (e, d) {
            // console.log(d.properties)
            d3.select(this)
                .transition()
                .duration(200)
                .style("stroke", "black")
        })
        .on('mouseout', function (d) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("stroke", "#d0d0d0")
        });
}

/**
 * The following implementation of the dragging effect is 
 * rather involved. It requires an understanding of how 3D geometry
 * is projected on a flat screen and how by the 2D movement of your
 * mouse or keypad (left/right) you can achieve the dragging effect 
 * for a 3D object that's being projected in your viewport.
 * 
 * Note, the code below follows principles for implementing the 
 * dragging effect that are common in all computer graphics applications.
 * It is not specific to JavaScript or D3.
 * 
 * Some libraries encapsulate all these details inside built-in methods
 * that a user can use in a project without really going inside the 
 * details. One such example is JavaScript p5 library. The method that
 * implements this dragging effect is orbitControl():
 *          https://p5js.org/reference/#/p5/orbitControl
 */
const sensitivity = 75

var drag = d3.drag().on('drag', function (event) {
    // console.log(event)
    const rotate = projection.rotate()
    const k = sensitivity / projection.scale()
    projection.rotate([
        rotate[0] + event.dx * k,
        rotate[1] - event.dy * k
    ])
    // You compute again the "paths" since you have dragged the geometry
    // and you have to recompute where/how the lines are drawn
    geoPathGenerator = d3.geoPath().projection(projection)
    svg.selectAll("path").attr("d", geoPathGenerator)
})

function zoomed(e) {
    // console.log(event)
    // This is similar to what we did in the bubble map
    // projectionScale is defined above where we initialize the projection
    projection.scale(projectionScale * e.transform.k);
    // You compute again the "paths" since you have zoomed in / out
    // and you have to recompute where/how the lines are drawn
    geoPathGenerator = d3.geoPath().projection(projection);
    svg.selectAll("path").attr("d", geoPathGenerator);
}

const zoom = d3.zoom()
    .on('zoom', zoomed);

// Call zoom and drag so they are "listening" for an event on our SVG
svg.call(drag)
svg.call(zoom)