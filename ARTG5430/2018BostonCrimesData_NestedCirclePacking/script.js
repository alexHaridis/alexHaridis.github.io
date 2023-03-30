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
    // Once the data is loaded, everything happens inside the createCirclePacking() function
    createCirclePacking(results);
});

//

function createCirclePacking (data) {

    /*
    TRANSFORM THE DATA
    We want to eventually create a circle packing visualization that shows the relative proportion of each offense code group
    for the top 10 (by frequency) offense code groups in 2018.
    We can use the function d3.nest() to count the number of incidents of each unique offense code group:
    */

    /*
    VARIATION:
    How does our treemap change if we have a multi-level nesting?
    */

    let groups = d3.rollup(data, function(d) { return d.length; },
                                 function(d) { return d.OFFENSE_CODE_GROUP; },
                                 function(d) { return d.DAY_OF_WEEK; }
                                //  function(d) { return d.Rating; }
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
    // var color = d3.scaleOrdinal(d3.schemeDark2);
    var color = d3.scaleOrdinal(d3.schemeBlues[5]);
    // var color = d3.scaleOrdinal(d3.schemeSpectral[9]);

    
    /*
    CREATE THE PACK LAYOUT GENERATOR
    */
    
    var pack = d3.pack()
        .size([width,height])
        .padding(15);

    /*
    CREATE THE HIERARCHY
    We need to use d3.hierarchy() to turn our data set into a 'hierarchical' data structure;
    d3.pack() REQUIRES a hierarchical structure to generate the packing layout
    */  

    // var hierarchy = d3.hierarchy({values: nested}, function(d) { return d.values; })
    //                   .sum(function(d) { return d.value; });

    let root = d3.hierarchy(sortedGroups);

    root.sum(function(d) {
        return d[1];
    });

    pack(root);

    /* 
    GENERATE THE ROOT HIERARCHY
    By passing in our hierarchical data structure into our pack() function,
    we generate the geometries required to create the circle packing layout in the SVG canvas
    */
    // var root = pack(hierarchy);

    /*
    DRAW THE CIRCLES FOR THE TREEMAP
    We will use our `root` structure, from above, to draw the circles for the treemap;
    we will do this by performing a data join with the array of nodes returned by root.descendants()
    (What does this return? Inspect the structure in the JS console)
    Notice how we're actually creating 'g' elements through our data join, to position the circles
    that we afterwards append to the 'g' elements
    */
    var circle = svg.selectAll("g")
        .data(root.descendants())
        .enter()
        .append("g")
            .attr("transform", function(d) {
                return `translate(${d.x},${d.y})`;
            });

    /*
    VARIATION:
    What if we want to color the circles according to their depth in the hierarchy?
    (i.e., color according to how far down they are nested in the hierarchy?)
    */
    circle.append("circle")
        .attr("r", function(d) { return d.r; })
        .attr("fill-opacity", 0.5)
        .attr("stroke","#FFFFFF")
        .attr("stroke-width",3)
        .attr("fill", function(d) { 
            return color(d.depth);
        });

    /*
    ADD LABELS
    We can append an SVG 'text' element to each of the 'g' elements created above,
    to create labels for each circle. But the visualization gets too cluttered, so
    we can display labels by a using a tooltip instead. See below. 
    */

    // circle.append("text")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("text-anchor","middle")
    //     .attr("fill","black")
    //     .attr("font-size","14pt")
    //     .text(function(d) { 
    //         return d.data[0]; 
    //     });

    /**
     * ADD TOOLTIP
     */

    const tooltip = d3.select("#chart")
        .append("div")
        .attr("class","tooltip");

    /**
     * NOTE: In D3 v7 you need to specify the callback function
     * with two arguments: event, d. The first argument grabs the
     * actual mouse event occuring once you hover over a circle, the
     * second argument <d> is an actual datapoint from the hierarchical
     * structure you created above.
     */
    circle.on("mouseover", function(event, d) {

        var cx = d.x;
        var cy = d.y + 40;

        // Display the tooltip
        tooltip.style("visibility","visible")
            .style("left", cx + "px")
            .style("top", cy + "px")
            // The text to display is accessed just like in all other
            // demonstrations we saw.
            .text(d.data[0]);

        // Change the stroke of selected circle
        d3.select(this)
        .select("circle")
        .attr("stroke","#F6C900");

    }).on("mouseout", function() {

        // hide the tooltip
        tooltip.style("visibility","hidden");
        // revert back to original stroke
        d3.select(this)
        .select("circle")
        .attr("stroke","white");

    });

}
