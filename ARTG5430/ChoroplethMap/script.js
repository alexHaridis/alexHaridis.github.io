
// make the SVG and viewbox
const svg = d3.select("div#chart")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .style("background-color", "#fff")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight)

let projectionScale = 300;

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

/**
 * Loading Data
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

Promise.all(promises).then(function(results){
    drawMap(results[0], results[1]);
})

function drawMap(geo, data) {
    // console.log("GEO: ", geo.features)
    // console.log("dataset: ", data)

    var colorScale = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return +d.pop }))
        .range(["white", "#9c1c25"])
        .nice(); // rounds the domain into "nice" round values

    // add grid lines to the globe
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", geoPathGenerator)
        .style("fill", "none");

    // // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(geo.features) // polygons
        .join("path")
        .attr("class", 'continent')
        // draw each country
        .attr("d", geoPathGenerator)
        // set the color of each country
        .attr("fill", function (d) {
            // console.log(d);

            // data is the CSV file
            // But d refers to GeoJSON data points, features=polygons
            let country = data.find(el => el.code == d.id);

            if (country == undefined) {
                console.log("no match: ", d.properties.name);
                return colorScale(0);
            } else {
                // console.log("match: ", d.properties);
                d.properties.pop = +country.pop;
                // console.log("match: ", d.properties);
                return colorScale(+country.pop);
            }
        })
        .on('mouseover', function (e, d) {
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

const sensitivity = 100;

function dragged(event) {

    const rotate = projection.rotate(); 
    console.log(projection.rotate());
    
    const k = sensitivity / projection.scale();

    projection.rotate([
        rotate[0] + event.dx*k,
        rotate[1] - event.dy*k
    ]);
    
    geoPathGenerator = d3.geoPath().projection(projection);
    svg.selectAll("path").attr("d", geoPathGenerator);

}

const zoom = d3.zoom().on('zoom', function (event) {
    // console.log(event)
    projection.scale(projectionScale * event.transform.k)
    geoPathGenerator = d3.geoPath().projection(projection)
    svg.selectAll("path").attr("d", geoPathGenerator)
})

var drag = d3.drag().on('drag', dragged);

svg.call(drag);
svg.call(zoom);