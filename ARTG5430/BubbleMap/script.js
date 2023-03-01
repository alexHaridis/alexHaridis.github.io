
// make the SVG and viewbox
const svg = d3.select("div#chart").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .style("background-color", "#fff")
    .attr("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight)
    .attr("id", "map-svg")
    .classed("svg-content", true);

// define the settings for map projection
const projection = d3.geoEqualEarth()
    .translate([window.innerWidth / 2, window.innerHeight / 2])
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
        .attr("class", 'continent')
        // draw each country
        .attr("d", geoPathGenerator)
        .attr("country", function (d) { return d.id })
        // set the color of each country
        .attr("fill", "#eeeeee")

    // create a zoom function
    var zoom = d3.zoom()
        .scaleExtent([1, 8])

    // call zoom so it is "listening" for an event on our SVG
    svg.call(zoom);

}