
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
	})