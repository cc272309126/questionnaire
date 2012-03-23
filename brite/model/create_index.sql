
CREATE INDEX t_quest_answer_index_idx
  ON t_quest_answer
  USING btree (index);



CREATE INDEX t_quest_answer_question_idx
  ON t_quest_answer
  USING btree (question);


CREATE INDEX t_quest_chart_question_idx
  ON t_quest_chart
  USING btree (question);


CREATE INDEX t_quest_chart_index_idx
  ON t_quest_chart
  USING btree (index);


CREATE INDEX t_quest_question_index_idx
  ON t_quest_question
  USING btree (index);


CREATE INDEX t_quest_question_questionnaire_idx
  ON t_quest_question
  USING btree (questionnaire);


CREATE INDEX t_quest_user_tideacc_idx
  ON t_quest_user
  USING btree (tideacc);


CREATE INDEX t_quest_user_name_idx
  ON t_quest_user
  USING btree (name);

CREATE INDEX t_quest_useranswer_answer_idx
ON t_quest_useranswer
USING btree (answer);


CREATE INDEX t_quest_useranswer_person_idx
  ON t_quest_useranswer
  USING btree (person);


CREATE INDEX t_quest_useranswer_question_idx
  ON t_quest_useranswer
  USING btree (question);



