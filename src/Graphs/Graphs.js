import { useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import * as d3 from 'd3';

Chart.register(PieController, ArcElement, Tooltip, Legend);

let myPieChart = null;
var dataSource = {
            datasets: [
                {
                    data: [],
                    backgroundColor: [
                        '#ffcd56',
                        '#ff6384',
                        '#36a2eb',
                        '#fd6b19',
                        '#4bc0c0',
                        '#9966ff',
                        '#8bc34a',
                    ]
                }
            ],
            labels: []
};

function Graphs() {
    const chartRef = useRef(null);
    const d3Ref = useRef(null);

    //This is for the ChartJS chart
    
    useEffect(() => {
        function createChart() {
            var ctx = chartRef.current.getContext('2d');

            if (!ctx) {
                console.error('Canvas not found');
                return;
            }
            if (myPieChart) {
                myPieChart.destroy();
            }

            myPieChart = new Chart(ctx, {
                type: 'pie',
                data: dataSource
            });
        }

        //This is for the D3JS chart
        d3.select(d3Ref.current).selectAll("*").remove();

        var svg = d3.select(d3Ref.current)
            .append("svg")
            .append("g");

        svg.append("g")
            .attr("class", "slices");
        svg.append("g")
            .attr("class", "labels");
        svg.append("g")
            .attr("class", "lines");

        var width = 960,
            height = 400,
            radius = Math.min(width, height) / 2;
        
        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                return d.value;
            });
        
        var arc = d3.svg.arc()
            .outerRadius(radius * 0.8)
            .innerRadius(radius * 0.4);

        var outerArc = d3.svg.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9);

        svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var key = function(d) {
            return d.data.label;
        };

        var color = d3.scale.ordinal()
            .domain(dataSource.labels)
            .range(dataSource.datasets[0].backgroundColor);

        function dataAssign() {
            var labels = color.domain();
            return labels.map(function(label, i) {
                return { label: label, value: dataSource.datasets[0].data[i] };
            });
        }

        function change(data) {
            //  slices --------------------------------------------------------------------------------------
            var slice = svg.select(".slices").selectAll("path.slice")
                .data(pie(data), key);
            
            slice.enter()
                .append("path")
                .style("fill", function(d) {
                    return color(d.data.label);
                })
                .attr("class", "slice")
                .attr("d", arc);

            slice.exit()
                .remove();

            //  text labels --------------------------------------------------------------------------------------
            var text = svg.select(".labels").selectAll("text")
                .data(pie(data), key);

            text.enter()
                .append("text")
                .attr("dy", ".35em")
                .attr("transform", d => {
                    var pos = outerArc.centroid(d);
                    pos[0] = radius * 1.05 * (midAngle(d) < Math.PI ? 1 : -1);
                    return "translate(" + pos + ")";
                })
                .style("text-anchor", d => midAngle(d) < Math.PI ? "start":"end")
                .style("fill", "black")
                .style("font-size", "14px")
                .style("font-family", "Tahoma, Arial")
                .text(d => d.data.label);

            function midAngle(d) {
                return d.startAngle + (d.endAngle - d.startAngle)/2;
            }

            text.exit()
                .remove();

            //slice to text polylines --------------------------------------------------------------------------------------
            
            var polyline = svg.select(".lines").selectAll("polyline")
                .data(pie(data), key);
                
            polyline.enter()
                .append("polyline")
                .attr("points", d => {
                    var pos = outerArc.centroid(d);
                    pos[0] = radius * 1.05 * (midAngle(d) < Math.PI ? 1 : -1);
                    return [arc.centroid(d), outerArc.centroid(d), pos];
                });

            polyline.exit()
                .remove();
            };

            function getBudget() {
                axios.get('http://localhost:3001/budget')
                .then(function (res) {
                    for (var i = 0; i < res.data.myBudget.length; i++) {
                        dataSource.datasets[0].data[i] = res.data.myBudget[i].budget;
                        dataSource.labels[i] = res.data.myBudget[i].title;
                    }
                    createChart();
                    color.domain(dataSource.labels);
                    change(dataAssign());
                })
                .catch(function (error) {
                    console.error('Error fetching budget:', error);
                });
            }
            getBudget();

            return () => {
                if (myPieChart) {
                    myPieChart.destroy();
                }
            }
    }, []);

    return (
        <div className="charts">
            <article>
                <h2>Budget Chart</h2>
                <p>
                    <canvas id="myChart" width="400" height="400" ref={chartRef}></canvas>
                </p>
            </article>

            <article id="d3js">
                <h2>D3JS Chart</h2>
                <div id="d3chart" ref={d3Ref}></div>
            </article>
        </div>
    )
}

export default Graphs;  