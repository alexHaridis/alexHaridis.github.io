var url = "https://whiteboard.datawheel.us/api/google-analytics/realtime/random";
var frequency = 1 * 1000;

var margin = {
    top: 20,
    right: 100,
    bottom: 100,
    left: 40
};

var dataMax = 10;
var data = [];

var width = window.innerWidth;
var height = window.innerHeight;
var chartWidth = width - margin.left - margin.right;
var chartHeight = height - margin.top - margin.bottom;

var scaleWidth = 300;
var scaleHeight = 20;
var scaleX = margin.left + chartWidth / 2 - scaleWidth / 2;
var scaleY = margin.top + chartHeight + 40;

var svg = d3.select("#chart")
            .attr("width", width)
            .attr("height", height);

var scale = svg.select("#scale")
               .attr("transform", "translate(" + scaleX + ", " + scaleY + ")");

scale.select("#scaleRect")
     .attr("width", scaleWidth)
     .attr("height", scaleHeight);

var legendX = margin.left + chartWidth;
var legendY = margin.top;
var legendSize = 20;

var legend = svg.select("#legend")
                .attr("transform", "translate(" + legendX + ", " + legendY + ")");

var dataRange = d3.range(1, dataMax + 1);

var x = d3.scaleBand()
          .domain(dataRange.reverse())
          .range([margin.left, margin.left + chartWidth])
          .paddingInner(0.1)
          .paddingOuter(0.2);

var barWidth = x.bandwidth();

function fetchData() {
    d3.json(url, function(error, users) {

        data.unshift({
            users: users,
            timestamp: new Date()
        });

        if (data.length > dataMax) data.pop();
        console.log(data);

        if (data.length === dataMax) clearInterval(myInterval);

        var maxUsers = d3.max(data, function(d) {
            return d.users;
        });

        var minUsers = d3.min(data, function(d) {
            return d.users;
        });

        // Color Scale Stuff
        var barColor = d3.scaleSequential(d3.interpolateViridis)
                        .domain([0, maxUsers]);

        var stopsData = d3.range(0, 1.1, 0.1);

        svg.select("#colorGradient").selectAll("stop")
        .data(stopsData).enter()
        .append("stop")
        .attr("offset", function(d) {
                return d * 100 + "%";
        })
        .attr("stop-color", function(d) {
                return barColor(d * maxUsers);
        });

        var scaleX = d3.scaleLinear()
            .domain([0, maxUsers])
            .range([0, scaleWidth]);

        var scaleAxis = d3.axisBottom(scaleX);

        scale.select("#scaleAxis")
            .attr("transform", "translate(0, " + scaleHeight + ")")
            .transition().duration(frequency / 2)
            .call(scaleAxis);

        // Color Legend Stuff
        var legendData = data.map(function(d) {
            return d.users;
        });

        legendData = legendData
            .filter(function(d, i) {
                return legendData.indexOf(d) === i;
            })
            .sort(function(a, b) {
                return b - a;
            });

        var legendRects = legend.selectAll("rect")
                                .data(legendData);

        var legendRectsEnter = legendRects.enter().append("rect");

        legendRects.merge(legendRectsEnter)
                .attr("x", 0)
                .attr("y", function(d, i) {
                    return i * legendSize + i * 10;
                })
                .attr("fill", barColor)
                .attr("width", legendSize)
                .attr("height", legendSize);

        var legendTexts = legend.selectAll("text")
                                .data(legendData);

        var legendTextsEnter = legendTexts.enter().append("text")
                                        .attr("baseline-shift", "-100%");

        legendTexts.merge(legendTextsEnter)
                .attr("x", legendSize + 5)
                .attr("y", function(d, i) {
                        return i * legendSize + i * 10;
                })
                .text(function(d) {
                        return d;
                });

        // Bar Chart Stuff
        var barHeight = d3.scaleLinear()
                        .domain([0, maxUsers])
                        .range([0, chartHeight]);

        var y = d3.scaleLinear()
                .domain([0, maxUsers])
                .range([margin.top + chartHeight, margin.top]);

        var yAxis = d3.axisLeft(y);

        svg.select("#y")
        .attr("transform", "translate(" + margin.left + ",0)")
        .transition().duration(frequency / 2)
        .call(yAxis);

        var xAxis = d3.axisBottom(x)
        .tickFormat(function(d) {

            var dataPoint = data[d - 1];
            if (dataPoint) {
                var time = dataPoint.timestamp;
                var diff = new Date() - time;
                var secondsAgo = Math.round(diff / 1000);
                
                if (secondsAgo == 0) return "Now";
                    else {
                        var word = secondsAgo == 1 ? "second" : "seconds";
                        return secondsAgo + " " + word + " ago";
                    }
            }
            else {
                return "";
            }

        });

        svg.select("#x")
        .attr("transform", "translate(0," + y(0) + ")")
        .transition().duration(frequency / 2)
        .call(xAxis);

        function zeroState(selection) {
            selection
                .attr("height", 0)
                .attr("y", y(0));
        }

        // Bar data binding
        var bars = svg.select("#shapes").selectAll(".bar")
                    .data(data, function(d) {
                        return d.timestamp;
                    });

        // Bar "enter" events and animation
        bars.enter().append("rect")
            .attr("class", "bar")
            .call(zeroState)
            .attr("width", barWidth)
            .attr("x", function(d, i) {
                return x(i + 1);
            })
            .attr("fill", function(d) {
                return barColor(d.users);
            })
            .transition().duration(frequency / 2)
            .attr("height", function(d) {
                return barHeight(d.users);
            })
            .attr("y", function(d) {
                return y(d.users);
            });

        // Bar "update" events and animation
        bars.transition().duration(frequency / 2)
        .attr("fill", function(d) {
            return barColor(d.users);
        })
        .attr("height", function(d) {
            return barHeight(d.users);
        })
        .attr("x", function(d, i) {
            return x(i + 1);
        })
        .attr("y", function(d) {
            return y(d.users);
        });

        // Bar "exit" events and animation
        bars.exit()
            .transition().duration(frequency / 2)
            .call(zeroState)
            .remove();

    });
}

fetchData();

var myInterval = setInterval(fetchData, frequency);