/**
 * BEGIN BY DEFINING THE DIMENSIONS OF THE SVG and CREATING THE SVG CANVAS
 * In this case, the visualization will cover the full client width and height
 * 
 * BOSTON CRIME DATA from the BOSTON POLICE DEPARTMENT, 2018
    Adapted from:
    https://www.kaggle.com/ankkur13/boston-crime-data/
*/

const width = document.querySelector("#chart").clientWidth;
const height = document.querySelector("#chart").clientHeight;

let svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

d3.csv("data/2018-boston-crimes.csv").then(function(results){
    // Once the data is loaded, everything happens inside the createTreemap() function
    createTreemap(results);
});

//

function createTreemap (data) {

    /*
    TRANSFORM THE DATA
    We want to eventually create a treemap that shows the relative proportion of each offense code group
    for the top 10 (by frequency) offense code groups in 2018.
    We can use the function d3.nest() to count the number of incidents of each unique offense code group:
    */

    let groups = d3.rollup(data, function(d) { return d.length; },
                                 function(d) { return d.OFFENSE_CODE_GROUP; },
                                 function(d) { return d.DAY_OF_WEEK; }
    );

    //
    
    /**
     * Custom sorting functions. 
     * 
     * We sort a Map based on the sum of the values for each object it contains.
     */
    function sumValues(object) {
        var sum = 0;
        object.forEach(function(assaultFreq){
            sum += assaultFreq;
        })
        return sum;
    }

    function sortFunction(a, b) {
        // This sorts in descending order. Swap 1 with -1 for an ascending order.
        return (sumValues(a[1]) < sumValues(b[1])) ? 1 : -1;
    }
    //

    /**
     * The following line of code contains several computations.
     * 
     * First, we create a new JavaScript Map using the groups we computed
     * just above (here we use the spread (...) operator). We then define
     * a custom sorting function called <sortFunction> which is going to 
     * access each object in the Map and compute the sum of the frequencies
     * for each offense code group. We sort all the entries of the new map
     * in descending order using this sum.
     * 
     * And, after sorting the map from largest to smallest, we use the 
     * array.slice() method to grab only the first 10 entries.
     */
    let sortedGroups = new Map([...groups.entries()]
                                .sort(sortFunction)
                                .slice(0, 10)
    );
    
    /*
    CREATE A COLOR SCALE
    The D3 module d3-scale-chromatic features several different color palettes we can use.
    How do these differ in their usage?
    What kinds of color palettes are best for these data?
    */
    var color = d3.scaleOrdinal(d3.schemeDark2);
    // var color = d3.scaleOrdinal(d3.schemeBlues[5]);
    // var color = d3.scaleOrdinal(d3.schemeSpectral[9]);

    /*
    CREATE THE TREEMAP LAYOUT GENERATOR
    */
    
    var treemap = d3.treemap()
        .size([width, height])
        .padding(1);
    
    /*
    CREATE THE HIERARCHY
    We need to use d3.hierarchy() to turn our data set into a 'hierarchical' data structure;
    d3.treemap() REQUIRES a hierarchical structure to generate the treemap layout
    */  

    let root = d3.hierarchy(sortedGroups);

    root.sum(function(d) {
        return d[1];
    });

    treemap(root);

    /*
    DRAW THE RECTANGLES FOR THE TREEMAP
    We will use our `root` structure, from above, to draw the rectangles for the treemap;
    we will do this by performing a data join with the array of nodes returned by root.leaves()
    (What does this return? Inspect the structure in the JS console)
    */


    /*
    VARIATION:
    What if we use the multi-level nesting from above to generate our treemap?
    How would we color the rectangles according to their parent category
    (i.e., each day of week rectangle is colored according to the offense code category 
    to which it belongs)?
    */
    var rect = svg
        .selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
            .attr("x", function (d) { return d.x0; })
            .attr("y", function (d) { return d.y0; })
            .attr("width", function (d) { return d.x1 - d.x0; })
            .attr("height", function (d) { return d.y1 - d.y0; })
            .attr("stroke", "#FFFFFF")
            .attr("fill", function(d) {
                return color(d.parent.data[0]);
            });

    /*
    ADD LABELS
    */

    svg.selectAll("text")
      .data(root.descendants())
      .enter()
      .append("text")
        .attr("x", function(d){ return d.x0 + 10})    // +10 to adjust position (more right)
        .attr("y", function(d){ return d.y0 + 20})    // +20 to adjust position (lower)
        .attr("font-size", "15px")
        .attr("fill", "white")
        .text(function(d){ 
            return d.children === undefined ? d.data[0] : '';
        });

    /**
     * ADD TOOLTIP
     */
    var tooltip = d3.select("#chart")
        .append("div")
        .attr("class","tooltip");

    /**
     * NOTE: In D3 v7 you need to specify the callback function
     * with two arguments: event, d. The first argument grabs the
     * actual mouse event occuring once you hover over a circle, the
     * second argument <d> is an actual datapoint from the hierarchical
     * structure you created above.
     */
    rect.on("mouseover", function(event, d) {

        // Retrieve position based on the positions
        // generated by the treemap layout --
        // the same x0 and y0 properties used to compute
        // the rectangles above.
        console.log(d);
        var x = d.x0;
        var y = d.y0 + 50;

        tooltip.style("visibility","visible")
            .style("left", x + "px")
            .style("top", y + "px")
            // The texts to display are accessed just like in all other
            // demonstrations we saw.
            .html(d.parent.data[0] + "</br>" + d.data[0]);

        d3.select(this)
            .attr("stroke","#000000");

    }).on("mouseout", function() {
        // hide the tooltip
        tooltip.style("visibility","hidden");
        // revert everything back to their default colors
        d3.select(this)
            .attr("stroke","white");

    });
}
