
d3.csv("data/drugs.csv")
	.then(source => {

		source.forEach(drug => {
			drug.PhysicalHarm = +drug.PhysicalHarm;
			drug.Dependence = +drug.Dependence;
			drug.SocialHarm = +drug.SocialHarm;

			drug.Pleasure = +drug.Pleasure;
			drug.Psychological = +drug.Psychological;
			drug.Physical = +drug.Physical;
		});

		const container = d3.select("main");
		const size = container.node().getBoundingClientRect();
		const dim = Math.min(size.width, size.height);

		const svg = container
						.append("svg")
							.attr("width", dim)
							.attr("height", dim);

		const tooltip = d3.select(".tooltip");

		appendGooeyFilter(svg);

		const sideSize = dim / Math.sqrt(2);
		const chart = svg
						.append("g")
						.attr("transform", `translate(${ 0 }, ${ dim / 2 })rotate(${ -45 })`);

		chart
			.append("line")
				.attr("x2", sideSize)
				.attr("y1", sideSize)
				.style("stroke", "#700")
		chart
			.append("line")
				.attr("y1", sideSize)
				.attr("y2", sideSize)
				.attr("x2", sideSize)
				.style("stroke", "#777")

		chart
			.append("line")
				.attr("y1", sideSize)
				.style("stroke", "#777");

		chart
			.append("text")
			.text("Mean Social Harm --->")
			.style("text-anchor", "middle")
			.attr("transform", `translate(${ sideSize / 2}, ${ sideSize - 10})`);

		chart
			.append("text")
			.text("<--- Mean Physical Harm")
			.style("text-anchor", "middle")
			.attr("transform", `translate(${ 10 }, ${ sideSize / 2 })rotate(90)`)

		const maxPhysicalHarm = d3.max(source, d => d.PhysicalHarm);
		const scalePhysicalHarm = d3.scaleLinear().domain([maxPhysicalHarm, 0]).range([20, sideSize - 0]);

		const maxSocialHarm = d3.max(source, d => d.SocialHarm);
		const scaleSocialHarm = d3.scaleLinear().domain([0, maxSocialHarm]).range([0, sideSize - 20]);

		const maxDependence = d3.max(source, d => d.Dependence);
		const scaleDependence = d3.scaleLinear().domain([0, maxDependence]).range([0, 20]);

		// force layout 
		const simulation = d3.forceSimulation(source)
			.force("collide", d3.forceCollide(d => scaleDependence(d.Dependence) + 5))
			.force("x", d3.forceX(d => scaleSocialHarm(d.SocialHarm)))
			.force("y", d3.forceY(d => scalePhysicalHarm(d.PhysicalHarm)));

		for (var i = 0; i < 200; ++i) {
		    simulation.tick();
		 }

		const drugNodes = chart
			.append("g")
			.selectAll(".drug")
			.data(source)
				.enter()
			.append("g")
				.attr("class", "drug")
				.attr("transform", d => `translate(${d.x}, ${d.y})`)
				.on("mouseover", d => {
					tooltip
						.style("left", `${d3.event.pageX + 10}px`)
						.style("top", `${d3.event.pageY }px`)
						.style("display", "block");
					tooltip.html(`<p><h2>${d.Drug}</h2>
						</p><p>Dependence: ${d.Dependence}</p>
						</p><p>Social harm: ${d.SocialHarm}</p>
						</p><p>Physical harm: ${d.PhysicalHarm}</p>`)
				})
				.on("mouseout", d => {
					tooltip.style("display", "none");
				});

		//background
		const maxPleasure = d3.max(source, d => d.Pleasure);
		const scalePleasure = d3.scaleLinear().domain([0, maxPleasure]).range([2, 12]);
		const maxPsychological = d3.max(source, d => d.Psychological);
		const scalePsychological = d3.scaleLinear().domain([0, maxPsychological]).range([2, 12]);
		const maxPhysical = d3.max(source, d => d.Physical);
		const scalePhysical = d3.scaleLinear().domain([0, maxPhysical]).range([2, 12]);

		const background = drugNodes
			.append("g")
				.style("filter", "url(#gooeyFilter)");

		background
			.append("circle")
			.attr("cy", d => scalePleasure(d.Pleasure))
			.attr("r", d => scalePleasure(d.Pleasure))
			.style("fill", "#F9EB0F");

		background
			.append("circle")
			.attr("cy", d => -scalePsychological(d.Psychological))
			.attr("cx", d => scalePsychological(d.Psychological))
			.attr("r", d => scalePsychological(d.Psychological))
			.style("fill", "#10E7E2");

		background
			.append("circle")
			.attr("cy", d => -scalePhysical(d.Physical))
			.attr("cx", d => -scalePhysical(d.Physical))
			.attr("r", d => scalePhysical(d.Physical))
			.style("fill", "#FF2153");

	});

function appendGooeyFilter(svg) {
	var filter = svg.append("defs").append("filter").attr("id","gooeyFilter");
	filter.append("feGaussianBlur")
			.attr("in","SourceGraphic")
			.attr("stdDeviation", 5)
			.attr("color-interpolation-filters","sRGB") 
			.attr("result","blur");
	filter.append("feColorMatrix")
			.attr("in","blur")
			.attr("mode","matrix")
			.attr("values","1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9")
			.attr("result","gooey");
}