// Grab the dimensions of the open window in the browser.
// Our geographical map will extend throughout the window.

let width = window.innerWidth, height = window.innerHeight;

// We initialize variables for the svg container that holds all
// of our visualization elements. And we also initialize a variable
// to store just the element that holds our map; this element is a group
// that in HTML tags is given by "g". See the index.html for more information.

const svg = d3.select("#viz")
            .attr("width", width)
            .attr("height", height);

const map = svg.select("#map");

// Because we are creating a map, we also want to add some kind of "ocean". This is going
// to be just a rectangle that has an ID called #ocean. See the index.html

d3.select("#ocean")
  .attr("width", width)
  .attr("height", height);

// Here start building the geographical map by first loading a TopoJSON file.
d3.json("data/world-alpha3.json").then(function(world) {

    /** 
     * This function converts the loaded TopoJSON object to GeoJSON
     * It creates an array of JavaScript objects where each object stores:
     * (a) Geometry (e.g., polygons) defined by a list of coordinates.
     * (b) ID, which in this case is the ISO code of a country
     * (c) Properties, in this case `name` and `iso`. e.g., name: "Argentina", iso: "ARG"
    */

    var geoJSON = topojson.feature(world, world.objects.countries);
    
    // We are removing the JavaScript object that stores the features
    // of Antarctica because we will hide Antarctica from the map we are making. 
    geoJSON.features = geoJSON.features.filter(function(d) {
        return d.id !== "ATA";
    });

    /**
     * Map Projections
     * 
     * Just like we set up a linear scale for mapping data values to pixel positions
     * in a bar chart or scatter plot (e.g., with linearScale), we need to create a
     * function that maps raw coordinate values given in the geoJSON file into screen
     * pixels. There is no one way of using projections for creating maps. In general,
     * the visible size of a countries boundary shape depends on the projection used
     * to make it visible. See this: https://www.thetruesize.com
     * 
     * In the following we will set up a "flat" map projection otherwise known as
     * spherical Mercator projection (an equirectangular projection).
     * 
     * For more information on projections that d3 implements, see:
     * https://github.com/d3/d3-geo#azimuthal-projections
    */

    var proj = d3.geoMercator().fitSize([width, height], geoJSON);

    /**
     * Geographical Path Constructor
     * 
     * 
     */

    var path = d3.geoPath().projection(proj);

    var countries = map.selectAll("path").data(geoJSON.features);

    countries.enter().append("path")
        .attr("d", path)
        .attr("fill", "#FCEDDA")
        .attr("vector-effect", "non-scaling-stroke")
        .attr("stroke", "#FC766AFF")
        .attr("stroke-width", "0.1px");
    
    /**
     * Plotting on the Geographical Map
     * 
     * Plot two circles on the geographical map to denote the location 
     * of particular cities. The location of a city is given by the 
     * coordinates for latitude and longitude. Once you get the
     * coordinates, you use the projection function defined previously,
     * e.g., the Mercator projection, and you pass in those coordinates
     * in the function to project them onto the map as pixel positions.
     */

    // NOTE: The coordinates for a city are given as: [longitude, latitude]
    //       because that is how the projection function wants them.
    var points = [
        {"name": "Boston", "coords": [-71.0589, 42.3601]},
        {"name": "London", "coords": [-0.1278, 51.5074]}
    ];

    // The following is the usual D3 joint pattern for adding
    // SVG circle shapes. 
    //
    // Here, notice how we transform the circles using
    // the projection function we defined previously. Essentially, the
    // projection is just a function that requires an input argument, 
    // namely the coordinates of a point.

    var cities = map.selectAll("circle")
        .data(points)
        .enter().append("circle")
        .attr("r", 3)
        .attr("fill", "#201E20")
        .attr("transform", function(d) {
            return "translate(" + proj(d.coords) + ")";
        });

    /**
     * D3 Zoom and pan
     * 
     * D3 provides a method called .zoom() that adds zoom and pan behaviour to an
     * HTML or SVG element. 
     * 
     * For more information, see: https://www.d3indepth.com/zoom-and-pan/
     * 
     * Documentation: https://github.com/d3/d3-zoom
     */

    function zoomed(e) {
        // The parameter `e` represents an event, that is, a zoom event.
        // e.transform represents the latest zoom transform caused by a zoom event
        // and it is applied to the svg map element (see the index.html).
        map.attr("transform", e.transform);
    }

    // Calling d3.zoom() creates a zoom behavior. Note, the .zoom() method 
    // handles both zoom and pan events.
    let zoom = d3.zoom()
        // This essentially constraints the user so that the user can only
        // zoom and pan within specific bounds, e.g., our window's width and height.
        .translateExtent([[0, 0], [width, height]])
        // This constraints the extent to which you can zoom in and out.
        //          [minimum scale factor, maximum scale factor]
        // Experiment with different values to see the behavior of zooming.
        .scaleExtent([1, 15])
        // The .on() method is D3's standard event listener, like user clicks, mouseover, etc.
        .on("zoom", zoomed);

    // Here, we allow the zoom function which controls the zoom and pan behavior to be called
    // into the element we selected, i.e., the svg container that holds all our visualization.
    // See the beginning of this file for how the variable `svg` is defined.
    svg.call(zoom);

});