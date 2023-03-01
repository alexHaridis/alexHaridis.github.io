
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

    // create a legend group and tranform it to be top left of page
    var legend = svg.append("g")
        .attr("transform", "translate(20,20)");

    // add a title for the legend
    legend.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .text("magnitude")

    // use a for loop to draw a few sample circle sizes for our legend
    // next to each circle, add the corresponding number value
    // we can see what our "max" magnitude is by inspecting the domain of our rScale
    console.log(rScale.domain())
    for (var i = 1; i < 6; i = i + 2) {
        console.log(i)
        legend.append("circle")
            .attr("cx", 20)
            .attr("cy", 2 * (i + 1) + 20)
            .attr("r", rScale((i)))
            .attr("fill", "none")
            .attr("stroke-weight", 0.5)
            .attr("stroke", "gray");

        legend.append("text")
            .attr("x", 44)
            .attr('y', 5 * (i + 1) + 15)
            .attr("font-size", 12)
            .text(i)
    }

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
        .attr("fill", "#eeeeee")


    function updateCircles(dataset, scale = 1) {
        // draw dots for each earthquake
        var circs = g
            .selectAll('circle')
            .data(dataset)
            .join('circle')
            .style("stroke-width", 0.5)
            .style("stroke", "gray")
            .attr("fill-opacity", 0.5)
            .attr("fill", "orange")
            .attr("cx", function (d) {
                console.log(projection([d.longitude, d.latitude]))
                return projection([d.longitude, d.latitude])[0]
            })
            .attr("cy", function (d) { return projection([d.longitude, d.latitude])[1] })
            .attr("r", function (d) {
                return rScale(d.mag) / (scale / 1.2);
            })
            .on('mouseover', function (e, d) {
                d3.select(this)
                    .style("stroke", "black");

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
                d3.select(this)
                    .style("stroke", "gray");

                tooltip.style("visibility", "hidden");
            });
    }

    updateCircles(data);

    // on zoom or pan, we need to scale the map and circles so they stay proportional
    // this block of code will read a user zoom event and then transform the circles and map path
    var zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', function (event) {
            // console.log(event)
            g.attr("transform", "translate(" + event.transform.x + "," + event.transform.y + ")scale(" + event.transform.k + ")");
            // updateCircles(data, event.transform.k)
        });

    // call zoom so it is "listening" for an event on our SVG
    svg.call(zoom);

}