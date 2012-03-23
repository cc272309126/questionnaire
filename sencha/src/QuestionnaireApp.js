

this.QuestionnaireApp = new Ext.Application({
    name: 'Questionnaire',
    
    launch: function() {
        this.viewport = new Ext.Panel({
            fullscreen: true,

            layout: 'card',
            items : [
				{
				    xtype: 'QuestionnaireList'
				}
            ]
        });
        
        
    }
});
