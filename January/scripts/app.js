const margin = 10;
const minWeight = 5;

Promise.all([
	d3.json("data/world.json"),
	d3.json("data/oldest_people.json")
]).then((values) => {
		const worldMap = topojson.presimplify(values[0]);
		const oldPeople = values[1];

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
        	const from = projection(d.BirthplaceCoords);
        	const till = projection(d.DeathplaceCoords);

        	let qHeight = 0;
        	let offset = 50;
        	if (d.Birthplace === d.Deathplace) {
        		offsets[d.Birthplace] = (offsets[d.Birthplace] || 10) + 5;
        		offset = offsets[d.Birthplace];
        		qHeight = from[1] + offset;
        	} else {
        		qHeight = Math.max(from[1], till[1]) + offset;
        	}

        	return `M ${from[0]} ${from[1]} C ${from[0] - offset} ${qHeight} ${till[0] + offset} ${qHeight} ${till[0]} ${till[1]}`;
        };

        svg
        	.append("defs")
        	.selectAll("path")
        	.data(oldPeople.filter((d) => d.Birthplace !== d.Deathplace))
        		.enter()
        	.append("path")
        		.attr("id", (d) => `textPath_${d.Order}`)
        		.attr("d", lifePath);

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



        lifes
        	.filter((d) => d.Birthplace !== d.Deathplace)
        	.append("text")
        		.attr("dy", "3.5px")
        	.append("textPath")
        	.text("▶")
        	.attr("xlink:href", (d) => `#textPath_${d.Order}`)
        	.attr("startOffset", "30%");

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