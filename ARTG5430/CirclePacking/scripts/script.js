// Define the dimensions of the space that will contain the hierarhy
const width = 600;
const height = 600;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("data/films.json").then(function(results){
    // Once the data is loaded, everything happens inside the createHierarchy() function
    createCirclePack(results);
});

//

function createCirclePack(data) {

    /**
     *  The following lines of code handle the ABSTRACT DATA STRUCTURE
     *  of a hierarchy. No visualization-specific methods are used.
     */

    let groups = d3.rollup(data, function(d) { return d.length; },
                                 function(d) { return d.Distributor; },
                                 function(d) { return d.Genre; }
                                //  function(d) { return d.Rating; }
    );

    let root = d3.hierarchy(groups);

    root.sum(function(d) {
        return d[1];
    });

    var circlePackLayout = d3.pack()
        .size([width, height])

    circlePackLayout(root);

    /**
     *  The following lines of code handle VISUALIZATION-SPECIFIC methods.
     */

    var nodes = svg.append("g")
        .selectAll("g")
	    .data(root.descendants())
        .join("g")
	    .attr("transform", function(d) {return "translate(" + [d.x, d.y] + ")"});

    nodes
        .append("circle")
        .attr("r", function(d){ return d.r; });

    nodes
        .append('text')
        .attr('dx', -10)
        .attr('dy', 4)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text(function(d) {
            return d.children === undefined ? d.data[0] : '';
        })

    nodes
        .append('text')
        .attr('dx', -50)
        .attr('dy', -100)
        .style("text-anchor", "start")
        .style("font-size", "14px")
        .text(function(d) {
            return d.children !== undefined ? d.data[0] : '';
        })

}
