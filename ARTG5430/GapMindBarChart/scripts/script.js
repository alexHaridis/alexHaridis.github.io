/*
QUESTION 1:

Examine the d3.csv().then() pattern below
and discuss the following questions:
    - What is the "./data/gapminder.csv"
        inside of the parentheses for d3.csv()
        referring to?

    A: It is referring to a dataset given in csv filetype provided by
    Gapminder that is stored locally inside the folder called "data".
    You need to provide the exact local path to that csv file to
    fetch it with the d3.csv() method.

    - What is the parameter named `data` inside of
        the function expression within .then()
        referring to?

    A: The parameter named `data` binds to the csv file
    you fetch with the d3.csv method. Thus, it refers
    to the gapminder.csv file.

    - What kind of JS data structure is `data`?

    A: An array of objects.

    - Where does the entire d3.csv().then() pattern
        open and close in this document?

    A: Use the VSCode interface to locate the opening
    and closing of the d3.csv().then() pattern.

    You may find it useful to examine the contents
    of `data` with console.log(data)

*/

d3.csv("./data/gapminder.csv").then(function(data) {

    /*
    DEFINE DIMENSIONS OF SVG + CREATE SVG CANVAS

    QUESTION 2:
        - What is document.querySelector("#chart") doing?

        A: The document.querySelector() method is returning the
        FIRST element within your html document that matches the
        specified CSS selector string, i.e., the ID "#chart". 
        See here for more info on CSS selectors: 
        https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors

        - `clientWidth` and `clientHeight` are properties of
            elements in the DOM (Document Object Model).
            What do these properties measure?

        A: These properties measure the inner width and inner height
        of an HTML element in pixels. In this example, they are 
        measuring the width and height of the div element in the html page
        that encapsulates the chart. Note that these values are calculated
        according to how the chart is displayed in the browser. Thus, the 
        values will change if you resize your browser's window. You can
        test this behavior using console.log() prints.
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

    Let's filter the data to only select data for the United States,
    and then subsequently use those data to draw the bar chart.

    To filter the data, we can use the .filter() method for arrays.

    QUESTION 3:

    `.filter()` is a JavaScript array method.
    - What does this method do/how does this method work?
        (What do we get back from using this method?)
    - Inside the parentheses for .filter(), there is
        a function expression with a parameter
        named `d`. What is `d` a reference to?

    A: The .filter() method returns a new array of objects
    that is a SUBSET of the array of objects stored in `data`. 
    The purpose of the method is to filter out rows of the original
    dataset that do not satisfy a specific "test". This test is
    given here inside the custom function, and it is in the form of an exact 
    equality (===) between two strings (see below). 

    The parameter named `d` is a reference to the rows
    of the input CSV file.
    
    - Does that parameter *have to be* named `d`?
        Can it be named something else?

    A: No. You can use a different symbol.
    
    - What is the purpose of the statement inside
        the function expression? What is this doing?

        return d.country === 'United States';

    A: As you access each row of the csv file using the
    `d` paramater, you retrieve the value d.country for
    each row and test if it is (strictly) equal to the
    provided string, `United States`. The row passes the
    test if it is, otherwise it is ignored.
    
    A: 

    - Why are we storing the result of data.filter(...)
        inside a variable (filtered_data)?

    A: We are storing the result in a new variable called
    filtered_data because we want to keep the filtered data
    separate from the original data we have stored in `data`.
    Also, we want to reuse the filtered_data in multiple
    locations in the code (see below).

    */

    let filtered_data = data.filter(function(d) {
        return d.country === 'United States';
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

        A: The functions d3.min() and d3.max() return the minimum and
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

        A: See above answer.

        - Why is there a plus sign (+) in front of d.lifeExp?

        A: See above answer.

    */

    const lifeExp = {
        min: d3.min(filtered_data, function(d) { return +d.lifeExp; }),
        max: d3.max(filtered_data, function(d) { return +d.lifeExp; })
    };

    /*
    CREATE SCALES

    We'll use the computed min and max values to create scales for
    our scatter plot.

    QUESTION 5:
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

        - What does d3.scaleBand() do?

        A: It constructs a band scale. This function is deployed for charts like the one
        we use in this demonstration that consists of ordinal or categorical variables,
        i.e., a fixed set of years. The horizontal axis must be somehow mapped into our 
        screen's range, which is made up of pixels. Thus, we provide a domain in which
        our years are sorted in ascending order and the range is the chart's width in pixels
        that evenly distributes the bars among the years. We also add a `padding` to
        separate the bars by a small gap. You could specify more explicitly the inner padding
        and the outerpadding using the methods .paddingInner() and .paddingOuter().

        - What is the purpose of the .padding() in d3.scaleBand()?

        A: See above answer. 

        - For each scale below, what does the domain
            represent, and what does the range represent?

        A: For xScale, the domain represents the input to the bar chart's horizontal
        axis which is a set of specific years. The range is a continuous range
        defined using the variables margin and width we defined above for controlling
        the size and positioning of the chart in the browser.
        For yScale, the domain and range are continuous sets of values.

        - For each scale below, how many values are in
            the domain and range?

        A: For xScale, the domain contains 12 values and the range is uncountable.
        For yScale, both the domain and range are uncountable.
    */

    const xScale = d3.scaleBand()
        .domain(["1952","1957","1962","1967","1972","1977","1982","1987","1992","1997","2002","2007"])
        .range([margin.left, width-margin.right])
        .padding(0.5);

    const yScale = d3.scaleLinear()
        .domain([50, lifeExp.max])
        .range([height-margin.bottom, margin.top]);

    /*
    DRAW AXES

    QUESTION 6:
    
    The following chunks of code draw 2 axes -- an x- an y-axis.
        - What is the purpose of the "g" element being appended?

        A: The "g" element creates a new DOM element that is appended
        to an svg container. This element will contain the axes for
        our visualization.

        - What is the purpose of the "transform" attribute being defined?

        A: It "pushes" upwards the position of the horizontal axis by
        calculating the difference between `height` and `margin.bottom`.
        It is essentially a method of positioning the axis element.

        - What do the d3.axisBottom() and d3.axisLeft() methods do?

        A: The .axisBottom() is a built-in D3 function that draws a bottom
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
    DRAW BARS

    In this bar chart, each bar will represent a single year for the United States;
    the horizontal position of the bar will represent the year of data,
    vand the height of the bar will represent the life expectancy for that year.

    QUESTION 7:

    The following chunk of code is the standard D3 data join pattern.
        - What is the purpose of the pattern svg.selectAll().data().enter().append()?

        A:

        - Each attribute defined below is defined using things called
            "accessor functions." In each accessor function, what is
            the parameter named `d` a reference to?

        A:

        - Inside each accessor function, what is the purpose of
            each "return ___;" statement?
        
        A:

        - What does xScale.bandwidth() compute? How is that value being used here?

        A:

        - What is going on with the calculation for the "height" attribute?
            Explain how the expression inside the accessor function for this
            attribute works.
        
        A:

    */

    const points = svg.selectAll("rect")
        .data(filtered_data)
        .enter()
        .append("rect")
            .attr("x", function(d) { return xScale(d.year); })
            .attr("y", function(d) { return yScale(d.lifeExp); })
            .attr("width", xScale.bandwidth())
            .attr("height", function(d) { return height - margin.bottom - yScale(d.lifeExp); })
            .attr("fill", "steelblue");
    
    /*
    DRAW AXIS LABELS

    QUESTION 8:

    The chunks of code below draw text labels for the axes.

    Examine the yAxisLabel. What is going on with the 
    "transform", "x", and "y" attributes, in terms of
    how their values are computed to control the rotated
    placement of the label?

    A:

    */
    const xAxisLabel = svg.append("text")
        .attr("class","axisLabel")
        .attr("x", width/2)
        .attr("y", height-margin.bottom/2)
        .text("Year");

    const yAxisLabel = svg.append("text")
        .attr("class","axisLabel")
        .attr("transform","rotate(-90)")
        .attr("x",-height/2)
        .attr("y",margin.left/2)
        .text("Life Expectancy (Years)");

});
