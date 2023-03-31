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

    /**
     * It is important to have a single .on() event method but update
     * BOTH charts when it is activated.
     */
    d3.selectAll(".select").on("change", function() {
        var country = d3.selectAll(".select").property("value");

        // Here, alternate between two different filtered datasets based
        // on what country is selected by the user. For each country, update
        // both charts.
        if (country === "USA") {
            chartA.update(filtered_USAData, "USA");
            chartB.update(filtered_USAData, "USA");
        } else {
            chartA.update(filtered_CanadaData, "Canada");
            chartB.update(filtered_CanadaData, "Canada");
        }
    })

}

// Scaffold for first chart to update
function chartA(data, country) {

    update(data, country);

    function update(data, country) {

    }

    chartA.update = update;

}

// Scaffold for second chart to update
function chartB(data, country) {

    update(data, country);

    function update(data, country) {
        
    }

    chartB.update = update;

}