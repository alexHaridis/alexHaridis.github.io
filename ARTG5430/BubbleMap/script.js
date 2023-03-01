// 1. Grab the dimensions of the open window in the browser.
// Our geographical map will extend throughout the window.
// Store the svg canvas element (see html) associated with the #chart,
// and define its viewport parameters.

const windowWidth = window.innerWidth, windowHeight = window.innerHeight;

const svg = d3.select("div#chart")
            .append("svg")
            .attr("width", windowWidth)
            .attr("height", windowHeight)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .style("background-color", "#fff");

// We will use this constructor below to draw graticule over our map
const graticule = d3.geoGraticule();

// Create a group `g` HTML element to append all of our objects to.
const g = svg.append("g");

/* 
    ADD TOOLTIP FOR LATER
*/
const tooltip = d3.select("#chart")
    .append("div")
    .attr("class", "tooltip");

// Define the settings for map projection
const projection = d3.geoEqualEarth()
    .translate([windowWidth / 2, windowHeight / 2])
    .scale(250)
    .center([0, 0]);

// Create the Geo Path generator
let geoPathGenerator = d3.geoPath().projection(projection);

/**
 * Loading Data
 */

let promises = [];

promises.push(d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"));
promises.push(d3.csv("data/all_day.csv"));

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

Promise.all(promises).then(function(results){
    drawMap(results[0], results[1]);
})

/**
 * The following function accepts two datasets and draws a geographical map.
 * Includes:
 * (1) Drawing of polygons 
 * (2) Drawing of circles representing locations on the map
 * (3) Tooltip functionality on the circles
 * (4) Drawing of graticule
 * (5) Zoom and Pan behaviour
 * 
 * @param {*} geo A GeoJSON data type storing geographical information
 * @param {*} data A CSV file representing an array of JavaScript objects
 */
function drawMap(geo, data) {

    // Print the results from loading `geo` and `data`. Both should be data types
    // console.log('GEO: ', geo);
    // console.log('dataset: ', data);

    // we want to scale the size of each bubble based on an attribute of the data
    var rScale = d3.scaleSqrt()
        .domain(d3.extent(data, function (d) { return +d.mag }))
        .range([0.1, 20]);

    // Draw the map
    g.selectAll("path")
        .data(geo.features)
        .enter()
        .append("path")
        // draw each country
        .attr("d", geoPathGenerator)
        .attr("country", function (d) { return d.id; })
        // set the styling of each country, and other attributes
        .attr("class", 'continent')
        .attr("vector-effect", "non-scaling-stroke"); // this is an SVG attribute

    // Draw Circles representing Earthquakes
    var scale = 1.5;

    g.selectAll('circle')
        .data(data)
        .join('circle')
        .style("stroke-width", 0.5)
        .style("stroke", "gray")
        .attr("fill-opacity", 0.5)
        .attr("fill", "orange")
        .attr("cx", function (d) {
            // console.log(projection([d.longitude, d.latitude]))
            return projection([d.longitude, d.latitude])[0];
        })
        .attr("cy", function (d) { 
            return projection([d.longitude, d.latitude])[1];
        })
        .attr("r", function (d) {
            // Change the `scale` parameter to increase/decrease radius
            return rScale(d.mag)*scale;
        })// Tooltip
        .on('mouseover', function (e, d) {
            // TO DO
        })
        .on('mousemove', function (e, d) {
            // TO DO
        })
        .on('mouseout', function () {
            // TO DO
        });

    // Draw the graticule grid line on the map
    d3.select("g").append("path")
        .datum(graticule)
        .attr("d", geoPathGenerator)
        .attr("fill", "none")
        .attr("stroke", "lightgray")
        .attr("stroke-width", "0.5px");
    
    d3.select("g").append("path")
        .datum(graticule.outline)
        .attr("d", geoPathGenerator)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "1px");
    
    // create a zoom function
    var zoom = d3.zoom();

    // call zoom so it is "listening" for an event on our SVG
    svg.call(zoom);

}