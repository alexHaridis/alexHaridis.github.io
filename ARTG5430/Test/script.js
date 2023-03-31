const margin = {
    top: 50, 
    left: 100, 
    right: 50, 
    bottom: 100
};

d3.csv("./data/gapminder.csv").then(function(results) {
    createCharts(results);
});

function createCharts(data) {

    let filtered_USAData = data.filter(function(d) {
        return d.country === "United States";
    });

    let filtered_CanadaData = data.filter(function(d) {
        return d.country === "Canada";
    });

    /**
     * Initialize the charts using a default value for country, e.g., "USA"
     */
    chartA(filtered_USAData, "USA");
    chartB(filtered_USAData, "USA");

    d3.selectAll(".select").on("change", function() {
        var country = d3.selectAll(".select").property("value");
        if (country === "USA") {
            chartA.update(filtered_USAData, "USA");
            chartB.update(filtered_USAData, "USA");
        } else {
            chartA.update(filtered_CanadaData, "Canada");
            chartB.update(filtered_CanadaData, "Canada");
        }
    })

}

// Life Expectancy Chart: Years - X Axis, Life Exp - Y Axis
function chartA(data, country) {

    var width  = 800 - (margin.left + margin.right);
    var height = 550 - (margin.top + margin.bottom);

    const svg = d3.select("#charts")
        .append("svg")
        .attr("class", "lifeExpChart")
        .attr("width", width)
        .attr("height", height);

    function assignColor(country) {
        // If country is "Canada"
        if (country === "Canada") {
            return "#FFBD00";
        }
        // Otherwise, default is "USA"
        return "#FF0054";
    }

    const lifeExp = {
        min: d3.min(data, function(d) { return +d.lifeExp; }),
        max: d3.max(data, function(d) { return +d.lifeExp; })
    };

    const xScale = d3.scaleBand()
        .domain(["1952","1957","1962","1967","1972","1977","1982","1987","1992","1997","2002","2007"])
        .range([margin.left, width-margin.right])
        .padding(0.5);

    const yScale = d3.scaleLinear()
        .domain([50, lifeExp.max])
        .range([height-margin.bottom, margin.top]);

    const xAxis = svg.append("g")
        .attr("class","axis--x")
        .attr("transform", `translate(0,${height-margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    const yAxis = svg.append("g")
        .attr("class","axis--y")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));

    update(data, country);

    function update(data, country) {

        var bars = svg.selectAll(".lifeExpBars")
                    .data(data, function(d){
                        return d.country;
                    });

        bars.join(
            function(enter) {
                return enter.append("rect")
                            .attr("class", "lifeExpBars")
                            .attr("x", function(d) { return xScale(d.year); })
                            .attr("y", function(d) { return yScale(d.lifeExp); })
                            .attr("width", xScale.bandwidth())
                            .attr("height", 0)
                            .transition().duration(700)
                            .attr("height", function(d) { return height - (margin.bottom + yScale(d.lifeExp)); })
                            .attr("fill", assignColor(country));
            },
            function(update){
                return update.transition().duration(700);
            },
            function(exit){
                return exit.transition().duration(700)
                        .attr("height", "0")
                        .remove();
            }
        );

    }

    chartA.update = update;

}

function chartB(data, country) {

    var width  = 880 - (margin.left + margin.right);
    var height = 550 - (margin.top + margin.bottom);

    const svg = d3.select("#charts")
                .append("svg")
                .attr("class", "lifeExpChart")
                .attr("width", width)
                .attr("height", height);

    function assignColor(country) {
        // If country is "Canada"
        if (country === "Canada") {
            return "#FFBD00";
        }
        // Otherwise, default is "USA"
        return "#FF0054";
    }

    const pop = {
        min: d3.min(data, function(d) { return +d.pop; }),
        max: d3.max(data, function(d) { return +d.pop; })
    };

    const xScale = d3.scaleBand()
        .domain(["1952","1957","1962","1967","1972","1977","1982","1987","1992","1997","2002","2007"])
        .range([margin.left, width-margin.right])
        .padding(0.5);

    var yScale = d3.scaleLinear()
        .domain([pop.min, pop.max]).nice()
        .range([height-margin.bottom, margin.top]);

    const xAxis = svg.append("g")
    .attr("class","axis--x")
    .attr("transform", `translate(0,${height-margin.bottom})`)
    .call(d3.axisBottom().scale(xScale));

    const yAxis = svg.append("g")
        .attr("class","axis--y")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));

    update(data, country);

    function update(data, country) {

        /**
         * Update the left axis of the second bar chart to reflect
         * a different population range (because the country is changed)
         */
        pop.min = d3.min(data, function(d) { return +d.pop; });
        pop.max = d3.max(data, function(d) { return +d.pop; });

        yScale = d3.scaleLinear()
            .domain([pop.min, pop.max]).nice()
            .range([height-margin.bottom, margin.top]);

        yAxis.call(d3.axisLeft().scale(yScale));

        /**
         * Update the rectangles based on the new data
         */
        var bars = svg.selectAll(".secondBars")
                    .data(data, function(d){
                        return d.country;
                    });

        bars.join(
            function(enter) {
                return enter.append("rect")
                            .attr("class", "secondBars")
                            .attr("x", function(d) { return xScale(d.year); })
                            .attr("y", function(d) { return yScale(d.pop); })
                            .attr("width", xScale.bandwidth())
                            .attr("height", 0)
                            .transition().duration(700)
                            .attr("height", function(d) { return height - (margin.bottom + yScale(d.pop)); })
                            .attr("fill", assignColor(country));
            },
            function(update){
                return update.transition().duration(700);
            },
            function(exit){
                return exit.transition().duration(700)
                        .attr("height", "0")
                        .remove();
            }
        )
        
    }

    chartB.update = update;

}