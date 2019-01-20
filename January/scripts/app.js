const margin = 10;
const minWeight = 5;

Promise.all([
	d3.json("data/world.json"),
	d3.csv("data/oldest_people.csv")
]).then((values) => {
		const sourceData = values[1];
		const mapData = topojson.presimplify(values[0]);

		// prepare container
		const container = d3.select(".map");
		const size = container.node().getBoundingClientRect();
		const width = size.width - margin;
		const height = size.height - margin;
		const svg = container
					.append("svg")
					.attr("width", width)
					.attr("height", height);

		//prepare & render world map
		const projection = d3.geoFahey()
								.scale(width / 2 / Math.PI)
      							.translate([width / 2, height / 2])

		const geo = topojson.simplify(mapData, minWeight);
		const countries = topojson.feature(geo, geo.objects.countries).features;
		const geoPath = d3.geoPath().projection(projection);

		svg.append("g")
        	.selectAll("path", ".country")
            .data(countries)
                .enter()
            .append("path")
            	.attr("class", "country")
                .attr("d", geoPath);

	}).catch((e) => console.error(error))