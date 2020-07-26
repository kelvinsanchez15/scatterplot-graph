// Fetch json and preprocess data
const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

d3.json(url).then((dataset) => {
  dataset.data.forEach((d) => {
    d[0] = new Date(d[0] + "T00:00");
  });
  render(dataset);
});

// SVG layout setup
const width = 600;
const height = 300;
const margin = { top: 30, right: 10, bottom: 30, left: 20 };

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
const render = (dataset) => {
  const xValue = (d) => d[0];

  const yValue = (d) => d[1];

  const bandwidth = width / dataset.data.length;

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataset.data, xValue))
    .range([margin.left, width - margin.right - bandwidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset.data, yValue)])
    .range([height - margin.bottom, margin.top]);

  // Axes setup
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")).ticks(5);

  const yAxis = d3
    .axisRight(yScale)
    .tickSize(width - margin.right - margin.left);

  const yAxisLabel = "Gross Domestic Product";

  const customXAxis = (g) => {
    g.call(xAxis);
    g.select(".domain").remove();
  };

  const customYAxis = (g) => {
    g.call(yAxis);
    g.select(".domain").remove();
    g.selectAll(".tick:not(:first-of-type) line")
      .attr("stroke", "#777")
      .attr("stroke-dasharray", "2,2");
    g.selectAll(".tick text").attr("x", 4).attr("dy", -4);
  };

  // Time and gdp formatters
  const formatTimeDate = d3.timeFormat("%Y-%m-%d");
  const formatTimeTooltipDate = d3.timeFormat("%b, %Y");
  const formatGdp = d3.format(",");

  // Sequential color scale implementation
  const colorScale = d3
    .scaleSequential()
    .domain([0, d3.max(dataset.data, yValue)])
    .interpolator(d3.interpolateCool);

  // Bottom Axis append
  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(customXAxis);

  // Left Axis append
  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(customYAxis);

  // Left Axis label append
  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr(
      "transform",
      `translate(${margin.left - 10}, ${height / 2})rotate(-90)`
    )
    .text(yAxisLabel)
    .attr("fill", "white");

  // Rect (bar) elements append
  svg
    .selectAll("rect")
    .data(dataset.data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("data-date", (d) => formatTimeDate(d[0]))
    .attr("data-gdp", yValue)
    .attr("x", (d) => xScale(xValue(d)))
    .attr("y", (d) => yScale(yValue(d)))
    .attr("width", bandwidth)
    .attr("height", (d) => yScale(0) - yScale(yValue(d)))
    .attr("fill", (d) => colorScale(d[1]))
    .on("mouseover", (d) => {
      let date = formatTimeTooltipDate(d[0]);
      let gdp = formatGdp(d[1]);

      tooltip.transition().duration(200).style("opacity", 0.9);

      tooltip
        .html(`${date}<br />$${gdp} billion`)
        .attr("data-date", formatTimeDate(d[0]))
        .style("left", d3.event.pageX + 20 + "px")
        .style("top", d3.event.pageY + 20 + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(200).style("opacity", 0);
    });
};
