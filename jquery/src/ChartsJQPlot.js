

function displayChart(id) {
	QuestionnaireApp.chartIndex = id;
	var chart = QuestionnaireApp.questionnaire.charts[id];
	var params = 'question=' + chart.question;
	if(chart.diversify) {
		params += '&diversifyBy=' + chart.diversify;
	}
	$('#chart_title').html(chart.name);
	$('#chart_index').html(id+1);
	
	$.getJSON("/wisdom/Questionnaire/mobile/getChartData.do?"+params,
		{},
		function(data) {


			   // For horizontal bar charts, x an y values must will be "flipped"
		    // from their vertical bar counterpart.
		    var plot2 = $.jqplot('chart_image', [
		        [[2,1], [4,2], [6,3], [3,4]], 
		        [[5,1], [1,2], [3,3], [4,4]], 
		        [[4,1], [7,2], [1,3], [2,4]]], {
		        seriesDefaults: {
		            renderer:$.jqplot.BarRenderer,
		            // Show point labels to the right ('e'ast) of each bar.
		            // edgeTolerance of -15 allows labels flow outside the grid
		            // up to 15 pixels.  If they flow out more than that, they 
		            // will be hidden.
		            pointLabels: { show: true, location: 'e', edgeTolerance: -15 },
		            // Rotate the bar shadow as if bar is lit from top right.
		            shadowAngle: 135,
		            // Here's where we tell the chart it is oriented horizontally.
		            rendererOptions: {
		                barDirection: 'horizontal'
		            }
		        },
		        axes: {
		            yaxis: {
		                renderer: $.jqplot.CategoryAxisRenderer
		            }
		        }
		    });
		}
		);
}

