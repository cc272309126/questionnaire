Questionnaire.views.Chart = Ext.extend(Questionnaire.views.AppPanel, {

	initComponent: function(){

    	this.chart = this.questionnaire.charts().getAt(this.chartIndex);

    	var dataFields = [];
    	var legend;
    	var params = 'question=' + this.chart.data.question;
    	
    	if(this.chart.data.diversify) {
    		params += '&diversifyBy=' + this.chart.data.diversify;
    		var diversifingQuestion = this.questionnaire.questions().findRecord('id',this.chart.data.diversify);
    		diversifingQuestion.answers().each(function(answer){
    			dataFields.push(answer.data.label);
    		});
    		legend = {
	            position: {
	                portrait: 'top',
	                landscape: 'center'
	            }
	        };
    	} else {
    		dataFields.push('count');
    	}
    	
    	
    	
    	this.store = new Ext.data.Store({
    		fields: ['answer'].concat(dataFields),
	        proxy: {
	            type: 'ajax',
	            url : '/wisdom/Questionnaire/mobile/getChartData.do?' + params,
	            reader: {
	                type: 'json',
	                root:'chart'
	            }
	        }
    	});
    	
    	if(this.chart.data.type == 'column') {
	    	this.graph = {
	            margin:20,
	            xtype: 'chart',
	            store: this.store,
	            animate: true,
	            shadow: false,
	            legend: legend,
	            axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: dataFields,
	                label: {
	                    renderer: function(v) {
	                        return (v.toFixed(0) == v)?v:"";
	                    }
	                },
	                title: 'Answers',
	                minimum: 0
	            },
	            {
	                type: 'Category',
	                position: 'bottom',
	                fields: ['answer']
	            }],
	            series: [{
	                type: 'column',
	                axis: 'left',
	                xField: 'answer',
	                yField: dataFields,
	                highlight: true,
	                showInLegend: true
	            }]
	        };
	    	
    	} else if(this.chart.data.type == 'bar') {
		    this.graph = {
		        margin:20,
		        xtype: 'chart',
		        store: this.store,
		        animate: true,
		        shadow: false,
		        legend: legend,
		        axes: [{
		            type: 'Numeric',
		            position: 'bottom',
		            fields: dataFields,
		            label: {
		                renderer: function(v) {
                    		return (v.toFixed(0) == v)?v:"";
		                }
		            },
		            title: 'Answers',
		            minimum: 0
		        },
		        {
		            type: 'Category',
		            position: 'left',
		            fields: ['answer']//,
		            //override label renderer: to return empty string since we display 
		            //the label on data
		            /*label: {
		                renderer: function(v) {
		                    return "";
		                }
		            }*/
		        }],
		        series: [{
		            type: 'bar',
		            axis: 'bottom',
		            /*label: {
		                display: 'insideEnd',
		                field: 'answer',
		                orientation: 'horizontal',
		                color: '#333',
		                'text-anchor': 'middle'
		            },*/
		            xField: 'answer',
		            yField: dataFields,
		            highlight: true,
		            showInLegend: true
		        }]
		    };
		    	
    	} else if(this.chart.data.type == 'pie') {
    		
	    	this.graph = new Ext.chart.Chart({
		        margin:20,
    		    animate: true,
    		    store: this.store,
    		    series: [{
    		        type: 'pie',
    		        angleField: dataFields,
    		        //showInLegend: true,
    		        label: {
    		            field: 'answer',
    		            display: 'rotate',
    		            contrast: true
    		        }
    		    }]
    		});
    		
    	} else if (this.chart.data.type == 'radar') {

    		var series = [];
    		for(var i=0; i<dataFields.length; i++) {
    			series.push({
       		        type: 'radar',
       		        xField: 'answer',
       		        yField: dataFields[i],
       		        showInLegend: true,
       		        showMarkers: true
    			});
    		}
    		
    		this.graph = new Ext.chart.Chart({
    		    animate: true,
    		    store: this.store,
    		    legend: legend,
    		    axes: [{
    		        type: 'Radial',
    		        position: 'radial',
    		        label: {
    		            display: true,
    		            renderer: function(v) {
                    		return (v.toFixed(0) == v)?v:"";
		                }
    		        }
    		    }],
    		    series: series
    		});
    	}

    	this.store.load();
    	
        this.items = [new Ext.chart.Panel({
            title: this.chart.data.name,
            items: [
                this.graph
            ]})
        ];
        
        Questionnaire.views.Chart.superclass.initComponent.call(this);
    },
    
    
    onNextAction: function() {
    	if(this.questionnaire.charts().getCount() != (this.chartIndex+1)) {
			
			var chartCard = new Questionnaire.views.Chart({
		        prevCard: this,
		        chartIndex: this.chartIndex+1,
		        questionnaire: this.questionnaire
		    });
			this.ownerCt.setActiveItem(chartCard/*, 'slide'*/);
		} else {
			var currentCard = this;
			while(currentCard.prevCard) {
				currentCard = currentCard.prevCard;
				//TODO: destroy cards which are not used anymore
			}
			this.ownerCt.setActiveItem(currentCard);
		}
    }

});

Ext.reg('Chart', Questionnaire.views.Chart);