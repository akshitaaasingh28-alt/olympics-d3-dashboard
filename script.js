
d3.csv("olympics_dashboard_final.csv").then(data => {
  data.forEach(d => d.MedalCount = +d.MedalCount);
  const svgOverview = d3.select("#overview"),
        svgDetails = d3.select("#details"),
        marginO = {top: 20, right: 20, bottom: 40, left: 50},
        marginD = {top: 30, right: 20, bottom: 50, left: 60},
        widthO = +svgOverview.attr("width") - marginO.left - marginO.right,
        heightO = +svgOverview.attr("height") - marginO.top - marginO.bottom,
        widthD = +svgDetails.attr("width") - marginD.left - marginD.right,
        heightD = +svgDetails.attr("height") - marginD.top - marginD.bottom;

  const gOverview = svgOverview.append("g").attr("transform", `translate(${marginO.left},${marginO.top})`);
  const gDetails = svgDetails.append("g").attr("transform", `translate(${marginD.left},${marginD.top})`);

  const years = [...new Set(data.map(d => d.Year))];
  const countries = [...new Set(data.map(d => d.Country))];
  const color = d3.scaleOrdinal().domain(countries).range(d3.schemeSet3);

  const totals = d3.rollups(data, v => d3.sum(v, d => d.MedalCount), d => d.Year)
                   .map(([Year, Total]) => ({Year, Total}));

  const xO = d3.scaleBand().domain(years).range([0, widthO]).padding(0.3);
  const yO = d3.scaleLinear().domain([0, d3.max(totals, d => d.Total)]).nice().range([heightO, 0]);

  gOverview.append("g").attr("transform", `translate(0,${heightO})`).call(d3.axisBottom(xO));
  gOverview.append("g").call(d3.axisLeft(yO));

  gOverview.selectAll("rect")
    .data(totals)
    .enter().append("rect")
    .attr("x", d => xO(d.Year))
    .attr("y", d => yO(d.Total))
    .attr("width", xO.bandwidth())
    .attr("height", d => heightO - yO(d.Total))
    .attr("fill", "#4682B4")
    .on("click", (event, d) => drawDetails(d.Year));

  function drawDetails(year) {
    d3.select("#detail-title").text(`Medal Count by Country for ${year}`);
    const filtered = data.filter(d => d.Year === year);
    const x = d3.scaleBand().domain(countries).range([0, widthD]).padding(0.25);
    const y = d3.scaleLinear().domain([0, d3.max(filtered, d => d.MedalCount)]).nice().range([heightD, 0]);

    gDetails.selectAll("*").remove();
    gDetails.append("g").attr("transform", `translate(0,${heightD})`).call(d3.axisBottom(x));
    gDetails.append("g").call(d3.axisLeft(y));

    gDetails.selectAll("rect")
      .data(filtered)
      .enter().append("rect")
      .attr("x", d => x(d.Country))
      .attr("y", d => y(d.MedalCount))
      .attr("width", x.bandwidth())
      .attr("height", d => heightD - y(d.MedalCount))
      .attr("fill", d => color(d.Country));
  }
});
