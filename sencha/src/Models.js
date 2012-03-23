Ext.regModel('QuestionnaireList', {
	fields: [
	    {name: 'id',       		type: 'string'},
	 	{name: 'title',    		type: 'string'},
	 	{name: 'description',   type: 'string'}
	]    
});


Ext.regModel('QuestionnaireDetails', {
    hasMany: [
        {
        	model: 'Chart',
        	name: 'charts'
        },
        {
        	model: 'Question',
        	name: 'questions'
        }
    ],
	fields: [
	 	{name: 'id',       		type: 'string'},
		{name: 'title',    		type: 'string'},
		{name: 'description',   type: 'string'}
	]    
});

Ext.regModel('Question', {
	belongsTo: 'Questionaire',
    hasMany: {
        model: 'Answer',
        name: 'answers'
    },
	fields: [
		{name: 'id',       		type: 'string'},
		{name: 'question',    	type: 'string'},
		{name: 'multiple',    	type: 'boolean'},
		{name: 'allowed',    	type: 'integer'},
		{name: 'answered',    	type: 'boolean'}
	]
});

Ext.regModel('Answer', {
	fields: [
		{name: 'id',       	type: 'string'},
		{name: 'label', 	type: 'string'}
	]
});

Ext.regModel('Chart', {
	belongsTo: 'Questionaire',
	fields: [
		{name: 'id',       		type: 'string'},
		{name: 'name',    		type: 'string'},
		{name: 'question', 		type: 'string'},
		{name: 'type', 			type: 'string'},
		{name: 'diversify', 	type: 'string'}
	]
});
