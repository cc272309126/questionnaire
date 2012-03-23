var QuestionnaireApp = {
	SUBMIT_MODE_ALL_QUESTIONS : 0,
	SUBMIT_MODE_SINGLE_QUESTION : 1,
		
	questionnaires: null,	
		
	questionnaire: null,
	
	questions : [],
	
	questionIndex: -1,
	
	chartIndex: -1
};




$(document).bind( "pagebeforechange", function( e, data ) {

	if ( typeof data.toPage === "string" ) {
		var u = $.mobile.path.parseUrl( data.toPage );
		var $page = $(u.hash.replace( /\?.*$/, "" ));

		if ( u.hash.search(/^#questionnaire_page/) !== -1 ) {
			var questionnaire = u.hash.replace( /.*index=/, "" );
			displayQuestionnaire(questionnaire!= '#questionnaire_page'?questionnaire:QuestionnaireApp.questionnaire.id);
		} else if(u.hash.search(/^#question_page/) !== -1) {
			var question = u.hash.replace( /.*index=/, "" );
			data.options.changeHash = false;
			displayQuestion(parseInt(question));
		} else if(u.hash.search(/^#chart_page/) !== -1) {
			var chart = u.hash.replace( /.*index=/, "" );
			data.options.changeHash = false;
			displayChart(parseInt(chart));
		} else if(u.hash.search(/^#summary_page/) !== -1) {
			data.options.changeHash = false;
			displaySummary();
		} else if(u.hash.search(/^#thanks_page/) !== -1) {
			data.options.changeHash = false;
		} else if(u.hash.search(/^#already_answered_page/) !== -1) {
			data.options.changeHash = false;
		} else if(u.hash.search(/^#list_page/) !== -1) {
			return;
		}
		
		data.options.dataUrl = u.href;
		$.mobile.changePage( $page, data.options );
		e.preventDefault();
	} 
	else 
	{
		if(data.toPage[0] && (data.toPage[0].id == 'list_page')) {
			if(!QuestionnaireApp.questionnaires) {
				displayQuestionnaireList();
			}
		}
	}
	
});



function displayQuestionnaireList() {
	$.getJSON("/wisdom/Questionnaire/mobile/getQuestionnaireList.do",
		{},
		function(data) {
			$("#questionnaires").empty();
			$.each(data.questionnaire, function(i,questionnaire){
				$("#questionnaires").append('<li><a href="#questionnaire_page?index=' + questionnaire.id + '">' + questionnaire.title + '</a></li>');
			});
			$("#questionnaires").listview('refresh'); 
			QuestionnaireApp.questionnaires = data;
		}
	);
};



function displayQuestionnaire(id) {
	if(!QuestionnaireApp.questionnaire || (QuestionnaireApp.questionnaire.id != id) ) {
		$.getJSON("/wisdom/Questionnaire/mobile/getQuestionnaireData.do?questionnaire=" + id,
			{},
			function(data) {
				QuestionnaireApp.questionnaire = data.questionnaire[0];
				$("#description").html(QuestionnaireApp.questionnaire.description);
				$("#question_total").html(QuestionnaireApp.questionnaire.questions.length);
				$("#chart_total").html(QuestionnaireApp.questionnaire.charts.length);
				
				$.each(QuestionnaireApp.questionnaire.questions, function(i, question){
					if(!question.answered) {
						QuestionnaireApp.questions.push(question);
					}
				});
				
				updateQuestionnaireTitle("#questionnaire_page");
				updateQuestionnaireTitle("#question_page");
				updateQuestionnaireTitle("#summary_page");
				updateQuestionnaireTitle("#thanks_page");
				updateQuestionnaireTitle("#already_answered_page");
				updateQuestionnaireTitle("#chart_page");
				
				if(QuestionnaireApp.questionnaire.submitmode == QuestionnaireApp.SUBMIT_MODE_ALL_QUESTIONS) {
			    	$('#submit_single_question').hide();
			    } else {
			    	$('#submit_all_questions').hide();
			    }
/*
		    	$('#charts_available').hide();
		    	$('#thanks_charts_available').hide();
*/

		    	if(QuestionnaireApp.questionnaire.charts.length > 0) {
			    	$('#no_charts').hide();
			    	$('#thanks_no_charts').hide();
			    } else {
			    	$('#charts_available').hide();
			    	$('#thanks_charts_available').hide();
			    }
			}
		);
	}
    if(!QuestionnaireApp.questionnaires) {
    	$('#with_list').hide();
    } else {
    	$('#without_list').hide();
    }
};


function startQuestions() {
	if(QuestionnaireApp.questions.length > 0) {
		$.mobile.changePage( '#question_page?index=0', 'slide' );
	} else {
		$.mobile.changePage( '#already_answered_page', 'slide' );
	}
}

function displayQuestionnaireHomePage() {
	$.mobile.changePage( '#questionnaire_page?index=' + QuestionnaireApp.questionnaire.id, 'slide' );
}

function displayLastQuestion() {
	$.mobile.changePage( '#question_page?index=' + (QuestionnaireApp.questionnaire.questions.length-1), 'slide' );
}


function displayQuestion(nr) {
	QuestionnaireApp.questionIndex = nr;
	
	var question = QuestionnaireApp.questions[nr];
	$("#question_page").page();

	$("#question").html(question.question);
	$("#question_index").html(nr+1);
	$("#question_help").html((question.multiple && question.allowed > 1)?'Select up to ' + question.allowed + ' answers':' Select one answer');
	$("#error_message").html('');

	$("#answers").empty();
    var fieldset = $("#answers").append('<fieldset data-role="controlgroup" data-theme="a">');
    $.each(question.answers,function(i,answer){
    	if(question.multiple) {
    		var checked = (question.value && isAnswerOn(question,answer));
    		fieldset.append('<input type="checkbox" name="' + answer.id + '" id="' + answer.id + '" ' + (checked?' checked="checked"':'')+ '/><label for="' + answer.id + '">' + answer.label + '</label>');
    	} else {
    		var checked = ((!question.value && i == 0) || (question.value && isAnswerOn(question,answer)));
    		fieldset.append('<input type="radio" name="answer" id="'+ answer.id + '" value="' + answer.id + '"' + (checked?' checked="checked"':'') + '/><label for="'+ answer.id + '">'+answer.label+'</label>');
    	}
    });
    fieldset.trigger('create');
}


function isAnswerOn(question, answer) {
	var on = false;
	$.each(question.value, function(j,value){
		if(value == answer.id) {
			on = true;
		}
	});
	return on;
}


function displaySummary() {
	var markup = '<ul>';
	$.each(QuestionnaireApp.questions, function(i, question){
		markup += '<li style="margin-top:15px; margin-bottom:5px">' + question.question + '</li>';
		markup += '<ul>';
		$.each(question.value, function(j, value){
			var answerLabel = '';
			$.each(question.answers, function(k, answer){
				if(answer.id == value) {
					answerLabel = answer.label;
				}
			});
			markup += '<li><b>'+answerLabel+'</b></li>';
		});
		markup += '</ul>';
	});
	markup += '</ul>';
	$("#summary").html(markup);
}



function getCurrentAnswers() {
	var values = [];
	
	var question = QuestionnaireApp.questions[QuestionnaireApp.questionIndex];
	if(question.multiple) {
		var rb = $("input:checkbox:checked");
		$.each(rb,function(i,answer){
			values.push(answer.id);
	    });
	} else {
		var rb = $("input:radio:checked");
		values.push(rb.val());
	}
	if(values.length == 0) {
		error('Select at least one answer');
		values = null;
	} else if(values.length  > question.allowed) {
		error('Select no more than ' + question.allowed + ' answers');
		values = null;
	}
	return values;
}



function validateAnswers(moveQuestion) {
	var values = getCurrentAnswers();
	if(values) {
		QuestionnaireApp.questions[QuestionnaireApp.questionIndex].value = values;

		if(QuestionnaireApp.questionnaire.submitmode == QuestionnaireApp.SUBMIT_MODE_SINGLE_QUESTION) {
			submitAnswers(QuestionnaireApp.questionIndex);
		}		
		
		var nextQuestion = QuestionnaireApp.questionIndex + moveQuestion;
		if(nextQuestion == QuestionnaireApp.questions.length) {
			if(QuestionnaireApp.questionnaire.submitmode == QuestionnaireApp.SUBMIT_MODE_SINGLE_QUESTION) {
				QuestionnaireApp.questions = [];
				$.mobile.changePage('#thanks_page','slide');
			} else {
				displaySummary();
				$.mobile.changePage('#summary_page','slide');
			}
		} else if(nextQuestion == -1){
			$.mobile.changePage('#questionnaire_page','slide');
		} else {
			displayQuestion(nextQuestion);
		}
	}
}

function updateQuestionnaireTitle(pageName) {
	var $page = $(pageName);
	var $header = $page.children( ":jqmData(role=header)" );
	$header.find( "h1" ).html(QuestionnaireApp.questionnaire.title);
}


function error(message) {
	$("#error_message").html(message);
}


function submitAnswers(nr) {
	var answers = [];
	
	if(nr != null) {
		var question = QuestionnaireApp.questions[nr];
   		answers[0] = {
	   		question:question.id,
	   		answers:question.value
	   	};
	} else {
		$.each(QuestionnaireApp.questions, function(i, question){
	   		answers[i] = {
	   			question:question.id,
	   			answers:question.value
	   		};
		});	
	}
	
	$.post("/wisdom/Questionnaire/mobile/submitAnswers.do", 
		JSON.stringify({answers:answers}),
		function(data){
		    if(QuestionnaireApp.questionnaire.submitmode == QuestionnaireApp.SUBMIT_MODE_ALL_QUESTIONS) {
		    	QuestionnaireApp.questions = [];
		    	$.mobile.changePage('#thanks_page','slide');
		    }
		}
	);
}


function showChart(change) {
	var newChart = QuestionnaireApp.chartIndex + change;
	if((newChart < 0) || (newChart == QuestionnaireApp.questionnaire.charts.length)) {
		$.mobile.changePage('#questionnaire_page?index='+QuestionnaireApp.questionnaire.id,'slide');
	} else {
		displayChart(newChart);
	}
}
