// Grab the svg canvas with ID #chart
const svg = d3.select("#chart");

const width = svg.attr("width"), 
      height = svg.attr("height"), 
      radius = 200;

// Create a group `g` HTML element to append all of our objects to.
// Position the chart in the middle of the SVG canvas.
let g = svg.append("g")
           .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Define the data for the chart's pie (arc) shapes       
let data = [{name: "Alex", share: 20.70}, 
            {name: "Shelly", share: 30.92},
            {name: "Clark", share: 15.42},
            {name: "Matt", share: 13.65},
            {name: "Jolene", share: 19.31}];

// Create a scale for matching data points with distinct colors

const ordScale = d3.scaleOrdinal()
                   .domain(data)
                   .range(['#ffd384','#94ebcd','#fbaccc','#d3e0ea','#fa7f72']);

// Use the d3.pie() method
// Specifies how to extract a value from the associated data 
// (e.g. sets the accessor function for the pie layout to use)
// See more:
//      https://d3-wiki.readthedocs.io/zh_CN/master/Pie-Layout/

let pie = d3.pie()
            .value(function(d) { 
                return d.share; 
            });

// D3 join pattern method for creating distinct arcs for every datapoint

let arc = g.selectAll("arc")
           .data(pie(data))
           .enter();

// This uses the .arc() method that returns an arc path generator
//      http://using-d3js.com/05_07_arcs_pie_charts.html

let arcGen = d3.arc()
           .outerRadius(radius)
           .innerRadius(0);

arc.append("path")
   .attr("d", arcGen)
   .attr("fill", function(d) {
        return ordScale(d.data.name);
    });

// This creates labels for the pie chart and positions them
// at the centroid of each generated arc path. The centroid
// is retrieved with the built in method called .centroid()
// You pass in "d" which accesses the paths you have generated.

arc.append("text")
   .text(function(d) {
      return d.data.name; 
   })
   .attr("transform", function(d){
      return "translate(" + arcGen.centroid(d) + ")";
   })
   .style("font-family", "arial")
   .style("font-size", 15);