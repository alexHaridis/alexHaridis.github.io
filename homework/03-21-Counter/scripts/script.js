// Size of the width variable
const width = document.querySelector("#cntr").clientWidth;

// Limit of Count
const LIMIT = 10;

const counter = [1];

const svg = d3.select("#cntr")
    .append("svg")
    .attr("width", width)
    .attr("height", 40);

function dataJoin(data) {

    // Plot `data` to see what the join pattern binds
    //          console.log(data);

    // Visualization specification.
    // Notice in the following that opacity and label are now data-driven

    const g = svg.selectAll("g")
        .data(data)
        .join("g")
            .attr("transform", "translate(" + width/2 + ", 20)")
            // Multiply opacity by 0.1, so that after 10 'clicks' you reach 1.0 opacity (i.e., 100%)
            .style("opacity", function(d) { return d * 0.1 } );
    
    const circle = g.append("circle")
        .attr("r", 20)
        .style("fill", "steelblue"); 
    
    const label = g.append("text")
        .style("fill", "white")
        .style("font", "bold 1.2em sans-serif")
        .style("text-anchor", "middle")
        .attr("dy", "0.3em")
        // The text to display is simply the number of the datum inside the
        // `counter` array. This is JavaScript convention for anonymous functions.
        .text((d, i) => d);
    
    // Event callbacks.
    // Notice in the following that they are much simpler now as they don't
    // change a visualization's appearance directly.

    g.on("click", function(event, d) {
        // This is increasing the content of array by one
        counter[0] = Math.min(++d, LIMIT);
        return dataJoin(counter);
    });

    g.on("dblclick", function(event, d) {
        // Resetin counter array to 1
        counter[0] = 1;
        return dataJoin(counter);
    });

}

// This is calling a function
dataJoin(counter);




// const g = svg.append("g")
//     .attr("transform", "translate(" + width/2 + ", 20)")
//     .style("opacity", 0.5)
//     // Store the counter's state on a DOM node attribute.
//     .attr("counter", 1); 

// Attach an event listener to the <g> that is called when any element within it is clicked.
// This function is passed the input event and, like other d3 selection functions, the current `datum`.

// g.on("click", function(event, d) {
//     const count = Math.min(+g.attr("counter") + 1, LIMIT); 
//     label.text(count);
//     g.style("opacity", count * 0.1)
//       .attr("counter", count)
// });

// g.on("dblclick", function(event, d) {
//     g.style("opacity", 0.1)
//       .attr("counter", 1);
//     label.text(1);
// });