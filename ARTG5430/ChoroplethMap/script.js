
// make the SVG and viewbox
const svg = d3.select("div#chart").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .style("background-color", "#fff")
    .attr("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight)
    .attr("id", "map-svg")
    .classed("svg-content", true);

let projectionScale = 250;

// define the settings for map projection
const projection = d3.geoOrthographic()
    .translate([window.innerWidth / 2, window.innerHeight / 2])
    // .rotate([-33, -20, 0]) // Africa side
    .scale(projectionScale)
    .center([0, 0]);

// create the geo path generator
let geoPathGenerator = d3.geoPath().projection(projection);

// will be used later for grid lines
const graticule = d3.geoGraticule();

// maps use multiple file types. we can store the "type" of each file along with the URL for easy loading!
var files = [
    { "type": "json", "file": "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson" },
    { "type": "csv", "file": "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv" }
];
var promises = [];

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

function drawMap(geo, data) {
    console.log("GEO: ", geo.features)
    console.log("dataset: ", data)

    var colorScale = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return +d.pop }))
        .range(["white", "#9c1c25"])
        .nice();

    // add grid lines to the globe
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", geoPathGenerator)
        .style("fill", "none");

    // // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(geo.features)
        .join("path")
        .attr("class", 'continent')
        // draw each country
        .attr("d", geoPathGenerator)
        // set the color of each country
        .attr("fill", "white");
}

const sensitivity = 75

var drag = d3.drag().on('drag', function (event) {
    // console.log(event)
    // const rotate = projection.rotate();
    // const k = sensitivity / projection.scale();
    // projection.rotate([
    //     rotate[0] + event.dx * k,
    //     rotate[1] - event.dy * k
    // ])
    // geoPathGenerator = d3.geoPath().projection(projection)
    // svg.selectAll("path").attr("d", geoPathGenerator)
});

svg.call(drag);