/* 
PRE-PROCESSING THE DATA

In many demonstrations, we've found ourselves grappling with
one of the idiosyncracies of d3.csv(): that all values loaded
from a CSV file are interpreted as String values.

This causes problems for us when values should be Number types,
because weird things can happen when interacting with numeric values
that are encoded as Strings (e.g., incorrect minimum and maximum
values returned with d3.min() or d3.max()).

The solution to this problem so far has been to coerce these
numeric values back into Number types in isolated places, where
the type of the values matters for the calculation being performed.

However, there is a more streamlined solution to this!

We can preprocess the data directly with d3.csv(), so that
before the data are loaded, we can do the following kinds of things:
    - Rename columns to more user-friendly names
    - Select only a slice of columns to include
    - Coerce values to different types
    - Calculate new values and columns

To do this preprocessing, we supply a function expression as the
second argument to d3.csv(), e.g.,

    d3.csv("./path/to/data.csv", function() { ... }).then( ... )

We can clean this pattern up a bit by replacing the function expression
with a named function, e.g.,

    d3.csv("./path/to/data.csv", parseCsv).then( ... )

This function we supply serves a specific purpose: it will be called
for each original row in the CSV file, and allow us to return a
modified version of the original row of data.

The following code demonstrates this. Notice the parameter
named `d` in the named function. This `d` refers to each original
row of data from the CSV file, represented as an object -- 
in other words, this `d` is effectively the exact same `d` that
we've seen elsewhere in our code, e.g., in accessor functions
for defining attributes of shapes in the data join pattern.

With this `d`, we can access the original values of columns
in the CSV file by their original name, and use them to
construct a NEW object that will represent each individual row.

Notice what is returned by this function: an object!

This object that is returned becomes the object representing
the (transformed) data from each row.

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

    console.log(data);

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

    Notice 2 things:
        - The properties `d.comments` and `d.views` represent
            the new names of the columns that were originally named
            `comment_count` and `view_count`
        - None of the instances of d3.min() or d3.max() use a 
            plus sign (+) to coerce these values to Number types

    These 2 things are the result of our data preprocessing
    earlier in the code!

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

    /* 
    
    SIDE NOTE: Unique values for a categorical variable

    In many visualization situations, we need to know
    what the unique values of a categorical variable are --
    e.g., for defining the domain of d3.scaleOrdinal().

    In this demonstration, we'll use the color of each circle
    to encode the `category` of each variable. Thus, for
    later parts in our code, we will need an array of the
    unique values of `category`, i.e., 

        "Entertainment", "Music", "Gaming"

    This is stored in an array below.

    */

    const categories = ["Gaming", "Entertainment", "Music"];

    /*
    
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
    points.on("mouseover", function(e,d) {

        // Update style and position of the tooltip div;
        // what are the `+` symbols doing?
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

        // Make the tooltip invisible when mouse leaves circle
        tooltip.style("visibility", "hidden");

        // Reset the circles' appearance back to original
        points.attr("opacity", 1);

    });


    /* 
    FILTER BY CHECKBOX 

    To add the option of filtering the scatter plot
    by checkbox, we need the following pieces:
        - Some <input> checkbox elements in the HTML
            that represent the values we want to filter 
            the visualization by
        - A way of detecting when those <input> elements
            have been clicked
        - A way of manipulating which shapes in the visualization
            are visible or invisible, in response to these
            clicks of the checkboxes
    
    */

    d3.selectAll(".category--option").on("click", function() {

        /* 
        For the checkbox that has just been clicked,
        we determine the value associated with it and
        whether it is currently checked or unchecked
        */
       
        let isChecked = d3.select(this).property("checked");
        let thisCategory = d3.select(this).property("value");

        /*
        We filter the points in the scatter plot to only
        select the circles whose category matches the
        value of the checkbox that was just checked
        */

        let selection = points.filter(function(d) {
            return d.category === thisCategory;
        });

        /*
        Depending on whether the checkbox is checked
        or unchecked, we either:
            - Make the circles in the filtered selection
                all visible by setting their opacity
                to 1 (if checkbox is checked), or
            - Make the circles in the filtered selection
                all invisible by setting their opacity
                to 0 (if checkbox is unchecked)
        */

        if (isChecked == true) {

            selection.attr("opacity", 1)
            .attr("pointer-events", "all");

        } else {

            selection.attr("opacity", 0)
            .attr("pointer-events", "none");

        }

        /*

        Note: the `pointer-events` attribute can be used
        to control whether an element can respond to
        mouse interaction events or not.
            `pointer-events` set to "none": 
                Allow NO response to mouse pointer interaction
            `pointer-events` set to "all":
                Allow any and all responses to mouse
                pointer interaction

        The reason for including this is that we want to
        disable to the automatic tooltip event for
        circles that are hidden in the visualization
        if they've been filtered out from a checkbox.
        
        */

    });



});
