
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
    // .rotate([90, -20, 0]) // Mexico side
    // .rotate([-33, -20, 0]) // Africa side
    // .rotate([-121, -20, 0]) // Eastern side
    .scale(projectionScale)
    .center([0, 0]);

// create the geo path generator
let geoPathGenerator = d3.geoPath().projection(projection);

// will be used later for grid lines
const graticule = d3.geoGraticule();

// Organize all the files you are about to load
var files = [
    { "type": "json", "file": "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson" },
    { "type": "csv", "file": "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv" }
];

var promises = [];

files.forEach(function (d) {
    if (d.type == "json") {
        promises.push(d3.json(d.file));
    } else {
        promises.push(d3.csv(d.file));
    }
});

Promise.all(promises).then(function (values) {
    // console.log(values)
    drawMap(values[0], values[1])
});

function drawMap(geo, data) {
    // console.log("GEO: ", geo.features)
    // console.log("dataset: ", data)

    var colorScale = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return +d.pop }))
        .range(["white", "#9c1c25"])
        .nice();

    // console.log("BINS: ", colorScale.domain())

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

    // add grid lines
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", geoPathGenerator)
        .style("fill", "none");

    // console.log(geo.features)

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(geo.features)
        .join("path")
        .attr("class", 'continent')
        // draw each country
        .attr("d", geoPathGenerator)
        .attr("country", function (d) { return d.id })
        // set the color of each country
        .attr("fill", function (d) {
            let country = data.find(el => el.code == d.id);

            if (country == undefined) {
                console.log("no match: ", d.properties.name)
                return colorScale(0)
            } else {
                console.log("match: ", d.properties.name)
                d.properties.pop = +country.pop;
                return colorScale(+country.pop);
            }
        })
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
        });;
}

const sensitivity = 75

var drag = d3.drag().on('drag', function (event) {
    // console.log(event)
    const rotate = projection.rotate()
    const k = sensitivity / projection.scale()
    projection.rotate([
        rotate[0] + event.dx * k,
        rotate[1] - event.dy * k
    ])
    geoPathGenerator = d3.geoPath().projection(projection)
    svg.selectAll("path").attr("d", geoPathGenerator)
})

const zoom = d3.zoom().on('zoom', function (event) {
    // console.log(event)
    projection.scale(projectionScale * event.transform.k)
    geoPathGenerator = d3.geoPath().projection(projection)
    svg.selectAll("path").attr("d", geoPathGenerator)
})

svg.call(drag)
svg.call(zoom)