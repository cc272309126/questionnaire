Questionnaire.views.Summary = Ext.extend(Questionnaire.views.AppPanel, {

	scroll: 'vertical',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent: function(){

    	this.appToolbarItems = [
			{
			    text: 'Submit',
			    scope: this,
			    handler: this.onSubmitAction
			}                    
    	];
    	
    	var questions = [];
    	this.questionnaire.questionsToAnswer.each(function(question){
    		var answers= [];
    		for(var i=0; i<question.data.value.length; i++ ) {
    			var value = question.data.value[i];
    			question.answers().each(function(answer){
    				if(answer.data.id == value) {
    					answers.push(answer.data.label);
    				}
    			});
    		}
    		questions.push({
    			question: question.data.question,
    			answers:answers
    		});
    	},this);
    	this.items = [{
    	    tpl: new Ext.XTemplate( '<h3>Summary</h3><div><ul>',
    	        '<tpl for="questions">',
    	            '<li>{question}</li>',
    	                '<ul>',
    	              		'<tpl for="answers">',
    	                      	'<li><b>{[values]}</b></li>',
    	              		'</tpl>',
    	                '</ul>',
    	         '</tpl>',
    	         '</ul></div>'),
    	  	 data: {'questions':questions},
    	  	 styleHtmlContent: true
    	}];
    	Questionnaire.views.Summary.superclass.initComponent.call(this);
    },

    
    onSubmitAction: function() {
    	var answers = [], i=0;
    	this.questionnaire.questionsToAnswer.each(function(question){
    		answers[i] = {
    			question:question.data.id,
    			answers:question.data.value
    		};
    		i = i + 1;
    	},this);
    	
    	Ext.Ajax.request({
    		url: '/wisdom/Questionnaire/mobile/submitAnswers.do',
    		jsonData: { 'answers': answers },
    		scope:this,
    		success: function(response, opts) {
    		  this.showResults();
    		},
    		failure: function(response, opts) {
    		  console.log('server-side failure with status code ' + response.status);
    		  this.showResults();
    		}
    	});
    },
    
    
    showResults: function() {
    	var resultsCard = new Questionnaire.views.Chart({
            prevCard: this,
            chartIndex:0,
            questionnaire: this.questionnaire
        });
    	this.ownerCt.setActiveItem(resultsCard, 'slide');
    }
});

Ext.reg('Summary', Questionnaire.views.Summary);
