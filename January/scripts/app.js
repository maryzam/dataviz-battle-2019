const margin = 10;
const minWeight = 5;

const parseCoords = (coords) => {
	return coords.replace("[", "")
		.replace("]", "")
		.split(",")
		.map((part) => +part);
}

Promise.all([
	d3.json("data/world.json"),
	d3.tsv("data/oldest_people.tsv")
]).then((values) => {
		const oldPeople = values[1];
		oldPeople.forEach((person) => {
			person.BirthplaceCoords = parseCoords(person.BirthplaceCoords);
			person.DeathplaceCoords = parseCoords(person.DeathplaceCoords);
		});
		const worldMap = topojson.presimplify(values[0]);

		// prepare container
		const container = d3.select(".map");
		const size = container.node().getBoundingClientRect();
		const width = size.width - margin;
		const height = size.height - margin;
		const svg = container
					.append("svg")
					.attr("width", width)
					.attr("height", height);
		//add defs
		svg
			.append("defs")
			.append("marker")
				.attr("id", "arrow")
				.attr('markerHeight', 5)
		        .attr('markerWidth', 5)
		        .attr('markerUnits', 'strokeWidth')
		        .attr('orient', 'auto')
		        .attr('refX', 0)
		        .attr('refY', 0)
		    .append("path")
		    	.attr("d", "M 0,0 m -5,-5 L 5,0 L -5,5 Z")
		    	.style("fill", "blue");

		//prepare & render world map
		const projection = d3.geoFahey()
								.scale(width / 2 / Math.PI)
      							.translate([width / 2, height / 2])

		const geo = topojson.simplify(worldMap, minWeight);
		const countries = topojson.feature(geo, geo.objects.countries).features;
		const geoPath = d3.geoPath().projection(projection);

		svg.append("g")
        	.selectAll("path", ".country")
            .data(countries)
                .enter()
            .append("path")
            	.attr("class", "country")
                .attr("d", geoPath);


        // render lifepath
        const offsets = {};

        const lifePath = (d) => {
        	let offset = 30;
        	if (d.Birthplace === d.Deathplace) 
        	{
        		offsets[d.Birthplace] = (offsets[d.Birthplace] || 30) + 5;
        		offset = offsets[d.Birthplace];
        	}
        	const from = projection([d.BirthplaceCoords[1],d.BirthplaceCoords[0]]);
        	const till = projection([d.DeathplaceCoords[1],d.DeathplaceCoords[0]]);

        	return `M ${from[0]} ${from[1]} C ${from[0] - offset} ${from[1] - offset} ${till[0] + offset} ${till[1] - offset} ${till[0]} ${till[1]}`;
        };

		const lifes = svg
        				.append("g")
        				.selectAll("g", "life")
        				.data(oldPeople)
        					.enter()
        				.append("g")
        					.attr("class", (d) => `life ${ (d.Sex === "F") ? "female" : "male" }`);
        lifes
        	.append("path")
        	.attr("d", lifePath);

        /*
        const starPath = d3.symbol()
        					.type(d3.symbolStar)
        					.size(30);
        lifes
        	.append("path")
        		.attr("class", "star")
        		.attr("d", starPath)
        		.attr("transform", (d) => {
        			const till = projection([d.DeathplaceCoords[1],d.DeathplaceCoords[0]]);
        			return `translate(${till[0]} ${till[1]})`;
        		}); */

	}).catch((e) => console.error(error))