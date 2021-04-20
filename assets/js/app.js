var svgWidth = 975;
var svgHeight = 525;

var margin = {
  top: 25,
  right: 45,
  bottom: 85,
  left: 105
};

var width = svgWidth - margin.left - margin.right + 20;
var height = svgHeight - margin.top - margin.bottom - 20;

// Create an SVG wrapper
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "smokes";
var chosenYAxis = "age";

// updating x-scale 
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// updating y-scale
function yScale(censusData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
    d3.max(censusData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// updating xAxis 
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// updating xAxis upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// new circles
function renderXCircleText(textCircles, newXScale, chosenXAxis) {

  textCircles.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return textCircles;
}

function renderYCircleText(textCircles, newYScale, chosenYAxis) {

  textCircles.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis])+4);

  return textCircles;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xlabel;
  var ylabel;

  if (chosenXAxis === "smokes") {
    xlabel = "Smokers:"
  }
  else if (chosenXAxis === "healthcare") {
    xlabel = "No Healthcare:"
  }
  else {
    xlabel = "Obese:";
  }


  if (chosenYAxis === "age") {
    ylabel = "Age:"
  }
  else if (chosenYAxis === "income") {
    ylabel = "Income:"
  }
  else {
    ylabel = "Poverty:"
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([40, 60])
    .html(function(d) {
      return (`<strong>${d.state}</strong>
              <br>${xlabel} ${d[chosenXAxis]}
              <br>${ylabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


(async function(){
    var censusData = await d3.csv("assets/data/data.csv").catch(err => console.log(err))
    
    // Convert CSV data to integers
    censusData.forEach(function(data) {
      data.id = +data.id;
      data.poverty = +data.poverty;
      data.povertyMoe = +data.povertyMoe;
      data.age = +data.age;
      data.ageMoe = +data.ageMoe;
      data.income = +data.income;
      data.incomeMoe = +data.incomeMoe;
      data.healthcare = +data.healthcare;
      data.healthcareLow = +data.healthcareLow;
      data.healthcareHigh = +data.healthcareHigh;
      data.obesity = +data.obesity;
      data.obesityLow = +data.obesityLow;
      data.obesityHigh = +data.obesityHigh;
      data.smokes = +data.smokes;
      data.smokesLow = +data.smokesLow;
      data.smokesHigh = +data.smokesHigh;
    });
    
    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(censusData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      // .attr("transform")
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.append("g")
      .selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      .attr("fill", "blue")
      .attr("opacity", ".6");

    // append text (state abbreviation) to inside of circles 
    var textCircles = chartGroup.append("g")
      .selectAll("text")
      .data(censusData)
      .enter()
      .append("text")
      .text(d => d.abbr)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis])+4)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .style("fill", "white")
      .attr("font-weight", "bold");

    // x-axis labels
    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 30})`);

    var smokesLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "smokes")
      .classed("active", true)
      .text("Smokers (%)");

    var healthcareLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "healthcare") 
      .classed("inactive", true)
      .text("Lacks Healthcare (%)");      

    var obesityLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "obesity") 
      .classed("inactive", true)
      .text("Obesity (%)");

    // Create group for x-axis labels
    var yLabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)");

    var ageLabel = yLabelsGroup.append("text")
      .attr("y", 0 - margin.left + 15)
      .attr("x", 0 - (height / 2))      
      .attr("value", "age") 
      .classed("active", true)
      .text("Age (Median)");

    var incomeLabel = yLabelsGroup.append("text")
      .attr("y", 0 - margin.left + 35)
      .attr("x", 0 - (height / 2))
      .attr("value", "income")
      .classed("inactive", true)
      .text("Houshold Income (Median)");

    var povertyLabel = yLabelsGroup.append("text")
      .attr("y", 0 - margin.left + 55)
      .attr("x", 0 - (height / 2))
      .attr("value", "poverty")
      .classed("inactive", true)
      .text("Poverty (%)");

    // updateToolTip function
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x event listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
        
        var xValue = d3.select(this).attr("value");
        if (xValue !== chosenXAxis) {

          
          chosenXAxis = xValue;

          
          xLinearScale = xScale(censusData, chosenXAxis);

          // updates x axis
          xAxis = renderXAxes(xLinearScale, xAxis);

          // updates circles
          circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
          textCircles = renderXCircleText(textCircles, xLinearScale, chosenXAxis);

          // tooltips
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          
          if (chosenXAxis === "obesity") {
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "healthcare") {
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
          }
          else {
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        }
      });

    // y event listener
    yLabelsGroup.selectAll("text")
      .on("click", function() {
        // get value
        var yValue = d3.select(this).attr("value");
        if (yValue !== chosenYAxis) {

          chosenYAxis = yValue;

          yLinearScale = yScale(censusData, chosenYAxis);

          yAxis = renderYAxes(yLinearScale, yAxis);

          // updates circless
          circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
          textCircles = renderYCircleText(textCircles, yLinearScale, chosenYAxis);

          // updates tooltips
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          if (chosenYAxis === "income") {
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "poverty") {
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
          }
          else {
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        }
      });
})()
