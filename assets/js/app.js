// Define SVG attribute variables
var width = parseInt(d3.select('#scatter')
    .style("width"));

var height = width * 2/3;
var margin = 20;
var labelArea = 110;
var padding = 45;

// Create SVG container 
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

// Labels for axes

// x-axis 
svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");

// Transform attribute to adjust for xText
var bottomTextX =  (width - labelArea)/2 + labelArea;
var bottomTextY = height - margin - padding;
xText.attr("transform",`translate(
    ${bottomTextX}, 
    ${bottomTextY})`
    );

// x-axis xText details 
xText.append("text")
    .attr("y", -19)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class","aText active x")
    .text("In Poverty (%)");

xText.append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Age (Median)");

xText.append("text")
    .attr("y", 19)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Household Income (Median)");

// y-axis 
svg.append("g").attr("class", "yText");
var yText = d3.select(".yText");

// Transform attribute to adjust for yText
var leftTextX =  margin + padding;
var leftTextY = (height + labelArea) / 2 - labelArea;
yText.attr("transform",`translate(
    ${leftTextX}, 
     ${leftTextY}
    )rotate(-90)`
    );

// y-axis yText details 
yText .append("text")
    .attr("y", -22)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)");

yText .append("text")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");

yText .append("text")
    .attr("y", 22)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Lacks Healthcare (%)");
    
// Define circle radius for data dynamically  
var cRadius;
function adjustRadius() {
  if (width <= 530) {
    cRadius = 7;}
  else { 
    cRadius = 10;}
}
adjustRadius();

// Read in data as promise
d3.csv("assets/data/data.csv").then(function(data) {
    visualize(data);
});

function visualize (rawData) {
   var xMin;
   var xMax;
   var yMin;
   var yMax;

   // Current X & Y default selections
   var currentX = "poverty";
   var currentY = "obesity";

   // Tool Tip box (state, X axis stats,  Y axis stats)
   var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(function(d) {
            //Build text box
            var stateLine = `<div>${d.state}</div>`;
            var yLine = `<div>${currentY}: ${d[currentY]}%</div>`;
            if (currentX === "poverty") {
                xLine = `<div>${currentX}: ${d[currentX]}%</div>`}          
            else {
                xLine = `<div>${currentX}: ${parseFloat(d[currentX]).toLocaleString("en")}</div>`;}             
            return stateLine + xLine + yLine  
        });

    // Add Tool Tip to svg
    svg.call(toolTip);

    // Update upon axis option clicked
    function  labelUpdate(axis, clickText) {
        // Switch active to inactive
        d3.selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);
    
        //Switch the text just clicked to active
        clickText.classed("inactive", false).classed("active", true);
        }

    // Find the data max & min values for scaling
    function xMinMax() {
      xMin = d3.min(rawData, function(d) {
        return parseFloat(d[currentX]) * 0.85;
      });
      xMax = d3.max(rawData, function(d) {
        return parseFloat(d[currentX]) * 1.15;
      });     
    }

    function yMinMax() {
      yMin = d3.min(rawData, function(d) {
        return parseFloat(d[currentY]) * 0.85;
      });
      yMax = d3.max(rawData, function(d) {
        return parseFloat(d[currentY]) * 1.15;
      }); 
    }

    // Scatter Plot X & Y axis 
    xMinMax();
    yMinMax();

    var xScale = d3 
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin])

    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin])

    // Create Scaled X and Y axis
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // Calculate X and Y tick counts
    function tickCount() {
      if (width <= 500) {
         xAxis.ticks(5);
         yAxis.ticks(5);
      }
      else {
          xAxis.ticks(10);
          yAxis.ticks(10);
      }        
    }
    tickCount();

    // Append axis to svg 
    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(
            0, 
            ${height - margin - labelArea})`
        );

    svg.append("g")
        .call(yAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(
            ${margin + labelArea}, 
            0 )`
        );

    // Append the circles for each row of data
    var allCircles = svg.selectAll("g allCircles").data(rawData).enter();

    allCircles.append("circle")
        .attr("cx", function(d) {
            return xScale(d[currentX]);
        })
        .attr("cy", function(d) {
            return yScale(d[currentY]);
        })
        .attr("r", cRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
        .on("mouseover", function(d) {
            // Show tooltip when mouse is on circle
            toolTip.show(d, this);
            // Highlight circle border
            d3.select(this).style("stroke", "#323232");
        })
        .on("mouseout", function (d) {
            // Remove the tooltip
            toolTip.hide(d);
            // Remove the highlight
            d3.select(this).style("stroke", "#e3e3e3")
        });

        // Display state text on circles 
        allCircles
            .append("text")
            .attr("font-size", cRadius)
            .attr("class", "stateText")

            .attr("dx", function(d) {
               return xScale(d[currentX]);
            })
            .attr("dy", function(d) {
              return yScale(d[currentY]) + cRadius /3;
            })
            .text(function(d) {
                return d.abbr;
              })

            .on("mouseover", function(d) {
                toolTip.show(d);
                d3.select("." + d.abbr).style("stroke", "#323232");
            })

            .on("mouseout", function(d) {
                toolTip.hide(d);
                d3.select("." + d.abbr).style("stroke", "#e3e3e3");
            });

          // Dynamically plot graph on clicking the x & y variables
          d3.selectAll(".aText").on("click", function() {
              var self = d3.select(this)

              // Select inactive
              if (self.classed("inactive")) {
                // Display name and axis from the label
                var axis = self.attr("data-axis")
                var name = self.attr("data-name")

                if (axis === "x") {
                  currentX = name;

                  // Update min and max of domain(x)
                  xMinMax();
                  xScale.domain([xMin, xMax]);

                  svg.select(".xAxis")
                        .transition().duration(800)
                        .call(xAxis);
                  
                  // Update location of the circles
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cx", function(d) {
                            return xScale(d[currentX])                
                        });
                  });   

                  d3.selectAll(".stateText").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("dx", function(d) {
                            return xScale(d[currentX])                          
                        });
                  });          
                  // Update click label
                  labelUpdate(axis, self);
                }

                 // Update for Y axis selection 
                else {
                  currentY = name;

                  // Update min and max of (y)range
                  yMinMax();
                  yScale.domain([yMin, yMax]);

                  svg.select(".yAxis")
                        .transition().duration(800)
                        .call(yAxis);

                  // Update location of the circles
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cy", function(d) {
                            return yScale(d[currentY])                
                        });                       
                  });   

                  d3.selectAll(".stateText").each(function() {
                      d3.select(this)
                        .transition().duration(800)
                        .attr("dy", function(d) {

                           // Center text
                            return yScale(d[currentY]) + cRadius/3;                          
                        });
                  });

                  // change the classes and clicked label
                  labelUpdate(axis, self);
                }
              }
          });
}




















