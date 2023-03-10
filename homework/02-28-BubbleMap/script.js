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

// We will use this constructor below to draw graticule over our map
const graticule = d3.geoGraticule();

/**
 * 2. Preliminary Initializations and Settings for:
 *          Tooltip, Projection function, Geo Path generator
 */

// The tooltip is initialized as usual.
const tooltip = d3.select("#chart")
                .append("div")
                .attr("class", "tooltip");

/**
 * Define the settings for the projection function.
 * 
 * In this demonstration, we use the geoEqualEarth() method. This projection
 * is called the "Equal Earth Map Projection". Here is an academic paper
 * that explains this form of projection in more detail: 
 * https://www.researchgate.net/publication/326879978_The_Equal_Earth_map_projection
 * 
 * As illustrated in class, to understand what .translate(), .scale(), and .center() do
 * try inputing different values and observe the behavior of the map visualization.
 */

const projection = d3.geoEqualEarth()
                .translate([windowWidth / 2, windowHeight / 2])
                .scale(250)
                .center([0, 0]);

// Create the Geo Path generator
let geoPathGenerator = d3.geoPath().projection(projection);

/**
 *  3. Loading Data
 * 
 *  Here, we load data of two different types as well as sources.
 *  The first dataset is the World GeoJSON file that we fetch from the online
 *  D3 gallery. The second is a CSV file and it is a dataset of every earthquake
 *  reported on March 21, 2022. The source is here:
 *              https://earthquake.usgs.gov/earthquakes/feed/v1.0/csv.php
 * 
 *  The CSV file is stored locally inside the `data` folder.
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
 * 4. The following function accepts two datasets, the first a GeoJSON file
 * and the second a CSV file.
 * 
 * The function implements:
 * (1) Drawing of polygons 
 * (2) Drawing of circles representing locations on the map
 * (3) Tooltip functionality over the circles
 * (4) Drawing of graticule (see this: https://desktop.arcgis.com/en/arcmap/10.7/map/page-layouts/what-are-grids-and-graticules-.htm)
 * (5) Zoom and Pan behaviour
 * 
 * @param {*} geo A GeoJSON data type storing geographical information
 * @param {*} data A CSV file representing an array of JavaScript objects
 */

function drawMap(geo, data) {

    // Print the results from loading `geo` and `data`. Both should be data types
    // console.log('GEO: ', geo);
    // console.log('dataset: ', data);

    // Draw the Polygons of the GeoJSON file using the Geo Path generator
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

    // We want to scale the size of each circle based on an attribute of the data.
    // Here, the attribute is the magnitude of the earthquake which we retrieve
    // from the CSV file using the "mag" variable/column.

    var rScale = d3.scaleSqrt()
        .domain(d3.extent(data, function (d) { return +d.mag }))
        .range([0.1, 20]);

    // This is a scale factor multiplied by the result of computing rScale.
    // See below and experiemnt with this value to see the behaviour of the sizes.
    var scale = 1.5;

    // This is the usual D3 join pattern for joining circle elements with data entries
    // Note, the circles are joined with the datapoitns in the CSV file.
    g.selectAll('circle')
        .data(data)
        .join('circle')
        .style("stroke-width", 0.5)
        .style("stroke", "gray")
        .attr("fill-opacity", 0.5)
        .attr("fill", "orange")
        .attr("cx", function (d) {
            // Use this print to understand what [0] and [1] entries are doing.
            // console.log(projection([d.longitude, d.latitude]))
            return projection([d.longitude, d.latitude])[0];
        })
        .attr("cy", function (d) { 
            return projection([d.longitude, d.latitude])[1];
        })
        .attr("r", function (d) {
            // Change the `scale` parameter to increase/decrease radius
            return rScale(d.mag)*scale;
        })// Tooltip implementation
        .on('mouseover', function (e, d) {
            d3.select(this).style("stroke", "black");
            tooltip.style("visibility", "visible");
        })
        .on('mousemove', function (e, d) {
            let x = e.offsetX;
            let y = e.offsetY;
            
            tooltip.style("left", x + 20 + "px")
                .style("top", y + "px")
                .html(d.place + "</br>" + d.mag);
        })
        .on('mouseout', function () {
            d3.select(this).style("stroke", "gray");

            tooltip.style("visibility", "hidden");
        });

    // The following two groups of code handle the drawing of the  graticule 
    // grid lines on the map and the outline of those maps.
    // The geoPathGenerator function is used here as well since it is just
    // a SVG Path constructor and we can take advatange of it everytime we want
    // to draw paths on the map.
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
    
    /**
     * The most involved part of implementing the zoom behaviour is how you
     * handle the resizing of the circles as you zoom in or zoom out. You do this
     * by scaling "down" the radious of the circles according to the current
     * event's transformation parameter for scale. 
     * 
     * In general, a "transformation" in the context of computer graphics is
     * represented with matrices. The "k" parameter means "uniform scale" and it is 
     * the diagonal of the matrix representing  e.transform. For more information,
     * see here: https://github.com/d3/d3-zoom#zoom-transforms
     * 
     * If you want to know more about transformations in computer graphics, see:
     * https://en.wikipedia.org/wiki/Transformation_matrix#Affine_transformations
     * 
     * @param {*} e An Event object.
     */
    function zoomed(e){
        // Alternatively, you may represent the event's transformation using the
        // individual components of the transformation: translation and scale.
        // g.attr("transform", "translate(" + e.transform.x + "," + e.transform.y + ")scale(" + e.transform.k + ")");
        g.attr("transform", e.transform);
        // You may comment out the following lines if you don't want to resize
        // your circles/bubbles as you zoom in and out of the map.
        // One reason why we do this resizing is to avoid the overlap of the circles in
        // our visualization, e.g., in California, where we had many earthquakes on that day.
        g.selectAll("circle")
            .attr("r", function(d){
                return (rScale(d.mag)*scale)/e.transform.k;
            });
    }

    var zoom = d3.zoom()
        .translateExtent([[0,0], [windowWidth, windowHeight]])
        .scaleExtent([1, 15])
        .on("zoom", zoomed);

    // Call zoom so it is "listening" for an event on our SVG
    svg.call(zoom);

}