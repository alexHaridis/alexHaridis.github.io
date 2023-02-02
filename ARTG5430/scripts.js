// Using D3 functions to read external data files. 

// Filetypes: 
// txt, csv, json
// See a full list of filetypes: https://github.com/d3/d3/blob/main/API.md#fetches-d3-fetch

// PARSE FUNCTIONS FOR PRE-PROCESSING DATA

// We can pre-process data in different file types by
// providing a pre-processing function that we have defined
// to D3 functions.

// This generic parse function does nothing to the input and
// simply prints its content using the console log method.

function parseLOG(d) {
    console.log(d);
}

// Reads a TXT file as a string and prints its content

// In D3 v5 and higher, if you use d3.csv(csv file, function) without
// the dot notation for "then" the result is a promise (a proxy).
// See:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
//
// To get your actual data, you need to provide a callback function using
// the dot notation .then(your callback function).

// Here, the callback function is simply the generic parseLOG function.

d3.text("datasets/file.txt").then(parseLOG);;

// Reads a CSV file in which values are comma-separated. Then, d3 converts
// it into an array of objects. Headers in the CSV file are used as the
// keys/names for the data objects. 
// NOTE 1: First row of the file is expected to be the key names for each data point.
// NOTE 2: All values associated with names have been converted into strings.
//         You can perform conversions of data types as needed (more below).

// d3.csv("datasets/cities-sm.csv", yourFunction).then(parseLOG);

// Reads a JSON file: JavaScript Object Notation.
// The structure of this filetype is the same as JavaScript objects,
// defined with pairs of keys/names and values.

d3.json("datasets/countrycode-sm.json").then(parseLOG);

// Alternative way of defining a parse function for a d3 method.
// This simply embeds the parse function within the d3.text method.
// and the same holds for the other d3.<file type> methods.

// NOTE: The previous approach, however, separates the parsing function from the method
// that calls it and so it helps readability and reuseability of functions.

d3.text("datasets/file.txt", function(data) {
    console.log(data);
});

// Manipulating (Transforming) Data


// We can preprocess the data directly with d3.csv(), so that
// before the data are loaded, we can do the following kinds of things:
//     - Rename columns to more user-friendly names
//     - Select only a slice of columns to include
//     - Coerce values to different types (e.g., string to number)
//     - Calculate new values and columns

// To do this preprocessing, we supply a function expression as the
// second argument to d3.csv(), e.g.,

//     d3.csv("./path/to/data.csv", function() { ... }).then( ... )

function parseCSVIntoNum(d) {
    // return a structure of objects:
    // property: value pairs
    // The values previous converted into strings,
    // will be cast into numbers
    return {
        "city": d.city,
        "state": d.state,
        "population": +d.population,
        "land area": +d["land area"]
    };
}

d3.csv("datasets/cities-sm.csv", parseCSVIntoNum).then(parseLOG);


d3.csv("datasets/cities-sm.csv").then(function(data){
    // Loads the csv file, and converts it into an array of objects
    // console.log(data[0]);

    // Manipulating (Transforming) Data

    // Changing Data

    // Arrays have a built-in "forEach" method that allows you
    // to loop through its elements and change values selectively.

    data.forEach( function(d) {
        d.population = +d.population;
        d["land area"] = +d["land area"];
    });

    // console.log(data[0]);

    // Filtering Data 
    
    // In the following, we use the JS .filter method for arrays.
    // The method returns a new array filled with elements that pass
    // a test provided by a custom function.

    let filtered_data = data.filter(function(d) {
        //Return the object iff its key is equal to a specified string
        return d.state === "NY";
    })

    console.log(filtered_data);

    // Grouping Data

    // In the following, we use the JS .group method for arrays.
    // The method groups values by key. It returns a map from 
    // key to the corresponding array of values from the input.

    let grouped_data = d3.group(data, function(d) {
        return d.city;
    });

    // Returns a Map
    console.log(grouped_data);

    // Then, you can query the map for a particular group
    console.log(grouped_data.get("boston"));
});

// A list of Public APIs for use in software and web development

// https://github.com/public-apis/public-apis/blob/master/README.md

let url1 = "https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest";

d3.json(url1).then(function(data){
    console.log(data);
});

// let url2 = "https://whiteboard.datawheel.us/api/google-analytics/realtime/random";

// function loadData() {
//     d3.json(url2).then(function(data) {
//         console.log(data);
//     });
// }

// var ff = setInterval(loadData, 1000);

// console.log(ff);