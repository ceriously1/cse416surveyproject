// boilerplate for a pie chart
import {useEffect} from 'react';
import * as d3 from 'd3';

function PieChart({ data , title }) {
    const height = 300;
    const width = 300;
    const margin = 50;
    const radius = Math.min(height, width) / 2 - margin;
    // data before [n1:a1, n2:a2, ...]
    // data after [a1:c1, a2:c2 ...]
    console.log(Object.entries(data));
    // count for each answer type
    var counts = {};
    for(const entry of Object.entries(data)){
        counts[entry[1]] = counts[entry[1]] ? counts[entry[1]] + 1 : 1;
    }
    console.log(counts);
    // no more than 8 in case we have many
    counts = Object.entries(counts).sort(function(a,b) {return b.value - a.value;}).slice(0,8);
    console.log(counts);
    // decide the color band
    const color = d3.scaleOrdinal()
						.domain(counts.map(function(d) {return d[0]} ))
						.range(d3.schemeSet2);
    useEffect(() => {
        renderChart();
    },[data]);
    
    function renderChart(){
        // remove the old content
        d3.select('#container')
            .select('svg')
            .remove();
        // append the new one
        const svg = d3.select('#container')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 
                    "translate(" + (width/2) + "," + (height/2) + ")");
        // generators
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);   
        const pie = d3.pie()
            .value(function(d) {return d[1]})
            .sort(function(a, b) { return b - a; });        
        // process the data
		var data_r = pie(counts);
        console.log(data_r);
        // render
        var u = svg.selectAll("path").data(data_r).enter();
        u.append("path")
            .attr("d", arc)
            .attr('fill', function(d){ return(color(d.data[0]))})
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 1);
        // add the text to the center
        u.append('text')
            .text(function(d) {return d.data[0]})
            .attr("transform", function(d){return "translate(" + arc.centroid(d) + ")"; })
            .style("text-anchor", "middle")
            .style("font-size", 14);
        // add a title
        svg.append("text")
            .attr("x", 0)             
            .attr("y", 0 - height / 2 + margin - 5)
            .attr("text-anchor", "middle")  
            .style("font-size", "24px") 
            .style("text-decoration", "underline")  
            .text(title);
    }

    return <div id="container"/>;
}

export default PieChart;

