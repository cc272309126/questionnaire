Questionnaire.views.AppPanel = Ext.extend(Ext.Panel, {

	layout: 'card',

    
	initComponent: function(){

		var items = [];
	
    	if(this.prevCard) {
    		items.push({
                ui: 'back',
                text: 'Back',
                scope: this,
                handler: function(){
                    this.ownerCt.setActiveItem(this.prevCard, {
                        type: 'slide',
                        reverse: true,
                        scope: this,
                        after: function(){
                            this.destroy();
                        }
                    });
                }
        	});
    	};
    	
    	items.push({xtype: 'spacer'});
    	
    	if(this.appToolbarItems) {
    		items.push(this.appToolbarItems);
    	}

    	if(this.onNextAction) {
    		items.push({
                text:'Next',
                scope: this,
                handler: this.onNextAction
            });
    	}

		this.dockedItems = [{
	        xtype: 'toolbar',
	        items: items
	    }];

		Questionnaire.views.AppPanel.superclass.initComponent.call(this);
    }});

Ext.reg('AppPanel', Questionnaire.views.AppPanel);
