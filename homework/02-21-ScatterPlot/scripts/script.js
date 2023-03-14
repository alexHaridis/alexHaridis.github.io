/*

    ARTG5330 Visualization Technologies 1
    February 21, 2023
    Spring Semester
    Week 7

    Optional Study: Creating a Scatter Plort

    - What is the "./data/gapminder.csv" inside of the parentheses 
    for d3.csv() referring to?

    It is referring to a dataset given in csv filetype provided by
    Gapminder that is stored locally inside the folder called "data".
    You need to provide the exact local path to that csv file to
    fetch it with the d3.csv() method.

    - The parameter named `data` inside of the function expression .then()

    The parameter named `data` binds to the csv file
    you fetch with the d3.csv method. Thus, it refers
    to the gapminder.csv file.

    - What kind of JavaScript data structure is `data`?

    An array of objects.

    - Where does the entire d3.csv().then() pattern
        open and close in this document?

    Use the VSCode interface to locate the opening
    and closing of the d3.csv().then() pattern.

    You may find it useful to examine the contents
    of `data` with console.log(data).

*/

d3.csv("./data/gapminder.csv").then(function(data) {

    /*
    1. DEFINE DIMENSIONS OF SVG + CREATE SVG CANVAS

        - What is document.querySelector("#chart") doing?

        The document.querySelector() method is returning the
        FIRST element within your html document that matches the
        specified CSS selector string, i.e., the ID "#chart". 
        See here for more info on CSS selectors: 
        https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors

        - `clientWidth` and `clientHeight` are properties of
            elements in the DOM (Document Object Model).
            What do these properties measure?

        These properties measure the inner width and inner height
        of an HTML element in pixels. In this example, they are 
        measuring the width and height of the div element in the html page
        that encapsulates the chart. Note that these values are calculated
        according to how the chart is displayed in the browser. Thus, the 
        values will change if you resize your browser's window. You can
        test this behavior using console.log() prints.

        Note: document.clientWidth is different from window.innerWidth
        The d
    */

    const width = document.querySelector("#chart").clientWidth;
    const height = document.querySelector("#chart").clientHeight;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);


    /* 
    2. FILTER THE DATA 
    
    This data set is large and includes data from multiple years.

    Let's filter the data to only select data for the United States,
    and then subsequently use those data to draw the bar chart.

    To filter the data, we can use the .filter() method for arrays.

    `.filter()` is a JavaScript array method.
    - What does this method do/how does this method work?
        (What do we get back from using this method?)
    - Inside the parentheses for .filter(), there is
        a function expression with a parameter
        named `d`. What is `d` a reference to?

    The .filter() method returns a new array of objects
    that is a SUBSET of the array of objects stored in `data`. 
    The purpose of the method is to filter out rows of the original
    dataset that do not satisfy a specific "test". This test is
    given here inside the custom function, and it is in the form of an exact 
    equality (===) between two strings (see below). 

    The parameter named `d` is a reference to the rows
    of the input CSV file.
    
    - Does that parameter *have to be* named `d`?
        Can it be named something else?

    No. You can use a different symbol.
    
    - What is the purpose of the statement inside
        the function expression? What is this doing?

        return d.year === '2007';

    As you access each row of the csv file using the
    `d` paramater, you retrieve the value d.year for
    each row and test if it is (strictly) equal to the
    provided string, `2007`. The row passes the
    test if it is, otherwise it is ignored.

    - Why are we storing the result of data.filter(...)
        inside a variable (filtered_data)?

    We are storing the result in a new variable called
    filtered_data because we want to keep the filtered data
    separate from the original data we have stored in `data`.
    Also, we want to reuse the filtered_data in multiple
    locations in the code (see below).

    */

    let filtered_data = data.filter(function(d) {
        return d.year === '2007';
    });


    /*
    3. DETERMINE MIN AND MAX VALUES OF VARIABLES

    In the following section, we'll use the methods d3.min() and d3.max()
    to calculate minimum and maximum values of the variables in our data set.

    Note that to keep things clean, we're organizing the minimum and maximum
    values inside of objects, and storing those min/max values in properties
    named inside those objects. This helps make it easier to refer to these
    values later in our code.

        - What does d3.min() do? What does d3.max() do?
            What are the 2 arguments we supply to d3.min()/d3.max()?

        The functions d3.min() and d3.max() return the minimum and
        maximum numerical values stored in an array. Here, the first
        argument is the filtered dataset we created just above and the
        second argument is an ACCESSOR function. The purpose of this
        function is to specify which exact column in the dataset
        contains the numerical values we are interested in. So, `d`
        refers to the rows of the filtered dataset, and the function
        accesses each row and returns specifically the value for the
        variable `lifeExp`. Thus, min and max here are the minimum
        and maximum numerical values in the column for `lifeExp`.
        Note, we also coerce the strings into numbers to make this work.
        Remember that d3.csv() loads the data in the form of strings.
        To work with numbers represented as strings, you must explicitly
        cast them back into numbers.

        - In the second argument for both d3.min() and d3.max(),
            the function expression has a parameter named `d`.
            What is `d` a reference to?

        See above answer.

        - Why is there a plus sign (+) in front of d.gdpPercap,
            d.lifeExp, and d.pop?

        See above answer.

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

        - What does d3.scaleLinear() do?

        A: The .scaleLinear() function in D3 is a JavaScript function that
        accepts an input and returns an output such that the input and output
        are linearly correlated: it establishes a LINEAR MAP between values
        given in one domain, to values given in another domain. For purposes
        of visualization, this function is very common because it helps transform
        data values to visual variables such as position, length, or color. In order
        to use this function properly, you must specify a domain and a range.

        Please refer to these nice explanations/tutorials: 
            https://medium.com/@mbostock/introducing-d3-scale-61980c51545f
            https://jckr.github.io/blog/2011/08/11/d3-scales-and-color/

        - What does d3.scaleSqrt() do?

        This function creates a square-root based scale by transforming a given
        domain so that values in that domain are proportional to their square root.
        If a value `x` is 4 times bigger than value `a`, then the result is only
        multiplied by 2 the square root of 4. 

        See this demonstration: https://observablehq.com/@d3/continuous-scales#scale_sqrt

        - What does d3.scaleOrdinal() do?

        This function maps two finite sets made up of
        discrete "things" in a one-by-one fashion. It takes
        categorical domain consisting of continent names and
        maps them into color values.

        See this demonstration: https://observablehq.com/@d3/d3-scaleordinal

        - For each scale below, what does the domain
            represent, and what does the range represent?

        xScale: The domain is a range consisting of the minimum
        and maximum values in the column called gdp per capita and 
        the range is the width of the chart in pixels. 

        yScale: The domain is a range starting from 0 and extending
        until the maximum value in the column lifeExp. The range is
        the height of the chart in pixels. 

        rScale: The domain is a range consisting of the minimum
        and maximum values in the column called pop. The range
        is a continuous domain of values, from 1 to 15.

        fillScale: The domain and range are discrete sets. The domain
        consists of continent names and the range color values associated
        with them. 

        - For each scale below, how many values are in
            the domain and range?

        xScale: The domain and range are uncountable.
        yScale: The domain and range are uncountable.
        rScale: The domain and range are uncountable.
        fillScale: The domain and range are finite sets, each one
        consisting of five values.

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
        - What is the purpose of the "g" element being appended?

        The "g" element creates a new DOM element that is appended
        to an svg container. This element will contain the axes for
        our visualization.

        - What is the purpose of the "transform" attribute being defined?

        It "pushes" upwards the position of the horizontal axis by
        calculating the difference between `height` and `margin.bottom`.
        It is essentially a method of positioning the axis element.

        - What do the d3.axisBottom() and d3.axisLeft() methods do?

        The .axisBottom() is a built-in D3 function that draws a bottom
        horizontal axis and the .axisLeft() is a built-in D3 function that
        draws a left vertical axis. D3 axes are made of lines, ticks, and
        labels.

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
        - What is the purpose of the pattern svg.selectAll().data().enter().append()?

        This is a standard pattern for joining data with D3. 
        The purpose of this pattern is to JOIN data with DOM elements, 
        such as SVG basic shapes (e.g., rect). The pattern starts with
        .selectALl() that selects all the currently existing shapes and
        binds them with the provided dataset using .data(). Then,
        you use .enter() to check what ADDITIONAL shapes you must
        create/append to complete the binding. For example, if you
        have NO SHAPES of the type "rect" in the beginning, then
        .enter().append("rect") will append as many rectangles as
        needed to bind all the data points in your dataset. If you have
        1 "rect" and 3 data points, then it will append 2 missing
        "rect" shapes to complete the binding. Essentially, .enter()
        tells you which data points are missing a corresponding DOM
        element.

        - Each attribute defined below is defined using things called
            "accessor functions." In each accessor function, what is
            the parameter named `d` a reference to?

        A row in the CSV dataset.

        - Inside each accessor function, what is the purpose of
            each "return ___;" statement?

        To return a value that can be associated with the given variable. 
        You need an accessor function in order to go through all the available
        data points.

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
    7. DRAW AXIS LABELS

    The chunks of code below draw text labels for the axes.

    - Examine the yAxisLabel. What is going on with the 
    "transform", "x", and "y" attributes, in terms of
    how their values are computed to control the rotated
    placement of the label?

    For `yAxisLabel`, the tricky point is understanding how
    the coordinate system works. Here, the negative `x` value controls
    how the axis label moves from TOP TO BOTTOM. The positive `y` value
    controls how it moves from LEFT TO RIGHT.

    The `transform` attribute controls the rotation of the axis label
    by taking as the origin the top left point of the screen. Note,
    a rotation by -90 is a clockwise rotation.

    As before, to understand how all of this works use the console.log()
    print method to test each of the computations separately.

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

});
