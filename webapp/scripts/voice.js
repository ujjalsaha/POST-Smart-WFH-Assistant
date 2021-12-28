const server_port = 5000;
const server_addr = "192.168.86.117";
const https = require('http')
const current_datetime = new Date()
const formatted_date = format_date(current_datetime)
const last_n_weeks = get_last_n_week()


function load_vd_weeks() {
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
		d3.select(".vdweekSelection")
			.append("option")
			.attr("value", last_n_weeks[i])
			.text(week_name)
	}

	d3.select(".vdweekSelection").on("change", function(d) {
		// recover the option that has been chosen
		var selectedOption = d3.select(this).property("value")
		// run the updateChart function with this selected option
		console.log("Calling: update_weekly_voice_detection_chart(" + selectedOption + ")")
		update_weekly_voice_detection_chart(parseInt(selectedOption))
	})
}

// get login data
function get_login_date(){
	const options = {
		hostname: server_addr,
		port: server_port,
		path: '/login/',
		method: 'GET'
	}

	console.log("Get Login data for Week")

	const req = https.request(options, res => {
		console.log("Get Login statusCode: ", res.statusCode)
		res.on('data', d => {
			const login_info = JSON.parse(d);
			console.log("login_date: " + login_info['login_date'])
			console.log("login_time: " + login_info['login_time'])
			console.log("late_login: " + login_info['late_login'])
			document.getElementById("logintime").innerHTML = login_info['login_time']
			document.getElementById("logintime").style.color = (login_info['late_login'] == true)? "red": "green"
		});
	})

	req.on('error', error => {
		console.error(error)
	});

	req.end()
}

// Updates the weekly Voice Detection Count
function update_weekly_voice_detection_chart(week=-1){
	const options = {
		hostname: server_addr,
		port: server_port,
		path: '/voice/weekly/?week=' + week,
		method: 'GET'
	}

	console.log("Get Speech Weekly data for Week: " + ((week == -1)? "Current Week": week))

	const req = https.request(options, res => {
		console.log("Get Weekly Voice statusCode: ", res.statusCode)
		res.on('data', d => {
			const voice_info = JSON.parse(d);
			const month  = get_month(voice_info[3]['v_date'])
			const w = ((week == -1) ? last_n_weeks[0]: week)
			const month_header = month + ", 2021 [Week: " + w + ", Sun (" +  voice_info[0]['v_date'] + ") - Sat (" + voice_info[6]['v_date'] + ")]"

			var svg = d3.select("#svg_1a"),
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
			   .text("Weekly Voice Detection Chart")

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

			xScale.domain(voice_info.map(function(d) { return d.v_date; }));
			dayScale.domain(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
			yScale.domain([0, d3.max(voice_info, function(d) { return d.v_count; })]);

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
			 .text("Voice Detection Count");

			/*
			g.append('g')
			 .attr('class', 'grid')
			 .call(d3.axisLeft()
			         .scale(yScale)
			         .tickSize(-width, 0, 0)
			         .tickFormat(''))
			 */

			g.selectAll(".bar")
			 .data(voice_info)
			 .enter().append("rect")
			 .attr("class", "daily_voice_bars")
			 .classed("voice", true)
			 .attr("x", function(d) { return xScale(d.v_date); })
			 .attr("width", xScale.bandwidth())
			 .attr("fill", function(d) {
				 return (formatted_date == d.v_date ? "teal" : "cadetblue");
			 })
			 // no bar at the beginning thus:
			 .attr("height", function(d) { return height - yScale(0); }) // always equal to 0
			 .attr("y", function(d) { return yScale(0); })
			 .on("click", function(d, i) {
			 	update_daily_voice_detection_chart(d.v_date);
				d3.selectAll('.daily_voice_bars')
				  .filter(function() {return !this.classList.contains('annotation')})
				  .filter(function() {return !this.classList.contains('posture')})
				  .style('fill', function(d) {
					  return (formatted_date == d.v_date ? "lightsteelblue" : "cadetblue");
				  });
				d3.select(this).style("fill", function(d) {
					return (formatted_date == d.v_date ? "teal" : "teal");
				});
			 })
			 .on("mousemove", function(d){
				tooltip.style("left", d3.event.pageX - 20 + "px")
					   .style("top", d3.event.pageY - 40 + "px")
					   .style("display", "inline-block")
					   .html("<b>" + d.v_date + "</b>" + "</br>" + "<b>Voice Detection: </b>" + d.v_count);
				})
			 .on("mouseout", function(d){ tooltip.style("display", "none");});

			 // Animation
			 svg.selectAll("rect")
				.transition()
  			    .filter(function() {return !this.classList.contains('annotation')})
				.duration(800)
				.attr("y", function(d) { return yScale(d.v_count); })
				.attr("height", function(d) { return height - yScale(d.v_count); })
				.delay(function(d,i){return(i*100)});

			svg.append("circle").attr("cx",270).attr("cy",295).attr("r", 5).style("fill", "cadetblue")
			svg.append("text").attr("x", 280).attr("y", 297).text("Daily Count").style("font-size", "8px").attr("alignment-baseline","middle")
			svg.append("circle").attr("cx",350).attr("cy",295).attr("r", 5).style("fill", "lightsteelblue")
			svg.append("text").attr("x", 360).attr("y", 297).text("Current Day Count").style("font-size", "8px").attr("alignment-baseline","middle")
			svg.append("circle").attr("cx",450).attr("cy",295).attr("r", 5).style("fill", "teal")
			svg.append("text").attr("x", 460).attr("y", 297).text("Highlighted Count").style("font-size", "8px").attr("alignment-baseline","middle")

		});
	});

	req.on('error', error => {
		 console.error(error)
	});

	req.end()
}

// Updates the daily Voice Detection Chart
function update_daily_voice_detection_chart(date){
	const dayname = get_dayname(date)
	const month  = get_month(date)
	const day = new Date(date).getDate() + 1
	console.log("Get Speech Daily data for Date: " + date)
	const options = {
		hostname: server_addr,
		port: server_port,
		path: '/voice/daily/?date=' + date,
		method: 'GET'
	}

	/*
	//const data = JSON.stringify(date)
	const options = {
		hostname: server_addr,
		port: server_port,
		path: '/voice/daily/',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': data.length
		}
	}
	*/

	const req = https.request(options, res => {
		console.log("Get Daily Voice statusCode: ", res.statusCode)

		res.on('data', d => {
			const voice_info = JSON.parse(d);
			//console.log("voice_info")
			//console.log(voice_info)
			//console.log(voice_info[0])
			//document.getElementById("battery").innerHTML = voice_info['result'][0]['v_speech'];

			var svg = d3.select("#svg_1b"),
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
				.text("Daily Voice Detection Chart")

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

			xScale.domain(voice_info.map(function(d) { return d.v_hour; }));
			yScale.domain([0, d3.max(voice_info, function(d) { return d.v_count; })]);

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
				.text("Voice Detection Count");

			g.selectAll(".bar")
				.data(voice_info)
				.classed("hourly_voice_bars", true)
				.enter().append("rect")
				.attr("class", "bar")
				.attr("x", function(d) { return xScale(d.v_hour); })
				.attr("width", xScale.bandwidth())
				.attr("fill", "DarkCyan")
				//.attr("fill", "slategrey")
				// no bar at the beginning thus:
				.attr("height", function(d) { return height - yScale(0); }) // always equal to 0
				.attr("y", function(d) { return yScale(0); })
				.on("mousemove", function(d){
					tooltip
						.style("left", d3.event.pageX - 20 + "px")
						.style("top", d3.event.pageY - 40 + "px")
						.style("display", "inline-block")
						.html("<b>During Hour: </b>" + d.v_hour + "</br>" + "<b>Voice Detection: </b>" + d.v_count);
				})
				.on("mouseout", function(d){ tooltip.style("display", "none");});

			// Animation
			svg.selectAll("rect")
				.transition()
				.filter(function() {return !this.classList.contains('annotation')})
				.duration(800)
				.attr("y", function(d) { return yScale(d.v_count); })
				.attr("height", function(d) { return height - yScale(d.v_count); })
				.delay(function(d,i){; return(i*100)});

			svg.append("circle").attr("cx",450).attr("cy",285).attr("r", 5).style("fill", "DarkCyan")
			svg.append("text").attr("x", 460).attr("y", 285).text("Hourly Count").style("font-size", "8px").attr("alignment-baseline","middle")

		});
	});

	req.on('error', error => {
		console.error(error)
	});

	//req.write(data)
	req.end()
}

function get_dayname(datestring) {
	console.log("Dayname " + (new Date(datestring).getDay()))
	return ['Monday',
		    'Tuesday',
		    'Wednesday',
		    'Thursday',
		    'Friday',
		    'Saturday',
			'Sunday',
			][new Date(datestring).getDay()]
}

function get_month(datestring) {
	return ['Jan', "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][new Date(datestring).getMonth()]
}

function get_week(datestring) {
	d = new Date(datestring)
	const onejan = new Date(d.getFullYear(),0,1);
	return Math.ceil((((d - onejan) / 86400000) + onejan.getDay()+1)/7);
}

function get_last_n_week(n=5) {
	const d = get_week(format_date(new Date()))
	return [d-1, d-2, d-3, d-4, d-5]
}

function format_date(datetime){
	return datetime.getFullYear() + "-" + (("0" + (datetime.getMonth() + 1)).slice(-2)) + "-" + (("0" + datetime.getDate()).slice(-2));
}


get_login_date()
update_weekly_voice_detection_chart();
update_daily_voice_detection_chart(formatted_date)