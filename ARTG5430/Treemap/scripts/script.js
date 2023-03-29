// Define the dimensions of the space that will contain the hierarhy
const width = 840;
const height = 440;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("data/films.json").then(function(results){
    // Once the data is loaded, everything happens inside the createHierarchy() function
    createTreemap(results);
});

//

function createTreemap(data) {

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

    var treeMapLayout = d3.treemap()
        .size([width, height])
        .paddingOuter(25);

    treeMapLayout(root);

    /**
     *  The following lines of code handle VISUALIZATION-SPECIFIC methods.
     */

    var nodes = svg.append("g")
        .selectAll("g")
	    .data(root.descendants())
        .join("g")
	    .attr('transform', function(d) {return 'translate(' + [d.x0, d.y0] + ')'});

    nodes
        .append('rect')
        .attr('width', function(d) { return d.x1 - d.x0; })
        .attr('height', function(d) { return d.y1 - d.y0; })

    nodes
        .append('text')
        .attr('dx', 6)
        .attr('dy', 18)
        .style("text-anchor", "start")
        .style("font-size", "14px")
        .text(function(d) {
            return d.data[0];
        })

}
