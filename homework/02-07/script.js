/*

The following code is commented out. It illustrates basic techniques for
(Part 1) Loading data in D3 from external files, (Part 2) Manipulating (transforming)
data with parse functions, (Part 3) Loading data from a public API.

We will progressively comment out each of the sections in class.

Dependents: D3, file.txt, cities-sm.csv, countrycode-sm.json

*/


// PART 1: LOADING DATA WITH D3 FROM EXTERNAL FILES

// FILETYPES: 
// txt, csv, json

// See a full list of filetypes: https://github.com/d3/d3/blob/main/API.md#fetches-d3-fetch


// NOTE:
//
// Here, we are using methods that can be found in D3 v5 and higher.


// To load data, we use D3's built-in methods:
// d3.text()
// d3.csv()
// d3.json()

// After we load data from an external source, we can print them in the console 
// or use them for a visualization.


// 1. Load a TXT file and print its content

// Here, we load a txt file just print its contents in the console.
// Here is the general syntax for the D3 method:

//     d3.text("source/path to text file").then(function(data){ ... })

// The function inside the dot notation .then(....) is called a 
// CALLBACK function. For example, here is one that simply prints 
// the data in the console.

// function parseLOG(d) {

//     console.log(d);

// }

// We supply this function to the d3.text() method in this way:

// d3.text("datasets/file.txt").then(parseLOG);


// 2. Load a CSV file and print its content

// The following line loads a CSV file and prints its content using
// the same callback function as before. 

// d3.csv("datasets/cities-sm.csv").then(parseLOG);

// NOTE 1: In CSV files, the first row of the file is expected 
//         to be the key/names for each data point.
// NOTE 2: When a CSV file is loaded, all values paired with keys 
//         are converted into strings.


// 3. Load a JSON file and print its content

// JSON file: JavaScript Object Notation.
// The structure of this filetype is analogous to JavaScript objects,
// defined with pairs of keys/names and values but it can also contain more
// complex things like functions, arrays, and even other JavaScript objects.

// d3.json("datasets/countrycode-sm.json").then(parseLOG);


// PART 2: MANIPULATING (TRANSFORMING) DATA WITH PARSE FUNCTIONS

// We can PREPROCESS the data directly with d3 so that before
// the data are loaded, we can do the following kinds of things:
//     - Rename columns to more user-friendly names
//     - Select only a slice of columns to include
//     - Coerce values to different types (e.g., string to number)
//     - Calculate new values and columns

// To do this preprocessing, we supply a function expression as the
// second argument to d3.csv() or the other loading methods, e.g.,

    // d3.csv("./path/to/data.csv", function() { ... }).then( ... )

// This pre-processing function is called PARSE FUNCTION, which is
// just a function that "does something" to our data.


// 4. Pre-Process a CSV file so that the strings that represent
// numerical values are converted/coerced into numbers.

// We can do that in several ways. For example, two methods are:
//   a. Use the built-in parseFloat() javascript function
//   b. Use the unary operator +

// The following parse function uses method (b) above and is
// specifically for the cities-sm.csv file.

// function parseCSVIntoNum(d) {

//     // Returns a structure of objects:
//     //       property: value pairs
//     //
//     // where strings that represent numerical
//     // values are converted into numbers.

//     return {
//         "city": d.city,
//         "state": d.state,
//         "population": +d.population,
//         "land area": +d["land area"]
//     };

// }


// The function parseCSVIntoNum "acts" on the csv file and then
// inside .then() the callback function parseLOG references the
// resulting dataset after preprocessing and prints it.

// NOTE: With this method, the PARSE FUNCTION acts on the whole
// dataset and returns the modified dataset.

// d3.csv("datasets/cities-sm.csv", parseCSVIntoNum).then(parseLOG);


// 5. Manipulating (Transforming) Data "Row by Row"

// We can manipulate (transform) a dataset in another way. Instead
// of using a parse function, we can access the original dataset directly
// by building a function within the .then() callback method.  

// NOTE: When a CSV file is loaded, you then access every row one by one
//       inside the .then() callback method and perform any alterations you want.
//       Notice that throughout the function(data) {...} the input argument "data"
//       references your csv file, so that you can perform multiple alternations
//       using the same reference to the dataset (i.e., that is why "data" is defined
//       only once as an input argument). Changes are cumulative, that is, every
//       change you make at one point acts on the data it receives from a change
//       in a preceding point.  

// d3.csv("datasets/cities-sm.csv").then(function(data){
    
//     // This accesses the first row of the csv dataset
//     // console.log(data[0]);

//     // Change values using the .forEach() method that loops
//     // through the rows of the dataset. In this way, you 
//     // can alter values of individual keys selectively.

//     // data.forEach( function(d) {

//     //     // Here, we alter the keys "population" and "land area" only.
//     //     // Thus, we leave "city" and "state" as they are.
//     //     d.population = +d.population;
//     //     d["land area"] = +d["land area"];

//     // });

//     // Filtering Data 
    
//     // In the following, we use the JS .filter() method to return a row 
//     // filled with elements that pass a particular test provided by a 
//     // custom function.

//     // let filtered_data = data.filter(function(d) {

//     //     // Return the object iff its key is equal to a specified string
//     //     return d.state === "NY";

//     // })

//     // console.log(filtered_data);

//     // Finding MINIMUM or MAXIMUM value of a numerical variable

//     // Here, the methods d3.min() and d3.max() require 2 arguments:
//     // the array/object to be analyzed and an "accessor" function that
//     // returns the object key value to be used for the analysis.

//     // const min_pop = d3.min(data, function(d) { return +d.population; });
//     // const max_pop = d3.max(data, function(d) { return +d.population; });

//     // console.log(min_pop, max_pop);

//     // GROUPING DATA

//     // In the following, we use the JS .group method for arrays.
//     // The method groups values by a particular key. It returns a map from 
//     // key to the corresponding array of values from the input.

//     // Here, we group the data by "city".

//     // let grouped_data = d3.group(data, function(d) {

//     //     return d.city;

//     // });

//     // Returns a Map
//     // console.log(grouped_data);

//     // Then, you can query the map for a particular group.
//     // console.log(grouped_data.get("boston"));

// });


// PART 3: LOADING DATA FROM A PUBLIC API

// Examples of Public APIs:
// https://github.com/public-apis/public-apis/blob/master/README.md
// https://www.kaggle.com/datasets

// let url1 = "https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest";

// d3.json(url1).then(function(data){

//     console.log(data);

// });

// Loading Data from a REALTIME Public API with a fixed time period for fetching/displaying data

// let url2 = "https://whiteboard.datawheel.us/api/google-analytics/realtime/random";

// function loadData() {

//     d3.json(url2).then(function(data) {
//         console.log(data);
//     });

// }

// setInterval(loadData, 1000);