
function load_pc_weeks() {
	for(let i = 0; i < last_n_weeks.length; i++){
		let week_name = ""
		if (i === 0){
			week_name = "Current Week"
		}
		else if (i === 1) {
			week_name = "Last Week"
		}
		else {
			week_name = "Week " + last_n_weeks[i]
		}
		d3.select(".pcweekSelection")
			.append("option")
			.attr("value", last_n_weeks[i])
			.text(week_name)
	}

	d3.select(".pcweekSelection").on("change", function(d) {
		// recover the option that has been chosen
		var selectedOption = d3.select(this).property("value")
		// run the updateChart function with this selected option
		console.log("Calling: update_weekly_posture_change_chart(" + selectedOption + ")")
		update_weekly_posture_change_chart(parseInt(selectedOption))
	})
}

// Updates the weekly Posture Change Count
function update_weekly_posture_change_chart(week=-1){
	const options = {
		hostname: server_addr,
		port: server_port,
		path: '/posture/weekly/?week=' + week,
		method: 'GET'
	}

	console.log("Get Posture Weekly data for Week: " + ((week == -1)? "Current Week": week))

	const req = https.request(options, res => {
		console.log("Get Weekly Posture statusCode: ", res.statusCode)
		res.on('data', d => {
			const posture_info = JSON.parse(d);
			const month  = get_month(posture_info[3]['m_date'])
			const w = ((week == -1) ? last_n_weeks[0]: week)
			const month_header = month + ", 2021 [Week: " + w + ", Sun (" +  posture_info[0]['m_date'] + ") - Sat (" + posture_info[6]['m_date'] + ")]"

			var svg = d3.select("#svg_2a"),
				margin = 100,
				width = svg.attr("width") - margin,
				height = svg.attr("height") - margin

			svg.selectAll(`*`).remove();

			var tooltip = d3.select("body").append("div").attr("class", "toolTip");

			svg.append("text")
			   .attr("transform", "translate(0,0)")
			   .attr("x", 10)
			   .attr("y", 20)
			   .attr("font-size", "14px")
			   .attr("font-weight", "Bold")
				.attr("fill", "dimgrey")
			   .text("Weekly Posture Change Chart")

			svg.append("text")
				.attr("transform", "translate(0,0)")
				.attr("x", 275)
				.attr("y", 20)
				.attr("font-size", "10px")
				.attr("font-weight", "Bold")
				.attr("fill", "dimgrey")
				.text(month_header)


			svg.append("text")
				.attr("transform", "translate(0,0)")
				.attr("x", ((width) / 2) + 25)
				.attr("y", 40)
				.attr("fill", "brown")
				.attr("font-size", "10px")
				.attr("font-weight", "Bold")
				.text("Week Days")

			var xScale = d3.scaleBand().range([0, width]).padding(0.1),
				yScale = d3.scaleLinear().range([height, 0]),
                dayScale = d3.scaleBand().range([0, width]).padding(0.1);

			var g = svg.append("g")
				.attr("transform", "translate(" + 50 + "," + 50 + ")");

			xScale.domain(posture_info.map(function(d) { return d.m_date; }));
			dayScale.domain(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
			yScale.domain([0, d3.max(posture_info, function(d) { return d.m_count; })]);

			g.append("rect")
				.attr("class", "weekly_annotation_box")
				.classed("annotation", true)
				.attr("transform", "translate(0,0)")
				.attr("width", 320)
				.attr("height", 260)
				.attr("x", 65)
				.attr("y", -20);

			g.append("g")
			 .attr("transform", "translate(0," + height + ")")
			.attr("fill", "dimgrey")
			.call(d3.axisBottom(xScale))
			 .append("text")
			 .attr("y", 10)
			 .attr("x", width + 30)
			 .attr("text-anchor", "end")
			.attr("fill", "dimgrey")
			.attr("font-weight", "Bold")
			 .text("Day");

			g.append("g")
				.attr("transform", "translate(0," + (height + 20) + ")")
				.attr("fill", "dimgrey")
				.call(d3.axisBottom(dayScale))

			g.append("g")
			 .call(d3.axisLeft(yScale).tickFormat(function(d){return d;})
			 .ticks(10))
			 .append("text")
			 .attr("transform", "rotate(-90)")
			 .attr("y", 15)
			 .attr("dy", "-5.1em")
			 .attr("text-anchor", "end")
				.attr("fill", "dimgrey")
				.attr("font-weight", "Bold")
			 .text("Posture Change Count");

			/*
			g.append('g')
			 .attr('class', 'grid')
			 .call(d3.axisLeft()
			         .scale(yScale)
			         .tickSize(-width, 0, 0)
			         .tickFormat(''))
			 */

			g.selectAll(".bar")
				.data(posture_info)
				.enter().append("rect")
				.attr("class", "daily_posture_bars")
				.classed("posture", true)
				.attr("x", function(d) { return xScale(d.m_date); })
				.attr("width", xScale.bandwidth())
				.attr("fill", function(d) {
					return (formatted_date == d.m_date ? "FireBrick" : "RosyBrown");
				})
				// no bar at the beginning thus:
				.attr("height", function(d) { return height - yScale(0); }) // always equal to 0
				.attr("y", function(d) { return yScale(0); })
				.on("click", function(d, i) {
					update_daily_posture_change_chart(d.m_date);
					d3.selectAll('.daily_posture_bars')
						.filter(function() {return !this.classList.contains('annotation')})
						.filter(function() {return !this.classList.contains('voice')})
						.style('fill', function(d) {
							return (formatted_date == d.m_date ? "LightSalmon" : "RosyBrown");
						});
					d3.select(this).style("fill", function(d) {
						return (formatted_date == d.m_date ? "FireBrick" : "FireBrick");
					});
				})
				.on("mousemove", function(d){
					tooltip.style("left", d3.event.pageX - 20 + "px")
						.style("top", d3.event.pageY - 40 + "px")
						.style("display", "inline-block")
						.html("<b>" + d.m_date + "</b>" + "</br>" + "<b>Posture Change: </b>" + d.m_count);
				})
				.on("mouseout", function(d){ tooltip.style("display", "none");});

			 // Animation
			 svg.selectAll("rect")
				.transition()
  			    .filter(function() {return !this.classList.contains('annotation')})
				.duration(800)
				.attr("y", function(d) { return yScale(d.m_count); })
				.attr("height", function(d) { return height - yScale(d.m_count); })
				.delay(function(d,i){return(i*100)});

			svg.append("circle").attr("cx",270).attr("cy",295).attr("r", 5).style("fill", "RosyBrown")
			svg.append("text").attr("x", 280).attr("y", 297).text("Daily Count").style("font-size", "8px").attr("alignment-baseline","middle")
			svg.append("circle").attr("cx",350).attr("cy",295).attr("r", 5).style("fill", "LightSalmon")
			svg.append("text").attr("x", 360).attr("y", 297).text("Current Day Count").style("font-size", "8px").attr("alignment-baseline","middle")
			svg.append("circle").attr("cx",450).attr("cy",295).attr("r", 5).style("fill", "FireBrick")
			svg.append("text").attr("x", 460).attr("y", 297).text("Highlighted Count").style("font-size", "8px").attr("alignment-baseline","middle")
		});
	});

	req.on('error', error => {
		 console.error(error)
	});

	req.end()
}

// Updates the daily Posture Change Count
function update_daily_posture_change_chart(date){
	const dayname = get_dayname(date)
	const month  = get_month(date)
	const day = new Date(date).getDate() + 1
	console.log("Get Posture Daily data for Date: " + date)
	const options = {
		hostname: server_addr,
		port: server_port,
		path: '/posture/daily/?date=' + date,
		method: 'GET'
	}

	/*
	//const data = JSON.stringify(date)
	const options = {
		hostname: server_addr,
		port: server_port,
		path: '/posture/daily/',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': data.length
		}
	}
	*/

	const req = https.request(options, res => {
		console.log("Get Daily Posture statusCode: ", res.statusCode)

		res.on('data', d => {
			const posture_info = JSON.parse(d);
			var svg = d3.select("#svg_2b"),
				margin = 100,
				width = svg.attr("width") - margin,
				height = svg.attr("height") - margin

			svg.selectAll(`*`).remove();

			var tooltip = d3.select("body").append("div").attr("class", "toolTip");

			svg.append("text")
				.attr("transform", "translate(0,0)")
				.attr("x", 10)
				.attr("y", 20)
				.attr("font-size", "14px")
				.attr("font-weight", "Bold")
				.attr("fill", "dimgrey")
				.text("Daily Posture Change Chart")

			svg.append("text")
				.attr("transform", "translate(0,0)")
				.attr("x", width + margin - 15)
				.attr("y", 20)
				.attr("font-size", "10px")
				.attr("font-weight", "Bold")
				.attr("text-anchor", "end")
				.attr("fill", "dimgrey")
				.text(month + " " + day + ", 2021 (" + dayname + ")")

			var xScale = d3.scaleBand().range([0, width]).padding(0.1),
				yScale = d3.scaleLinear().range([height, 0]);

			var g = svg.append("g")
				.attr("transform", "translate(" + 50 + "," + 50 + ")");

			xScale.domain(posture_info.map(function(d) { return d.m_hour; }));
			yScale.domain([0, d3.max(posture_info, function(d) { return d.m_count; })]);

			if ((dayname != "Sunday") && (dayname != "Saturday")) {
				svg.append("text")
					.attr("transform", "translate(0,0)")
					.attr("x", ((width) / 2) + 25)
					.attr("y", 35)
					.attr("fill", "brown")
					.attr("font-size", "10px")
					.attr("font-weight", "Bold")
					.text("Business Hours")

				g.append("rect")
					.attr("class", "daily_annotation_box")
					.classed("annotation", true)
					.attr("transform", "translate(0,0)")
					.attr("width", 205)
					.attr("height", 245)
					.attr("x", 132)
					.attr("y", -25);
			}
			else {
				svg.append("text")
					.attr("transform", "translate(0,0)")
					.attr("x", ((width) / 2) + 25)
					.attr("y", 35)
					.attr("fill", "brown")
					.attr("font-size", "10px")
					.attr("font-weight", "Bold")
					.text("Weekend Daytime")

				g.append("rect")
					.attr("class", "weekend_annotation_box")
					.classed("annotation", true)
					.attr("transform", "translate(0,0)")
					.attr("width", 205)
					.attr("height", 245)
					.attr("x", 132)
					.attr("y", -25);
			}

			g.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(xScale))
				.append("text")
				.attr("y", 10)
				.attr("x", width + 30)
				.attr("text-anchor", "end")
				.attr("fill", "dimgrey")
				.attr("font-weight", "Bold")
				.text("Hour");

			g.append("g")
				.call(d3.axisLeft(yScale).tickFormat(function(d){return d;})
					.ticks(10))
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 15)
				.attr("dy", "-5.1em")
				.attr("text-anchor", "end")
				.attr("fill", "dimgrey")
				.attr("font-weight", "Bold")
				.text("Posture Change Count");

			g.selectAll(".bar")
				.data(posture_info)
				.classed("hourly_bars", true)
				.enter().append("rect")
				.attr("class", "bar")
				.attr("x", function(d) { return xScale(d.m_hour); })
				.attr("width", xScale.bandwidth())
				.attr("fill", "IndianRed")
				// no bar at the beginning thus:
				.attr("height", function(d) { return height - yScale(0); }) // always equal to 0
				.attr("y", function(d) { return yScale(0); })
				.on("mousemove", function(d){
					tooltip
						.style("left", d3.event.pageX - 20 + "px")
						.style("top", d3.event.pageY - 40 + "px")
						.style("display", "inline-block")
						.html("<b>During Hour: </b>" + d.m_hour + "</br>" + "<b>Posture Change: </b>" + d.m_count);
				})
				.on("mouseout", function(d){ tooltip.style("display", "none");});

			// Animation
			svg.selectAll("rect")
				.transition()
				.filter(function() {return !this.classList.contains('annotation')})
				.duration(800)
				.attr("y", function(d) { return yScale(d.m_count); })
				.attr("height", function(d) { return height - yScale(d.m_count); })
				.delay(function(d,i){; return(i*100)});

			svg.append("circle").attr("cx",450).attr("cy",285).attr("r", 5).style("fill", "IndianRed")
			svg.append("text").attr("x", 460).attr("y", 285).text("Hourly Count").style("font-size", "8px").attr("alignment-baseline","middle")


		});
	});

	req.on('error', error => {
		console.error(error)
	});

	//req.write(data)
	req.end()


}

update_weekly_posture_change_chart();
update_daily_posture_change_chart(formatted_date)