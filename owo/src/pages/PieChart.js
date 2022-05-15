// boilerplate for a pie chart
import {useEffect, useRef} from 'react';
import * as d3 from 'd3';

const useD3 = (renderChartFn, dependencies) => {
    const ref = useRef();
    useEffect(() => {
        renderChartFn(d3.select(ref.current));
        return;
    }, dependencies);
    return ref;
}

function PieChart({ data }) {
    const ref = useD3(
        (svg) => {
            // init
            const height = 600;
            const width = 600;
            const margin = 200;
            const radius = Math.min(height, width) / 2 - margin;
            // centered
            svg.select(".chart")
                .attr("transform", 
                    "translate(" + (width/2) + "," + (height/2) + ")");
            // data expected {n1: a1, n2: a1, n3: a2, ...}
            const color = d3.scaleOrdinal()
							  .domain(data.map(function(d) { return d; }))
							  .range(d3.schemeSet2);
            // count for each answer type
            const counts = {};
            for(const a of data){
                counts[a] = counts[a] ? counts[a] + 1 : 1;
            }
            console.log(counts);
            // no more than 8 in case we have many
            counts = counts.sort(function(a,b) {return b.value - a.value;}).slice(0,8);
            console.log(counts);
			var pie = d3.pie()
							.value(function(d) {return d.value})
							.sort(function(a, b) { return b.value - a.value; });
			var data_r = pie(d3.entries(counts));
			console.log(data_r);
            // render
			var u = svg.selectAll("path").data(data_r);
            var arc = d3.arc()
                        .innerRadius(0)
                        .outerRadius(radius);
			u.enter().join("path").merge(u)
				 .transition().duration(1000)
				 .attr("d", arc)
				 .attr('fill', function(d){ return(color(d.data.key))})
				 .attr("stroke", "white")
				 .style("stroke-width", "2px")
				 .style("opacity", 1);
            // add the text to the center
            u.enter().join('text').merge(u)
                .text(function(d) {return d.data.key})
                .attr("transform", function(d){return "translate(" + arc.centroid(d) + ")"; })
                .style("text-anchor", "middle")
                .style("font-size", 14);
			u.exit().remove();
            // legend
			var legend = svg.select(".legend").data(data_r);
			var legendEnter = legend.enter().join("g")
					.attr("class", "legend")
					.attr("transform", function(d,i){
						return "translate(" + (p_width/2 - 200) + "," + (i*15 + 20) + ")";
				});
			legend.exit().remove();
			legendEnter.join("rect")
					.attr("width", 10)
					.attr("height", 10)
					.attr("fill", function(d, i){
						return color(i);
					});
			legendEnter.join("text")
					.text(function(d){
						return d.data.value.ca;	
					})
					.style("font-size", 12)
					.attr("y", 10)
					.attr("x", 11);
        }, [data.length]
    );

    return 
    <svg
        style = {{
            width: 600,
            height: 600,
            marginRight: "0px",
            marginLeft: "0px",
        }}
    >
        <g className="chart"/>
        <g className="legend"/>
    </svg>
}

export default PieChart;

