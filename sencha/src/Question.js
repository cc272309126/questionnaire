Questionnaire.views.Question = Ext.extend(Questionnaire.views.AppPanel, {

	scroll: 'vertical',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent: function(){
    	this.question = this.questionnaire.questionsToAnswer.getAt(this.questionIndex);

        var answers = [];
        for(var i=0; i<this.question.answers().data.length; i++) {
        	var answer = this.question.answers().getAt(i);
       		if(this.question.data.multiple) {
       			answers[i] = {
         			xtype: 'checkboxfield',
           			label: answer.data.label,
                    labelWidth: '80%',
        			value: answer.data.id,
     				name: answer.data.id,
        			checked:false
        		};
        	} else {
        		answers[i] = {
            		xtype: 'radiofield',
            		label: answer.data.label,
                    labelWidth: '80%',
        			value: answer.data.id,
        			name: this.question.data.id,
            		checked: i==0,
        		};
        	}
        }
        
        this.form = new Ext.form.FormPanel({
        	title:'Select',
        	items:[
		        {
		            xtype: 'fieldset',
		            margin:20,
		            items: answers
		        }
		    ]
		});
        
        this.items = [
            {
            	tpl: new Ext.XTemplate( '<h3>{question}</h3></h4>'),
	            data: this.question.data,
	            styleHtmlContent: true
	        },
	        this.form
	    ];
        
        Questionnaire.views.Question.superclass.initComponent.call(this);
    },
    
    
    onNextAction: function() {
		var answers = this.getAnswers();

		if(this.validateAnswers(answers)) {
			//remember user answers in question data store so they are available 
			//for submition at the end
			this.question.data['value'] = answers;
			
			if(this.questionnaire.questionsToAnswer.getCount() != (this.questionIndex+1)) {
				//there are still more questions: display next one
				var questionCard = new Questionnaire.views.Question({
			        prevCard: this,
			        questionIndex: this.questionIndex+1,
			        questionnaire: this.questionnaire
			    });
				this.ownerCt.setActiveItem(questionCard, 'slide');
			} else {
				//that was the last question: display Summary Page
				var summaryCard = new Questionnaire.views.Summary({
			        prevCard: this,
			        questionnaire: this.questionnaire
			    });
				this.ownerCt.setActiveItem(summaryCard, 'slide');
			}
		} 
    },
    
    
    getAnswers: function() {
		var answers = [];
		if(this.question.data.multiple) {
			var values = this.form.getValues();
			this.question.answers().each(function(answer) {
				if(values[answer.data.id]) {
					answers.push(answer.data.id);
				}
			});
		} else {
			var value = this.form.getValues()[this.question.data.id];
			answers.push(value);
		}
		return answers;
    },

    
    validateAnswers: function(answers) {
    	var valid = true;
    	
		if(answers.length == 0) {
			Ext.Msg.alert("Error","Select at least one answer");
			valid = false;
		} else if(this.question.data.multiple && (answers.length > this.question.data.allowed)) {
			Ext.Msg.alert("Error","Select no more than " + this.question.data.allowed + " answers");
			valid = false;
		}
		return valid;
    }

});

Ext.reg('Question', Questionnaire.views.Question);
