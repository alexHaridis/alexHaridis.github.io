const width = window.innerWidth;
const height = window.innerHeight;

let svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

const g = svg.append("g");

d3.json("data/usa.json").then(function(results){
    renderGeoJSON(results);
});

//

function renderGeoJSON(data) {

    var geoJSON = topojson.feature(data, data.objects.states);

    const projection = d3.geoMercator()
            .fitSize([width, height], geoJSON)
            .translate([width / 2, height / 2])
            .scale(250);

    // Create the Geo Path generator
    let geoPathGenerator = d3.geoPath().projection(projection);

    g.selectAll("path")
    .data(geoJSON.features)
    .enter()
    .append("path")
        // we use the "d" attribute in SVG graphics to define a path to be drawn
        // "d" is a presentation attribute, so can also be used as a CSS property
        .attr("d", geoPathGenerator)
        .attr("fill", "#FCEDDA")
        .attr("vector-effect", "non-scaling-stroke")
        .attr("stroke", "black")
        .attr("stroke-width", "1px");

}