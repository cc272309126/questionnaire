
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
			var chartType = (chart.type == 'radar')?'column':chart.type;
			
	    	if((chartType == 'column') || (chartType == 'bar')) {
	    		var chartData = getColumnData(chart,data);
	    		var graph = new Highcharts.Chart({
	    			chart: {
	    				renderTo: 'chart_image',
	    			    defaultSeriesType: chartType
	    			},
	    			title: {
	    				text: ''
	    			},
	    			xAxis: {
	    			    categories: chartData.categories
	    			},
	    			yAxis: {
	    			    min: 0,
	    			    title: {
	    			        text: 'Number of answers'
	    			    },
	    			},
	    			series: chartData.series
	    		});
	    		   
	    	}  else if(chartType == 'pie') {
	    		
				var chartData = [];
				$.each(data.chart, function(i,item){
					if(item.count > 0) {
						chartData.push([item.answer,item.count]);
					}
				});

	    		var graph = new Highcharts.Chart({
	    			chart: {
	    		    	renderTo: 'chart_image',
	    		    },
	    		    title: {
	    		        text: ''
	    		    },
	    		    series: [{
	    		    	type: 'pie',
	    		        name: 'Number of answers',
	    		        data: chartData
	    		      }]
	    		   });
	    	} 
		}
	);
}


function getColumnData(chart,data) {
	var chartData = {categories:[], series:[]};
	
	for (property in data.chart[0]) {
		if(property != 'answer') {
			chartData.series.push({name:property,data:[]});
		}
	}
	$.each(data.chart, function(i,item){
		chartData.categories.push(item.answer);
		$.each(chartData.series,function(j,serie){
			serie.data.push(item[serie.name]);
		});
	});
	return chartData;
}