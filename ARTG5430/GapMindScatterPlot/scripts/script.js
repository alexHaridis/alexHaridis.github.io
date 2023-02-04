/*
QUESTION 1:

Examine the d3.csv().then() pattern below
and discuss the following questions:
    - What is the "./data/gapminder.csv" inside of
        inside of the parentheses for d3.csv()
        referring to?
    - What is the parameter named `data` inside of
        the function expression within .then()
        referring to?
    - What kind of JS data structure is `data`?
    - Where does the entire d3.csv().then() pattern
        open and close in this document?

    You may find it useful to examine the contents
    of `data` with console.log(data)

*/

d3.csv("./data/gapminder.csv").then(function(data) {

    /*
    DEFINE DIMENSIONS OF SVG + CREATE SVG CANVAS

    QUESTION 2:
        - What is document.querySelector("#chart") doing?
        - `clientWidth` and `clientHeight` are properties of
            elements in the DOM (Document Object Model).
            What do these properties measure?
    */
    const width = document.querySelector("#chart").clientWidth;
    const height = document.querySelector("#chart").clientHeight;
    const margin = {top: 50, left: 100, right: 50, bottom: 100};

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);


    /* FILTER THE DATA 
    
    This data set is large and includes data from multiple years.

    Let's filter the data to only select data for the year 2007,
    and then subsequently use that year's data to draw the scatter plot.

    To filter the data, we can use the .filter() method for arrays.

    QUESTION 3:

    `.filter()` is a JavaScript array method.
    - What does this method do/how does this method work?
        (What do we get back from using this method?)
    - Inside the parentheses for .filter(), there is
        a function expression with a parameter
        named `d`. What is `d` a reference to?
    - Does that parameter *have to be* named `d`?
        Can it be named something else?
    - What is the purpose of the statement inside
        the function expression? What is this doing?

        return d.year === '2007';

    - Why are we storing the result of data.filter(...)
        inside a variable (filtered_data)?

    */

    let filtered_data = data.filter(function(d) {
        return d.year === '2007';
    });


    /*
    DETERMINE MIN AND MAX VALUES OF VARIABLES

    In the following section, we'll use the methods d3.min() and d3.max()
    to calculate minimum and maximum values of the variables in our data set.

    Note that to keep things clean, we're organizing the minimum and maximum
    values inside of objects, and storing those min/max values in properties
    named inside those objects. This helps make it easier to refer to these
    values later in our code.


    QUESTION 4:
        - What does d3.min() do? What does d3.max() do?
            What are the 2 arguments we supply to d3.min()/d3.max()?
        - In the second argument for both d3.min() and d3.max(),
            the function expression has a parameter named `d`.
            What is `d` a reference to?
        - Why is there a plus sign (+) in front of d.gdpPercap,
            d.lifeExp, and d.pop?

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
    CREATE SCALES

    We'll use the computed min and max values to create scales for
    our scatter plot.

    QUESTION 5:
        - What does d3.scaleLinear() do?
        - What does d3.scaleSqrt() do?
        - What does d3.scaleOrdinal() do?
        - For each scale below, what does the domain
            represent, and what does the range represent?
        - For each scale below, how many values are in
            the domain and range?


    */

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
    DRAW AXES

    QUESTION 6:
    
    The following chunks of code draw 2 axes -- an x- an y-axis.
        - What is the purpose of the "g" element being appended?
        - What is the purpose of the "transform" attribute being defined?
        - What do the d3.axisBottom() and d3.axisLeft() methods do?

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
    DRAW POINTS

    In this scatter plot, each circle will represent a single country;
    the horizontal position of the circle will represent GDP per capita,
    vertical position will represent life expectancy, color will represent
    continent, and radius will represent population

    QUESTION 7:

    The following chunk of code is the standard D3 data join pattern.
        - What is the purpose of the pattern svg.selectAll().data().enter().append()?
        - Each attribute defined below is defined using things called
            "accessor functions." In each accessor function, what is
            the parameter named `d` a reference to?
        - Inside each accessor function, what is the purpose of
            each "return ___;" statement?

    */
    const points = svg.selectAll("circle")
        .data(filtered_data)
        .enter()
        .append("circle")
            .attr("cx", function(d) { return xScale(d.gdpPercap); })
            .attr("cy", function(d) { return yScale(d.lifeExp); })
            .attr("r", function(d) { return rScale(d.pop); })
            .attr("fill", function(d) { return fillScale(d.continent); });
    
    /*
    DRAW AXIS LABELS

    QUESTION 8:

    The chunks of code below draw text labels for the axes.

    Examine the yAxisLabel. What is going on with the 
    "transform", "x", and "y" attributes, in terms of
    how their values are computed to control the rotated
    placement of the label?

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

    /* 
        ADDING A TOOLTIP
        
        We begin by creating a new div element inside the #chart container, 
        giving it class 'tooltip'; note that this newly created div inherits 
        (receives) the CSS properties defined by the .tooltip { ... } rule 
        in the stylesheet
    */

    const tooltip = d3.select("#chart")
        .append("div")
        .attr("class", "tooltip");
    
    /*
        When we hover over any of the circles in the SVG, update the 
        tooltip position and text contents;
        
        note that `points` here is a reference to the variable named 
        `points` above (what is in that selection?)
    */


    points.on("mouseover", function(e, d) {

        // Update style and position of the tooltip div;
        // what are the `+` symbols doing?

        // You may increase/decrease the relative position 
        // of the tooltip by adding small +- values (e.g., +20, -10). 
        // Note, the tooltip's origin is its top-left point.

        let x = +d3.select(this).attr("cx");
        let y = +d3.select(this).attr("cy");

        // Format the display of the numbers,
        // using d3.format()
        // See: https://github.com/d3/d3-format/blob/v3.1.0/README.md#format

        let displayValue = d3.format(",")(d.pop);
        
        // Make the tooltip visible when mouse "enters" a point
        tooltip.style("visibility", "visible")
            .style("top", `${y}px`)
            .style("left", `${x}px`)
            .html(`<p><b>${d.country}</b><br><em>${d.continent}</em><br>#: ${displayValue}</p>`);

        // Optionally, visually highlight the selected circle
        points.attr("opacity", 0.1);
        d3.select(this).attr("opacity", 1).raise();

    }).on("mouseout", function() {

        // Make the tooltip invisible when mouse "leaves" a point
        tooltip.style("visibility", "hidden");

        // Reset the circles' appearance back to original
        points.attr("opacity", 1);

    });

    /* 
    ADDING LEGENDS

    When creating visualizations with D3, we don't automatically
    get legends for encodings like color and size. We have to
    make these ourselves by understanding the different categories
    we want to explain and the colors or other features in terms of
    which they are classified!

    Making a legend with D3 and SVG requires a mixture of
    plain JavaScript, drawing basic SVG shapes, and some
    customization with CSS. The following demonstration is
    one example of one approach to adding legends
    for encodings in a visualization.

    */


    /* 
    We start by adding a new SVG canvas to the page;
    notice that this is being inserted in a <div> element
    with ID "legend", and the size and position of this
    <div> on the page is being controlled by the CSS
    */

    const legendWidth = document.querySelector("#legend").clientWidth;
    const legendHeight = 150;
    const legendMargin = 20;
    const legendSpacing = 100;

    const colorLegend = d3.select("#legend")
        .append("svg")
        .attr("height", legendHeight)
        .attr("width", legendWidth);

    //Optionally:
    // Visualize the outline of the SVG canvas with a rectangle

    // colorLegend.append("rect")
    //     .attr("width", legendWidth)
    //     .attr("height", legendHeight)
    //     .attr("stroke", "black")
    //     .attr("fill", "white");

    /*
        Next, we iterate over each of the values for which
        we want to display a legend, using ARRAY.forEach().

        Here, we'll create a color legend that shows what
        category each color represents, i.e., what continent.

        So, we'll iterate over each of the values in
        the array named `continents`

        Note: Here, we are manually specifying our categories.
        We were able to perform an exploratory analysis of this
        data set and figure out the distinct continents. However,
        it is important to have an automated method of extracting
        unique categories from a dataset and one such method is
        given below.
    */

    const continents = ["Asia", "Europe", "Africa", "Americas", "Oceania"];

    continents.forEach(function(continent, i) {

        /*

        Within each loop of the .forEach(), we will
            - Draw a circle on the new legend SVG canvas,
                giving it the corresponding fill color
                for the category being drawn and spacing
                it vertically from the previously-drawn
                circle in the legend
            - Draw a text element that will serve as
                the label for each color in the legend

        */
        colorLegend.append("circle")
            .attr("cx", 30+legendMargin + i*legendSpacing)
            .attr("cy", legendMargin)
            .attr("r", 10)
            .attr("fill", fillScale(continent));

        colorLegend.append("text")
            .attr("class", "legend--label")
            .attr("x", 30+legendMargin + i*legendSpacing)
            .attr("y", legendMargin + 25)
            .text(continent);
    });

    // GETTING UNIQUE VALUES FOR A CATEGORICAL VARIABLE

    // In the code above, and in previous demonstrations,
    // we've manually created an array to hold the unique
    // values of `continent` in the data set.

    // But you may recall that there is a JS array method
    // that can help with this task: ARRAY.map().

    // We might try to do this:

    const allCategories = data.map(function(d) {

        return d.continent;

    });

    console.log(allCategories);

    // And expect to see an array of:
    // "Asia", "Europe", "Africa", "Americas", "Oceania"

    // But in reality, we'll see these values duplicated multiple
    // times -- because ARRAY.map() is simply returning the value of
    // `continent` for each row in the data set, and multiple countries
    // have the same value of `continent`.

    // Here is a method to do it that uses a data structure called "Set",
    // and then spreads the values into a flat array.
    // (Why do we use Set?)

    // Spread operator: 
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax

    const uniqueCategories = [...new Set(allCategories)];

    console.log(uniqueCategories);

});
