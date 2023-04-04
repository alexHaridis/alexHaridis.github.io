/* 
PRE-PROCESSING THE DATA

In this pre-processing, we do the following:
    - Select only a subset of columns to include
        in the data loading
    - Rename some of the columns
    - Coerce some of the values to Number types
    - Filter the rows to only include videos
        where the number of likes is at least
        1,000,000 likes
*/

function parseCsv(d) {
    if(+d.likes >= 1000000) {
        return {
            video_id: d.video_id,
            title: d.title,
            trending_date: d.trending_date,
            // channel: d.channelTitle, // We can exclude columns from the data
            category: d.category,
            views: +d.view_count, // Changing name of column/property
            comments: +d.comment_count, // Changing name of column/property
            likes: +d.likes,
            dislikes: +d.dislikes
        }    
    }
}

d3.csv("./data/2021-youtube-trending-videos_entertainment-gaming-music.csv", parseCsv).then(function(data) {

    // console.log(data);

    /*
    DEFINE DIMENSIONS OF SVG + CREATE SVG CANVAS
    */
    const width = document.querySelector("#chart").clientWidth;
    const height = document.querySelector("#chart").clientHeight;
    const margin = {top: 50, left: 200, right: 150, bottom: 100};

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);


    /*
    
    DETERMINE MIN AND MAX VALUES OF VARIABLES

    In this section, we are computing minimum and maximum values
    of variables in the data so that we can use these values to
    construct scales. 

    */

    const likes = {
        min: d3.min(data, function(d) { return d.likes; }),
        max: d3.max(data, function(d) { return d.likes; })
    };

    const comments = {
        min: d3.min(data, function(d) { return d.comments; }),
        max: d3.max(data, function(d) { return d.comments; })
    };

    const views = {
        min: d3.min(data, function(d) { return d.views; }),
        max: d3.max(data, function(d) { return d.views; })
    };


    const categories = ["Gaming", "Entertainment", "Music"];

    /*

    GETTING UNIQUE VALUES FOR A CATEGORICAL VARIABLE

    In the code above, and in previous demonstrations,
    we've manually created an array to hold the unique
    values of `category` in the data set.

    
    But you may recall that there is a JS array method
    that can help with this task: ARRAY.map().

    We might try to do this:

        const categories = data.map(function(d) {
            return d.category;
        });

    And expect to see an array of "Entertainment", "Music", and "Gaming".

    But in reality, we'll see these values duplicated multiple
    times -- because ARRAY.map() is simply returning the value of
    `category` for each row in the data set, and multiple videos
    have the same value of `category`.

    Unfortunately, getting unique values of these kinds of variables
    in a data set is not very straightforward. However, the
    following 2 chunks of code are 2 different ways of retrieving
    unique values.

    I won't unpack these in much detail, but they can be recycled
    in your own code, as long as you know what needs to change!

    USING d3.groups() and ARRAY.map():

        const categories = d3.groups(data, function(d) { return d.category; })
            .map(function(d) { 
                return d[0];
            })

    USING ES6 SETS and SPREAD OPERATOR:

        // Retrieve `d.category` for each row in the data set
        let allCategories = data.map(function(d) {
            return d.category;
        });

        // Turn result of above into an ES6 Set,
        // and then spread the values into a flat array
        const categories = [...new Set(allCategories)];
    */


    /*
    CREATE SCALES

    In the following scale functions, the minimum and
    maximum values of variables named `likes`, `views`,
    and `comments` are used to define the domains.

    The array named `categories` is used to define
    the domain of the d3.scaleOrdinal() function.

    Remember: `likes`, `views`, and `comments` used
    below are names of objects (that we defined!) that
    hold the maximum and minimum values of our data variables
    (that we calculated!)

    */

    const xScale = d3.scaleLinear()
        .domain([likes.min, likes.max])
        .range([margin.left, width-margin.right]);

    const yScale = d3.scaleLinear()
        .domain([views.min, views.max])
        .range([height-margin.bottom, margin.top]);

    const rScale = d3.scaleSqrt()
        .domain([comments.min, comments.max])
        .range([2, 10]);

    const fillScale = d3.scaleOrdinal()
        .domain(categories)
        .range(['#1b9e77','#d95f02','#7570b3']);



    /*
    DRAW AXES
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
    */
    const points = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
            .attr("cx", function(d) { return xScale(d.likes); })
            .attr("cy", function(d) { return yScale(d.views); })
            .attr("r", function(d) { return rScale(d.comments)})
            .attr("fill-opacity", 0.2)
            .attr("stroke", function(d) { return fillScale(d.category); })
            .attr("stroke-width", 1.5)
            .attr("fill", function(d) { return fillScale(d.category); });

    
    /*
    DRAW AXIS LABELS
    */
    const xAxisLabel = svg.append("text")
        .attr("class","axis--label")
        .attr("x", width/2)
        .attr("y", height-margin.bottom/2)
        .text("Likes");

    const yAxisLabel = svg.append("text")
        .attr("class","axis--label")
        .attr("transform","rotate(-90)")
        .attr("x",-height/2)
        .attr("y",margin.left/3)
        .text("Views");


    /* TOOLTIP */

    const tooltip = d3.select("#chart")
        .append("div")
        .attr("class", "tooltip");

    points.on("mouseover", function(e,d) {

        let x = +d3.select(this).attr("cx") + 20;
        let y = +d3.select(this).attr("cy") - 10;
        
        // Format the display of the numbers,
        // using d3.format()
        // See: https://github.com/d3/d3-format/blob/v3.1.0/README.md#format
        let displayValue = d3.format(",")(d.likes);

        tooltip.style("visibility", "visible")
            .style("top", `${y}px`)
            .style("left", `${x}px`)
            .html(`<b>${d.title}</b><br>${displayValue} Likes`);

        // Optionally, visually highlight the selected circle
        points.attr("opacity", 0.1);
        d3.select(this).attr("opacity", 1).raise();

    }).on("mouseout", function() {
        // Reset tooltip and circles back to original appearance
        tooltip.style("visibility", "hidden");
        points.attr("opacity", 1);
    });

    /* 
    ADDING LEGENDS

    When creating visualizations with D3, we don't automatically
    get legends for encodings like color and size. We have to
    make these ourselves!

    Making a legend with D3 and SVG requires a mixture of
    plain JavaScript, drawing basic SVG shapes, and some
    creativity with CSS. The following demonstration is
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
    const legendMargin = 25;
    const legendSpacing = 50;

    const colorLegend = d3.select("#legend")
        .append("svg")
        .attr("width", legendWidth)
        .attr("height", 300);


    /*
    Next, we iterate over each of the values for which
    we want to display a legend, using ARRAY.forEach().

    Here, we'll create a color legend that shows what
    category each color represents.

    So, we'll iterate over each of the values in
    the array named `categories`
    */
    categories.forEach(function(category, i) {

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
            .attr("cx", legendMargin)
            .attr("cy", legendMargin + i*legendSpacing)
            .attr("r", 10)
            .attr("fill", fillScale(category));

        colorLegend.append("text")
            .attr("class", "legend--label")
            .attr("x", legendMargin + 25)
            .attr("y", legendMargin + i*legendSpacing)
            .text(category);
    });

    /* 
    To create a size legend, we can follow much of the same procedure.
    */

    const sizeLegend = d3.select("#legend")
        .append("svg")
        .attr("width", legendWidth)
        .attr("height", 300);

    /*
    An important difference is that we don't have an array like `categories`
    that can be used to specify what values should be in the legend,
    for something like circle size.

    So, we can manually define an array that works this way, for
    3 different sizes we want to represent in the legend:
    */

    const commentLevels = [comments.min, (comments.max-comments.min)/2, comments.max];

    /*
    Then, use the new `sizes` array to draw the legend
    */
    commentLevels.forEach(function(commentCount, i) {

        /* 
        Since we're working with number values,
        it can be helpful to format the numbers
        to something a bit more human-readable.
        
        See: https://github.com/d3/d3-format/blob/v3.1.0/README.md#format
        */
        let displayCount = d3.format(",")(Math.round(commentCount));

        sizeLegend.append("circle")
            .attr("cx", legendMargin)
            .attr("cy", legendMargin + i*legendSpacing)
            .attr("r", rScale(commentCount))
            .attr("fill", "#CCCCCC");

        sizeLegend.append("text")
            .attr("class", "legend--label")
            .attr("x", legendMargin + 25)
            .attr("y", legendMargin + i*legendSpacing)
            .text(`${displayCount} Comments`);
    });

});
