// Define the dimensions of the space that will contain the hierarhy
const width = 700;
const height = 380;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("data/films.json").then(function(results){
    // Once the data is loaded, everything happens inside the createHierarchy() function
    createHierarchy(results);
});

//

function createHierarchy(data) {

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

    let treeLayout = d3.tree()
        .size([width, height - 40]);

    treeLayout(root);

    /**
     *  The following lines of code handle VISUALIZATION-SPECIFIC methods.
     */

    // Append and Draw Links between Nodes
    svg.append("g")
        .selectAll('line')
        .data(root.links())
        .join('line')
        // Coordinates of start of line
        .attr('x1', function(d) {return d.source.x;})
        .attr('y1', function(d) {return d.source.y;})
        .style("stroke-width", 6)
        // Coordinates of end of line
        .attr('x2', function(d) {return d.target.x;})
        .attr('y2', function(d) {return d.target.y;});

    // Visualize the Nodes in the Hierarchy as circles
    svg.append("g")
        .selectAll('circle')
        .data(root.descendants())
        .join('circle')
        .attr('cx', function(d) {return d.x;})
        .attr('cy', function(d) {return d.y;})
        .attr('r', 8);

    // Draw Labels for Each Node/Circle
    svg.append("g")
        .selectAll('text.label')
        .data(root.descendants())
        .join('text')
        .classed('label', true)
        .attr('x', function(d) {return d.x;})
        .attr('y', function(d) {return d.y - 15;})
        .style("font-family", "Saira")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(function(d) {
            return d.data[0];
        });

    // Leaf count labels
    svg.append("g")
        .selectAll('text.count-label')
        .data(root.descendants())
        .join('text')
        .classed('count-label', true)
        .attr('x', function(d) {return d.x;})
        .attr('y', function(d) {return d.y + 24;})
        .style("font-family", "Saira")
        .style("font-size", "14px")
        .text(function(d) {
            if (d.height > 0) return '';
            return d.data[1];
        });

    // This is only for translating all "g" group elements downwards.
    // Experiment with the values to observe how the tree layout is positioned
    // within the allocated space given by the width and height variables.

    d3.selectAll("g")
        .attr("transform", `translate(0, 15)`);

}
