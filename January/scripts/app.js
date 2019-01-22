const margin = 10;
const minWeight = 5;
const animDuration = 200;

const formatPlace = (d) => {
	return (d.Birthplace == d.Deathplace) ? d.Birthplace : `${d.Birthplace} / ${d.Deathplace}`;
}

Promise.all([
	d3.json("data/world.json"),
	d3.json("data/oldest_people.json")
]).then((values) => {
		const worldMap = topojson.presimplify(values[0]);
		const oldPeople = values[1];
		let stackedDuration = 0;
		oldPeople.forEach(person => {
			person["stackedDuration"] = stackedDuration +person.Duration;
			stackedDuration = person["stackedDuration"];
			person.Order = +person.Order - 1;
		});

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

		const mapContainer = svg.append("g")
								.attr("class", "map")
								.attr("transform", `translate(0,${ height * 0.15 })`);

		mapContainer.append("g")
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
        	const offsetKey = `${d.Birthplace}_${d.Deathplace}`;

        	let qHeight = 0;
        	let offset = 0;
        	if (d.Birthplace === d.Deathplace) {
        		offsets[offsetKey] = (offsets[offsetKey] || 10) + 5;
        		offset = offsets[offsetKey];
        		qHeight = from[1] + offset;
        	} else {
        		offsets[offsetKey] = (offsets[offsetKey] || 50) + 10;
        		offset = offsets[offsetKey];
        		qHeight = Math.max(from[1], till[1]) + offset;
        	}

        	const path = `M ${from[0]} ${from[1]} C ${from[0] - offset} ${qHeight} ${till[0] + offset} ${qHeight} ${till[0]} ${till[1]}`;
        	d["path"] = path;
        	return path;
        };

		const lifes = mapContainer
        				.append("g")
        				.selectAll("g", "life")
        				.data(oldPeople)
        					.enter()
        				.append("g")
        					.attr("class", (d) => `life ${ (d.Sex === "F") ? "female" : "male" }`)
        					.attr("opacity", 0);
        lifes
        	.append("path")
        	.attr("class", "life-path")
        	.attr("d", lifePath);

       //add arrows

        svg.append("defs")
        	.selectAll("path")
        	.data(oldPeople.filter((d) => d.Birthplace !== d.Deathplace))
        		.enter()
        	.append("path")
        		.attr("id", (d) => `textPath_${d.Order}`)
        		.attr("d", (d) => d.path);
        lifes
        	.filter((d) => d.Birthplace !== d.Deathplace)
        	.append("text")
        		.attr("dy", "3.5px")
        	.append("textPath")
        	.text("▶")
        	.attr("xlink:href", (d) => `#textPath_${d.Order}`)
        	.attr("startOffset", "30%");

        // run ticker
        let year = 1955;
        let counter = 0;
        let current = 0;

       	const labelColor = (d, i) => (d.Sex == "F") ? "#cb2d6f" : "#14a098";
       	const formatLabelData = (person, year) => ([
       			{ text: year },
       			{
        			color: labelColor(oldPeople[current]),
        			text: oldPeople[current].Name 
        		}, 
        		{ text: formatPlace(oldPeople[current]) }
        	]);

        const labelContainer = svg
        				.append("g")
        					.attr("class", "label")
        					.attr("transform", `translate(${width / 2}, ${ height * 0.6 })`)
        				.append("text");

        labelContainer
        		.selectAll("tspan")
        			.data(formatLabelData(oldPeople[current], year), d => d && d.text)
        		.enter()
        		.append("tspan")
        			.text((d) => d.text)
        			.attr("dx", 20)
        			.style("fill", d => d.color || "#dadada");

        const timer = setInterval(() => {

        	lifes
        		.transition(animDuration)
        		.attr("opacity", (d) => {
        			return (d.stackedDuration < counter) ? 1 : 0 
        		});

        	lifes
        		.select("path")
        		//.transition(animDuration)
        		.style("stroke-width", d => (d.Order == current) ? "3" : "1");

        	const prevYear = year;
        	year = Math.floor(1954 + counter);
        	let needUpdateLabel = prevYear !== year;
        	if (oldPeople[current].stackedDuration < counter) {
        		current = current + 1;
        		needUpdateLabel = true;
        		if (current == oldPeople.length) {
        			clearTimeout(timer);
        			return;
        		}
        	}

        	if (needUpdateLabel) {
        		const labels =labelContainer
        			.selectAll("tspan")
        			.data(formatLabelData(oldPeople[current], year), d => d && d.text)
	        			
	        	labels.exit().remove();
	        	labels.enter()
	        		.append("tspan")
	        			.text(d => d.text)
	        			.attr("dx", 20)
	        			.style("fill", d => d.color);
        	}

        	counter = counter + 0.1;

        }, 200);


	}).catch((e) => console.error(error))