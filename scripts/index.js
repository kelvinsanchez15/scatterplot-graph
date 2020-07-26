// Fetch json and preprocess data
const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

d3.json(url).then((data) => {
  data.forEach((d) => {
    d["Year"] = new Date(d["Year"] + "T00:00");
    d["Time"] = parseTime(d["Time"]);
  });
  render(data);
});

const parseTime = d3.timeParse("%M:%S");
const formatTime = d3.timeFormat("%M:%S");
const formatYear = d3.timeFormat("%Y");

// SVG layout setup
const width = 600;
const height = 300;
const margin = { top: 30, right: 20, bottom: 35, left: 50 };

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("viewBox", [0, 0, width, height]);

const tooltip = d3
  .select("#chart")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

// Render function
const render = (data) => {
  const xValue = (d) => d["Year"];
  const yValue = (d) => d["Time"];

  const xScale = d3
    .scaleTime()
    .domain([new Date("1993" + "T00:00"), new Date("2016" + "T00:00")])
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleTime()
    .domain([new Date("1900" + "T00:36:35"), new Date("1900" + "T00:39:50")])
    .range([height - margin.bottom, margin.top]);

  // Axes setup
  const xAxis = d3.axisBottom(xScale);
  const xAxisLabel = "Year";

  const yAxis = d3.axisLeft(yScale).tickFormat(formatTime);
  const yAxisLabel = "Time";

  // Time and gdp formatters
  // const formatTimeDate = d3.timeFormat("%Y-%m-%d");
  // const formatTimeTooltipDate = d3.timeFormat("%b, %Y");
  // const formatGdp = d3.format(",");

  // Sequential color scale implementation
  const colorScale = d3
    .scaleSequential()
    .domain([0, d3.max(data, yValue)])
    .interpolator(d3.interpolateCool);

  // Bottom Axis append
  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis);

  // Left Axis append
  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);

  // Left Axis label append
  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr(
      "transform",
      `translate(${margin.left - 40}, ${height / 2})rotate(-90)`
    )
    .text(yAxisLabel)
    .attr("fill", "white");

  // Bottom Axis label append
  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${width / 2}, ${height})`)
    .text(xAxisLabel)
    .attr("fill", "white");

  // Rect (bar) elements append
  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("data-xvalue", xValue)
    .attr("data-yvalue", (d) => d["Time"].toISOString())
    .attr("cx", (d) => xScale(xValue(d)))
    .attr("cy", (d) => yScale(yValue(d)))
    .attr("r", 5)
    .attr("fill", "white")
    .on("mouseover", (d) => {
      let year = formatYear(d["Year"]);

      tooltip.transition().duration(200).style("opacity", 0.9);

      tooltip
        .html(`${year}`)
        .attr("data-year", d["Year"])
        .style("left", d3.event.pageX + 20 + "px")
        .style("top", d3.event.pageY + 20 + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(200).style("opacity", 0);
    });
};
