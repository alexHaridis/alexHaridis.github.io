/*

ARTG5330 Visualization Technologies 1
    February 21, 2023
    Spring Semester
    Week 9

    TOOLTIP implementation.
    Re: Based on the Gapminder dataset used on 02-21 to create a scatterplot
            "Life Expectancy over GDP per capita over, Year 2007"
*/

/*
    1. DEFINE DIMENSIONS OF SVG + CREATE SVG CANVAS
*/

const width = document.querySelector("#chart").clientWidth;
const height = document.querySelector("#chart").clientHeight;

const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

/* 
    ADDING A TOOLTIP
        
    We begin by creating a new div element inside the #chart container, 
    giving it class 'tooltip'; note that this newly created div inherits 
    (receives) the CSS properties defined by the .tooltip { ... } rule 
    in the stylesheet.

    This tooltip variable is used later in the code to implement the actual tooltip.
*/

const tooltip = d3.select("#chart")
    .append("div")
    .attr("class", "tooltip");


// Load the Gapminder dataset
// REMINDER: d3.csv(), and all other data loading methods in D3 v7, return a "promise" object not a dataset/

// Put the d3.csv() method inside an array because the static method Promise.all() below
// requires an "iterable" object as input argument.
let promise = [d3.csv("./data/gapminder.csv")];

/**
 * When all the data have been loaded, we call the function that draws the scatterplot
 * 
 * Experiment with console.log() to see how d3.csv load files.
 * Promises have three states: pending, fulfilled, and rejected
 * What you want is to have all primises being fulfilled before you move forward
 * with working with the data you loaded.
 * 
 * Promise.all() is a static method that waits for all promises to be fullfilled.
 * 
 * For more information on JavaScript promises, see:
 *      https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */

Promise.all(promise).then(function(results){
    // So you need to specify [0], so the functions works with the dataset not an array
    drawScatterPlot(results[0]);
})

function drawScatterPlot(data) {

    /* 
    2. FILTER THE DATA 
    */

    let filtered_data = data.filter(function(d) {
        return d.year === '2007';
    });

    /*
    3. DETERMINE MIN AND MAX VALUES OF VARIABLES
    */

    const gdpPercap = {
        min: d3.min(filtered_data, function(d) { return +d.gdpPercap; }),
        max: d3.max(filtered_data, function(d) { return +d.gdpPercap; })
    };

    const lifeExp = {
        min: d3.min(filtered_data, function(d) { return +d.lifeExp; }),
        max: d3.max(filtered_data, function(d) { return +d.lifeExp; })
    };

    const pop = {
        min: d3.min(filtered_data, function(d) { return +d.pop; }),
        max: d3.max(filtered_data, function(d) { return +d.pop; })
    };

    /*
    4. CREATE SCALES

    We'll use the computed min and max values to create scales for
    our scatter plot.
    */

    const margin = {top: 50, left: 100, right: 50, bottom: 100};

    const xScale = d3.scaleLinear()
        .domain([gdpPercap.min, gdpPercap.max])
        .range([margin.left, width-margin.right]);

    const yScale = d3.scaleLinear()
        .domain([0, lifeExp.max])
        .range([height-margin.bottom, margin.top]);

    const rScale = d3.scaleSqrt()
        .domain([pop.min, pop.max])
        .range([1, 15]);

    const fillScale = d3.scaleOrdinal()
        .domain(["Asia", "Europe", "Africa", "Americas", "Oceania"])
        .range(['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e']);


    /*
    5. DRAW AXES
    
    The following chunks of code draw 2 axes -- an x- an y-axis.
    */

    const xAxis = svg.append("g")
        .attr("class","axis")
        .attr("transform", `translate(0,${height-margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    const yAxis = svg.append("g")
        .attr("class","axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));
    
    /*
        6. DRAW POINTS

        In this scatter plot, each circle will represent a single country;
        the horizontal position of the circle will represent GDP per capita,
        vertical position will represent life expectancy, color will represent
        continent, and radius will represent population

        The following chunk of code is the standard D3 data join pattern.
    */

    const points = svg.selectAll("circle")
        .data(filtered_data)
        .enter()
        .append("circle")
            .attr("cx", function(d) { 
                return xScale(d.gdpPercap); 
            })
            .attr("cy", function(d) { return yScale(d.lifeExp); })
            .attr("r", function(d) { return rScale(d.pop); })
            .attr("fill", function(d) { return fillScale(d.continent); });

    /*
    7. DRAW AXIS LABELS

    The chunks of code below draw text labels for the axes.
    */

    const xAxisLabel = svg.append("text")
        .attr("class","axisLabel")
        .attr("x", width/2)
        .attr("y", height-margin.bottom/2)
        .text("GDP per Capita");

    const yAxisLabel = svg.append("text")
        .attr("class","axisLabel")
        .attr("transform","rotate(-90)")
        .attr("x",-height/2)
        .attr("y",margin.left/2)
        .text("Life Expectancy (Years)");

    const otherText = svg.append("text")
        .attr("class", "chartText")
        .attr("x", width/2)
        .attr("y", margin.top)
        .text("Year 2007");

    /*
        BRUSH Interactivity Implementation
    */

    const brush = d3.brush()
        // Can be shortened to .on('start brush end', brushed)
        // D3's .on() requires multiple events to be separated with spaces.
        .on("start", brushed)
        .on("brush", brushed)
        .on("end", brushed);
    
    // Like all event listeners, this one receive the "event" as the first parameter. 
    // As a custom event, however, it has some non-standard properties with the underlying 
    // input event stored in `event.sourceEvent. See https://github.com/d3/d3-brush#brush-events for more.
    function brushed(event) {
        // [[x0, y0], [x1, y1]] for 2D brushes; [x0, x1] or [y0, y1] for 1D brushes
        const coords = event.selection;
        if (coords) {
            const [[x0, y0], [x1, y1]] = coords;
            const brushedData = data.map(d => {
                return {
                    ...d, 
                    selected: x0 <= xScale(d.gdpPercap) && xScale(d.gdpPercap) < x1 && y0 <= yScale(d.lifeExp)
                    && yScale(d.lifeExp) < y1
                };
            });
            // wrappedDataJoin(brushedData);
        }
    }

    // function wrappedDataJoin(data = data) {
         
    // }
}
