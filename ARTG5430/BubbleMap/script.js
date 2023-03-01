// 1. Grab the dimensions of the open window in the browser.
// Our geographical map will extend throughout the window.

const windowWidth = window.innerWidth, windowHeight = window.innerHeight;

// make the SVG and viewbox
const svg = d3.select("div#chart").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .style("background-color", "#fff")
    .attr("viewBox", "0 0 " + windowWidth + " " + windowHeight)
    .attr("id", "map-svg")
    .classed("svg-content", true);

// define the settings for map projection
const projection = d3.geoEqualEarth()
    .translate([windowWidth / 2, windowHeight / 2])
    .scale(250)
    .center([0, 0]);

// create the geo path generator
let geoPathGenerator = d3.geoPath().projection(projection);

/* 
    ADD TOOLTIP FOR LATER
    The visualization gets too cluttered if we try to add text labels;
    use a tooltip instead
    */
const tooltip = d3.select("#chart")
    .append("div")
    .attr("class", "tooltip");

// will be used later for grid lines
const graticule = d3.geoGraticule();

// great a g element to append all of our objects to
const g = svg.append("g");

// maps use multiple file types. we can store the "type" of each file along with the URL for easy loading!
const files = [
    { "type": "json", "file": "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson" },
    { "type": "csv", "file": "data/all_day.csv" } // dataset of every earthquake on Mar 21, 2022 from here: https://earthquake.usgs.gov/earthquakes/feed/v1.0/csv.php
];
let promises = [];

// for each file type, add the corresponding d3 load function to our promises
files.forEach(function (d) {
    if (d.type == "json") {
        promises.push(d3.json(d.file));
    } else {
        promises.push(d3.csv(d.file));
    }
});

// when our data has been loaded, call the draw map function
Promise.all(promises).then(function (values) {
    drawMap(values[0], values[1])
});

/*
ALL THE MAP STUFF HAPPENS HERE AND IT DEPENDS ON DATA BEING LOADED
*/
function drawMap(geo, data) {

    // our function has two parameters, both of which should be data objects
    console.log('GEO: ', geo)
    console.log('dataset: ', data)

    // we want to scale the size of each bubble based on an attribute of the data
    var rScale = d3.scaleSqrt()
        .domain(d3.extent(data, function (d) { return +d.mag }))
        .range([0.1, 20]);

    // Draw the map
    var basemap = g
        .selectAll("path")
        .data(geo.features)
        .enter()
        .append("path")
        // draw each country
        .attr("d", geoPathGenerator)
        .attr("country", function (d) { return d.id })
        // set the styling of each country, and other attributes
        .attr("class", 'continent')
        .attr("vector-effect", "non-scaling-stroke") // this is an SVG attribute

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
    var zoom = d3.zoom()
        .translateExtent([[0,0], [windowWidth, windowHeight]])
        .scaleExtent([1, 8])
        .on("zoom", function(e){
            g.attr("transform", e.transform);
            // Alternatively, you may represent the event's transformation using the
            // individual components of the transformation: translation and scale.
            // g.attr("transform", "translate(" + e.transform.x + "," + e.transform.y + ")scale(" + e.transform.k + ")");
        })

    // call zoom so it is "listening" for an event on our SVG
    svg.call(zoom);

}