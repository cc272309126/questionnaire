Questionnaire.views.QuestionnaireList = Ext.extend(Ext.Panel, {
	layout: 'card',
	
    initComponent: function() {
	    
	    this.list = new Ext.List({
	        itemTpl: '<span class="name">{title}</span>',
	        loadingText: false,
	        store: new Ext.data.Store({
	            model: 'QuestionnaireList',
	            proxy: {
	                type: 'ajax',
	                url : '/wisdom/Questionnaire/mobile/getQuestionnaireList.do',
	                reader: {
	                    type: 'json',
	                    root:'questionnaire'
	                }
	            }
	        })
	    });
	    
        this.list.on('selectionchange', this.onSelect, this);

        this.list.on('render', function(){
            this.list.store.load();
            this.list.el.mask('<span class="top"></span><span class="right"></span><span class="bottom"></span><span class="left"></span>', 'x-spinner', false);
        }, this);

	    this.listpanel = new Ext.Panel({
	        items: this.list,
	        layout: 'fit',
	        dockedItems: [{
	            xtype: 'toolbar',
	            title: 'Questionnaires'
	        }]
	    })
	    
	    this.items = this.listpanel;
	    Questionnaire.views.QuestionnaireList.superclass.initComponent.call(this);
	},
	
    onSelect: function(selectionmodel, records){
        if (records[0] !== undefined) {

        	this.questionnaireStore = new Ext.data.Store({
                model: 'QuestionnaireDetails',
                proxy: {
                    type: 'ajax',
                    url : '/wisdom/Questionnaire/mobile/getQuestionnaireData.do?questionnaire=' + records[0].data.id,
                    reader: {
                        type: 'json',
                        root:'questionnaire'
                    }
                },
                listeners: {
                	scope: this,
                    load: function(data) {
	                	var questionnaire = data.data.items[0];
	                	questionnaire.questionsToAnswer = new Ext.data.Store({
	                	    model: 'Question'
	                	});
	                	questionnaire.questions().each(function(question) {
	                		if(!question.data.answered) {
	                			questionnaire.questionsToAnswer.add(question);
	                		}
	                	});
	                	
	                	if(questionnaire.questionsToAnswer.data.length > 0) {
		                	var questionCard = new Questionnaire.views.Question({
		                        prevCard: this.listpanel,
		                        questionIndex: 0,
		                        questionnaire: questionnaire
		                    });
		                	this.setActiveItem(questionCard, 'slide');
	                	} else {
		                	var chartCard = new Questionnaire.views.Chart({
		                        prevCard: this.listpanel,
		                        chartIndex: 0,
		                        questionnaire: questionnaire
		                    });
		                	this.setActiveItem(chartCard, 'slide');
	                	}
                	} 
                }
            });
        	this.questionnaireStore.load();
        }
    }
});

Ext.reg('QuestionnaireList', Questionnaire.views.QuestionnaireList);
