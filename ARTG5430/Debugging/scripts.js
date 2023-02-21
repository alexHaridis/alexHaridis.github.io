d3.csv("test.csv").then(function(data){
    var subgroups = data.columns.slice(1);
    var groups = d3.map(data, function(d){return(d.group)}).keys();

    console.log(subgroups);
    console.log(groups);
});

d3.csv("new.csv").then(function(data) {

    /*DEFINE DIMENSIONS OF SVG + CREATE SVG CANVAS*/
    const width = document.querySelector("#chart").clientWidth;
    const height = document.querySelector("#chart").clientHeight;
    const margin = {top: 50, left: 100, right: 50, bottom: 100};

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    /* FILTER THE DATA */

    let subgroups = ["1900", "2000"];
    // let groups = d3.map(data, function(d){ if (d.Sex === '1' && d.Year === '1900' ){ return d.Age } }).keys();
    let groups = ["0","5","10","15","20","25","30","30","35","40","45","50","55","60","65","70","75","80","85","90"].keys();
    // console.log(groups);

    let filtered_data_sex_1900 = data.filter(function(d) {
        return d.Sex === '1' && d.Year === '1900';
    });

    let filtered_data_sex_2000 = data.filter(function(d) {
        return d.Sex === '1' && d.Year === '2000';  
    });

    /*DETERMINE MIN AND MAX VALUES OF VARIABLES*/
    const pop1900 = {
        min: d3.min(filtered_data_sex_1900, function(d) { return +d.People; }),
        max: d3.max(filtered_data_sex_1900, function(d) { return +d.People; }),
       
    };
    
    const pop2000 = {
        min: d3.min(filtered_data_sex_2000, function(d) { return +d.People; }),
        max: d3.max(filtered_data_sex_2000, function(d) { return +d.People; })
    };

    /*CREATE SCALES*/
    const xScale = d3.scaleBand()
        .domain(groups)
        .range([margin.left, width-margin.right])
        .padding(0.5);

    const yScale = d3.scaleLinear()
        .domain([0, pop2000.max])
        .range([height-margin.bottom, margin.top]);

    const xSubgroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, xScale.bandwidth()])
        .padding(0.02);

    /*DRAW AXES*/
    const xAxis = svg.append("g")
        .attr("class","axis")
        .attr("transform", `translate(0,${height-margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    const yAxis = svg.append("g")
        .attr("class","axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));

    
    /*DRAW BARS*/
    const points1900 = svg.selectAll("rect")
        .data(filtered_data_sex_1900)                                                               /* Joins data to the selected elements which is all the rectangles in this case */
        .enter()                                                                                    /* Creates a selection with placeholder references for missing elements */
        .append("rect")                                                                             /* Create rectangles in each place holder */
        .attr("x", function(d) { return xScale(d.Age); })
        .attr("y", function(d) { return yScale(d.People); })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) { return height - margin.bottom - yScale(d.People); })
        .attr("fill", "orange");

    const points2000 = svg.selectAll("rect")
        .data(filtered_data_sex_2000)                                                                        /* Joins data to the selected elements which is all the rectangles in this case */
        .enter()                                                                                    /* Creates a selection with placeholder references for missing elements */
        .append("rect")                                                                             /* Create rectangles in each place holder */
        .attr("x", function(d) { return xScale(d.Age); })
        .attr("y", function(d) { return yScale(d.People); })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) { return height - margin.bottom - yScale(d.People); })
        .attr("fill", "steelblue");
    
    /*DRAW AXIS LABELS*/
    const xAxisLabel = svg.append("text")
        .attr("class","axisLabel")
        .attr("x", width/2)
        .attr("y", height-margin.bottom/2)
        .text("Age Group");

    const yAxisLabel = svg.append("text")
        .attr("class","axisLabel")
        .attr("transform","rotate(-90)")
        .attr("x",-height/2)
        .attr("y",margin.left/2)
        .text("Population");

});





































// d3.csv("new.csv")
//     .then(function(data) { 

        // /* DEFINE DIMENSIONS OF SVG + CREATE SVG CANVAS*/

        // const width = document.querySelector("#chart").clientWidth;
        // const height = document.querySelector("#chart").clientHeight;
        // const margin = {top: 50, left: 100, right: 50, bottom: 100};

        // const svg = d3.select("#chart")
        //     .append("svg")
        //     .attr("width", width)
        //     .attr("height", height);

        // /* DETERMINE MIN AND MAX VALUES OF VARIABLES */
        // const malePop1900 = {
        //     min: d3.min(d.Male1900),
        //     max: d3.max(d.Male1900)
        // };

        // const malePop2000 = {
        //     min: d3.min(d.Male2000),
        //     max: d3.max(d.Male2000)
        // };

        // /*CREATE SCALES */
        // const xScale = d3.scaleBand()
        //     .domain(["0","5","10","15","20","25","30","30","35","40","45","50","55","60","65","70","75","80","85","90"])
        //     .range([margin.left, width-margin.right])
        //     .padding(0.5);

        // const yScale = d3.scaleLinear()
        //     .domain([0, malePop2000.max])
        //     .range([height-margin.bottom, margin.top]);
       
        // /* DRAW AXES*/
        // const xAxis = svg.append("g")
        //     .attr("class","axis")
        //     .attr("transform", `translate(0,${height-margin.bottom})`)
        //     .call(d3.axisBottom().scale(xScale));

        // const yAxis = svg.append("g")
        //     .attr("class","axis")
        //     .attr("transform", `translate(${margin.left},0)`)
        //     .call(d3.axisLeft().scale(yScale));

        // /* DRAW*/
        // const points1 = svg.selectAll("rect")
        //     .data(filtered_data)                                                                        /* Joins data to the selected elements which is all the rectangles in this case */
        //     .enter()                                                                                    /* Creates a selection with placeholder references for missing elements */
        //     .append("rect")                                                                             /* Create rectangles in each place holder */
        //     .attr("x", function(d) { return xScale(d.Age); })
        //     .attr("y", function(d) { return yScale(d.Male1900); })
        //     .attr("width", xScale.bandwidth())
        //     .attr("height", function(d) { return height - margin.bottom - yScale(d.lifeExp); })
        //     .attr("fill", "steelblue");

        // // const points2 = svg.selectAll("rect")
        // //     .data(filtered_data)                                                                        /* Joins data to the selected elements which is all the rectangles in this case */
        // //     .enter()                                                                                    /* Creates a selection with placeholder references for missing elements */
        // //     .append("rect")                                                                             /* Create rectangles in each place holder */
        // //     .attr("x", function(d) { return xScale(d.Age); })
        // //     .attr("y", function(d) { return yScale(d.Male2000); })
        // //     .attr("width", xScale.bandwidth())
        // //     .attr("height", function(d) { return height - margin.bottom - yScale(d.lifeExp); })
        // //     .attr("fill", "yellow");

        // /* DRAW AXIS LABELS*/
        // const xAxisLabel = svg.append("text")
        //     .attr("class","axisLabel")
        //     .attr("x", width/2)
        //     .attr("y", height-margin.bottom/2)
        //     .text("Age");

        // const yAxisLabel = svg.append("text")
        //     .attr("class","axisLabel")
        //     .attr("transform","rotate(-90)")
        //     .attr("x",-height/2)
        //     .attr("y",margin.left/2)
        //     .text("Male Population");

    // });
    