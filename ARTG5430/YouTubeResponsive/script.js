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
    MAKING THE SVG CANVAS RESPONSIVE

    In past demonstrations, we have been inserting our SVG canvas
    into the page using predefined `width` and `height` attribute values.

    These width and height values have been computed by using the
    .clientWidth and .clientHeight property on the parent container,
    and the size of the parent container has been controlled with CSS
    to allow the container to fill 100% of the width and 100% of the height
    of the browser window.

    Defining the dimensions of the SVG canvas this way poses a problem:
    the size of the SVG canvas becomes fixed to those values, and thus
    the SVG canvas doesn't scale responsively to changes in window size
    (unless you refresh the page after resize).

    To get around this, we can use 2 new SVG attributes to make the
    canvas scale responsively to window size:

        viewBox: "<minX> <minY> <width> <height>"
            This controls the aspect ratio of the SVG canvas,
            defining the coordinate system on which SVG shapes
            will be drawn

        preserveAspectRatio: "xMidYMid meet"
            This controls the behavior of the canvas for
            what happens with the aspect ratio when the SVG
            is drawn inside a container whose aspect ratio is
            different from the viewBox aspect ratio.

            This value effectively says "scale the SVG uniformly
            in the x- and y-direction to preserve the aspect ratio"

            (See: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio)


    To use these attributes, we *DO NOT* define `width` or `height`
    attributes for the SVG canvas -- only viewBox and preserveAspectRatio.

    In this example, the aspect ratio is set to a fixed value of
    1000px width / 600px height.

    This is done to ensure this visualization is drawn with exactly
    this aspect ratio on EVERY device -- no more computing an
    aspect ratio based on whatever size the user's current window is!

    */



    // We probably don't want to use these values anymore -- their aspect ratio
    // will be unpredictable!
    // const width = document.querySelector("#chart").clientWidth;
    // const height = document.querySelector("#chart").clientHeight;

    // Instead, it's safer to use a predictable (and fixed) aspect ratio
    const width = 1000;
    const height = 600;

    const margin = {top: 50, left: 100, right: 150, bottom: 100};

    const svg = d3.select("#chart")
        .append("svg")
        // .attr("width", width)
        // .attr("height", height);
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");



    /*
    DETERMINE MIN AND MAX VALUES OF VARIABLES
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
    CREATE SCALES
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
        .call(d3.axisBottom().scale(xScale).ticks(5).tickFormat(d3.format("~s")));

    const yAxis = svg.append("g")
        .attr("class","axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale).ticks(5).tickFormat(d3.format("~s")));


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

    /* CREATING SCALE FACTORS

    When we position the tooltip in this demonstration,
    we are relying on the `cx` and `cy` attributes of
    the circles to tell the tooltip where to go.

    But the problem with this is that these cx and
    cy positions are fixed and absolute when drawn -- 
    they don't automatically scale in value if the
    viewbox of the SVG canvas changes!

    This means that when we resize the window after
    loading the visualization, the tooltip
    will variably be further away from or 
    closer to where the tooltip needs to be.

    To fix this, we will create 2 new "scale factor"
    variables that we'll use to scale the circles'
    fixed position coordinates.

    To compute the scale factor variables, we first
    compute the *actual width and height* of the SVG canvas
    as it currently exists. (This may or may not be the
    same as the width and height of the viewbox!)

    The pattern we'll use is this:

        svg.node().clientWidth;
        svg.node().clientHeight;

    The variable `svg` is currently holding a D3 selection
    of the SVG canvas we created. In order to turn this selection
    into an HTML node (DOM node), we use the .node() pattern.

    By turning this into a DOM node, we now have access to
    DOM properties, such as .clientWidth and .clientHeight,
    which tell us the current width and height of the canvas.

    Then, we use these values to compute ratios:

        (current actual width of SVG) / (original width of SVG from viewbox)
        (current actual height of SVG) / (original height of SVG from viewbox)


    This value will produce a ratio, at different screen sizes.

    We then multiply the `cx` and `cy` attribute values for the circles
    by these ratios, to scale those attributes based on the relative size
    of the SVG canvas (and browser window).

    */
    let tw = svg.node().clientWidth;
    let th = svg.node().clientHeight;
    let sx = tw / width;
    let sy = th / height;

    points.on("mouseover", function(e,d) {


        let x = sx*(+d3.select(this).attr("cx")) + 20;
        let y = sy*(+d3.select(this).attr("cy")) - 10;
        
        let displayValue = d3.format(",")(d.likes);

        tooltip.style("visibility", "visible")
            .style("top", `${y}px`)
            .style("left", `${x}px`)
            .html(`<b>${d.title}</b><br>${displayValue} Likes`);

        points.attr("opacity", 0.1);
        d3.select(this).attr("opacity", 1).raise();

    }).on("mouseout", function() {
        tooltip.style("visibility", "hidden");
        points.attr("opacity", 1);
    });





    /* 

    ADDING LEGENDS

    Notice!

    Here, we are drawing new SVG canvases for the legends.

    If we want these SVG canvases to scale responsively to
    changes in window sizes too, then we must define
    viewBox and preserveAspectRatio for these as well!

    This example uses a fixed aspect ratio of

        300px width / 200px height

    */
    // const legendWidth = document.querySelector("#legend").clientWidth;
    const legendWidth = 300;
    const legendHeight = 200;
    const legendMargin = 25;
    const legendSpacing = 50;

    const colorLegend = d3.select("#legend")
        .append("svg")
        // .attr("width", legendWidth)
        // .attr("height", 300);
        .attr("viewBox", `0 0 ${legendWidth} ${legendHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");


    categories.forEach(function(category, i) {


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

    Again, if we want this SVG canvas to scale responsively to
    changes in window sizes too, then we must define
    viewBox and preserveAspectRatio for it as well!

    This example uses the same fixed aspect ratio of

        300px width / 200px height 
    */

    const sizeLegend = d3.select("#legend")
        .append("svg")
        // .attr("width", legendWidth)
        // .attr("height", 300);
        .attr("viewBox", `0 0 ${legendWidth} ${legendHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");


    const commentLevels = [comments.min, (comments.max-comments.min)/2, comments.max];

    commentLevels.forEach(function(commentCount, i) {

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




    /* LISTENING FOR RESIZE EVENTS 
    
    In the following chunk, the DOM `window` object is selected
    with d3.select().

    This selected element listens for the "resize" event, which
    gets triggered every time the browser window is resized
    by the user.

    Inside the event handler function, we recompute the values
    of our scale factor variables (sx and sy), based on
    whatever the current new size of the SVG canvas is.

    By updating the values of these globally scoped scale factor variables,
    the tooltip will automatically be positioned relative 
    to the new scaled size of the canvas.

    
    */



    d3.select(window).on("resize", function(e) {

        let tw = svg.node().clientWidth;
        let th = svg.node().clientHeight;
        sx = tw / width;
        sy = th / height;


        /*
        This section is part of your final task
        in the JavaScript exploration:

        Inside the window resize event handler, implement a breakpoint using JavaScript. 
        In the code, you will find a variable named windowWidth that captures the 
        current window width on resize. Following that there is an if() statement that 
        checks to see if the windowWidth is greater than 1000px. Using this construction, 
        add code to apply a simple change to the visualization design based on the size 
        of the screen. One example of a simple change could be to redraw the axes to have 
        more ticks at larger screen sizes and fewer ticks at smaller screen sizes. Or, you 
        might change the range of the rScale() function to manipulate the relative size of 
        circles at smaller screen sizes. Or, you might apply a different CSS class to the 
        visualization's axes to change the size and scale of tick labels at different 
        screen sizes. Anything is fine!

        */
        let windowWidth = window.innerWidth;
        console.log(windowWidth);
        if(windowWidth > 1000) {

        } else {

        }
        
    });




});
