package nato.act.tide.questionnaire;


import java.io.*;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.*;
import javax.servlet.http.*;

import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONWriter;

import org.apache.log4j.Logger;
import org.joda.time.DateTime;
import org.apache.commons.codec.binary.Base64;

import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.category.CategoryDataset;
import org.jfree.data.general.DefaultPieDataset;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.ChartUtilities;

import nato.act.tide.wisdom.database.DBManager;




public class QuestionnaireMobileService {

    private static Logger    log  = Logger.getLogger(QuestionnaireMobileService.class.getName());

    Connection connection = null;
    
	public QuestionnaireMobileService() throws SQLException  {
		connection = DBManager.getConnection("Wisdom");
	}
	

	public void doGet(HttpServletRequest request,HttpServletResponse response) throws SQLException, IOException , JSONException, ServletException
	{
		try {

			if(request.getRequestURL().toString().endsWith("getQuestionnaireList.do") ) {
				getQuestionnaireList(new JSONWriter(response.getWriter()));
			} else if(request.getRequestURL().toString().endsWith("getQuestionnaireData.do") ) {
				getQuestionnaireData(getUserId(getUserName(request,response)),request.getParameter("questionnaire"),new JSONWriter(response.getWriter()));
			} else if(request.getRequestURL().toString().endsWith("getChartData.do") ) {
				if(request.getParameter("diversifyBy") == null) { 
					getChartData(request.getParameter("question"),new JSONWriter(response.getWriter()));
				} else {
					getChartData(request.getParameter("question"), request.getParameter("diversifyBy"),new JSONWriter(response.getWriter()));
				}
			} else if(request.getRequestURL().toString().endsWith("clearData.do") ) {
				clearQuestionnaireData(getUserId(getUserName(request,response)),request.getParameter("questionnaire"),new JSONWriter(response.getWriter()));
			} else if(request.getRequestURL().toString().endsWith("clearAllData.do") ) {
				clearQuestionnaireData(-1,request.getParameter("questionnaire"),new JSONWriter(response.getWriter()));
			} else if(request.getRequestURL().toString().endsWith("getXmlChartData.do") ) {
				response.setContentType("application/xml");
				if(request.getParameter("diversifyBy") == null) { 
					getXmlChartData(request.getParameter("question"),response.getWriter());
				} else {
					getXmlChartData(request.getParameter("question"), request.getParameter("diversifyBy"),response.getWriter());
				}
				
			} else if(request.getRequestURL().toString().endsWith("getChartImage.do") ) {
				response.setContentType("image/jpg");
				String type = request.getParameter("type");
				String question = request.getParameter("question");
				String diversifyBy = request.getParameter("diversifyBy");
				String width = request.getParameter("width");
				String height = request.getParameter("height");
				
				if(diversifyBy == null) { 
					generateBarChart(question,type,width,height,response.getOutputStream());
				} else {
					generateBarChart(question,diversifyBy,type,width,height,response.getOutputStream());
				}
			}
		} finally {
			if(connection != null) {
				try {
					connection.close();
				} catch (SQLException ex) {
					log.error(ex);
				}
			}
		}
	}

	
	public void doPost(HttpServletRequest request,HttpServletResponse response) throws SQLException, IOException , JSONException, ServletException
	{
		JSONWriter json = new JSONWriter(response.getWriter());
		
		try {
			JSONObject jsonRequest = getRequestContent(request);			
			if(jsonRequest != null) {
				long userId = getUserId(getUserName(request,response));
				if(request.getRequestURL().toString().endsWith("submitAnswers.do") ) {
					submitAnswers(userId,jsonRequest,json);
				} 
			} else {
				log.error("Emty JSON request");
			}
		} finally {
			if(connection != null) {
				try {
					connection.close();
				} catch (SQLException ex) {
					log.error(ex);
				}
			}
		}
	}


	private JSONObject getRequestContent(HttpServletRequest request) throws ServletException, IOException 
	{
		JSONObject jsonObject = null;
		
		StringBuffer jb = new StringBuffer();
		String line = null;
		try {
			BufferedReader reader = request.getReader();
			while ((line = reader.readLine()) != null) {
				jb.append(line);
			}
			log.debug("REQUEST: [" + jb.toString() + "]");
			jsonObject = new JSONObject(jb.toString());
		} catch (Exception e) { //report an error }
			log.error(e);
		}
		return jsonObject;
	}

	
	private String getUserName(HttpServletRequest request,HttpServletResponse response) throws ServletException, IOException {

		String header = request.getHeader("Authorization"); 
		if(header != null && !header.isEmpty()) {
		    //always wise to assert your assumptions
		    assert header.substring(0, 6).equals("Basic "); 
		    //will contain "Ym9iOnNlY3JldA=="
		    String basicAuthEncoded = header.substring(6);
		    //will contain "bob:secret"
		    String basicAuthAsString = new String(new Base64().decode(basicAuthEncoded.getBytes()));
		    String strings[] =  basicAuthAsString.split(":");
		    return (strings.length > 0)?strings[0]:null;
		} else {
			return "guest";
		}
	}
	
	private long getUserId(String tidepediaAccountName) throws SQLException {
		long id = -1;
		PreparedStatement ps = connection.prepareStatement("SELECT id FROM t_quest_user WHERE tideacc = '" + tidepediaAccountName + "'");
        ResultSet rs = ps.executeQuery();
        if(rs.next()) {
        	id = rs.getLong("id");
        } else {
        	id = createUser(tidepediaAccountName);
        }
	    rs.close();
	    ps.close();
        return id;
	}
	

	private long createUser(String tidepediaAccountName) throws SQLException {
		long id = -1;
		PreparedStatement ps = connection.prepareStatement("INSERT INTO t_quest_user (name,tideacc) VALUES ('" + tidepediaAccountName + "','" + tidepediaAccountName + "')");
		ps.execute();
	    ps.close();
		return getUserId(tidepediaAccountName);
	}

	
	private void getQuestionnaireList(JSONWriter json) throws SQLException, JSONException
	{
		json.object();
		json.key("questionnaire").array();
        PreparedStatement ps = connection.prepareStatement("SELECT id,title,description FROM t_quest_questionnaire WHERE active = true");
        ResultSet rs = ps.executeQuery();
        while(rs.next()) {
        	json.object()
        		.key("id").value(rs.getString("id"))
        		.key("title").value(rs.getString("title"))
        		.key("description").value(rs.getString("description"));
        	json.endObject();
        }
		json.endArray();
		json.endObject();
	    
		rs.close();
	    ps.close();
	} 

	
	private void getQuestionnaireData(long userId, String questionnaire, JSONWriter json) throws SQLException, JSONException
	{
		json.object();
		json.key("questionnaire").array();

		PreparedStatement ps = connection.prepareStatement(
			"SELECT id,title,description,submitmode " + 
				" FROM t_quest_questionnaire " + 
				" WHERE id = " + questionnaire);
        ResultSet rs = ps.executeQuery();
        if(rs.next()) {
    		json.object()
    			.key("id").value(rs.getString("id"))
    			.key("title").value(rs.getString("title"))
    			.key("description").value(rs.getString("description"))
    			.key("submitmode").value(rs.getInt("submitmode"));
        	getQuestions(userId,questionnaire, json);
        	getCharts(questionnaire, json);
    		json.endObject();
        }
		json.endArray();
		json.endObject();

		rs.close();
	    ps.close();
	} 


	private void clearQuestionnaireData(long userId, String questionnaire, JSONWriter json) throws SQLException, JSONException
	{
		json.object();
		json.key("status").value("ok");

		log.debug("Delete questions for " + userId + " in questionnaire = " + questionnaire);

		PreparedStatement ps = connection.prepareStatement(
			"DELETE FROM t_quest_useranswer "  +
				" WHERE " +
					((userId != -1)?(" person = " + userId + " AND "):"") + 
				"  question IN (" +
					" SELECT id" +
					" FROM t_quest_question " +
					" WHERE questionnaire = " + questionnaire + 
					")");
		ps.execute();
	    ps.close();
	} 

	
	private void getQuestions(long userId, String questionnaireId, JSONWriter json) throws SQLException, JSONException
	{
		json.key("questions").array();
		
        PreparedStatement ps = connection.prepareStatement(
		    "SELECT id,question,multiple,allowed,  " +
		        " (SELECT count(*) " +
		            " FROM t_quest_useranswer answer" +  
			        " WHERE answer.question = question.id AND person = " + userId + 
		            ") as count" +  
			    " FROM t_quest_question question" + 
			    " WHERE question.questionnaire = " + questionnaireId + 
			    "ORDER BY index ASC"
      	);
		
        ResultSet rs = ps.executeQuery();
        while(rs.next()) {
        	json.object()
        		.key("id").value(rs.getString("id"))
        		.key("question").value(rs.getString("question"))
        		.key("multiple").value(rs.getBoolean("multiple"))
        		.key("allowed").value(rs.getInt("allowed"))
    			.key("answered").value((rs.getInt("count") > 0));
        	getAnswers(rs.getLong("id"),json);
        	json.endObject();
        }
		json.endArray();

	    rs.close();
	    ps.close();
	} 

	
	private void getAnswers(long questionId, JSONWriter json) throws SQLException, JSONException
	{
		json.key("answers").array();

		PreparedStatement ps = connection.prepareStatement(
			"SELECT id,answer " + 
				" FROM t_quest_answer " + 
				" WHERE question = " + questionId + 
				" ORDER BY index ASC");
        ResultSet rs = ps.executeQuery();
        while(rs.next()) {
    		json.object()
    			.key("id").value(rs.getString("id"))
    			.key("label").value(rs.getString("answer"));
    		json.endObject();
        }
		json.endArray();

	    rs.close();
	    ps.close();
	} 

	
	
	private void getCharts(String questionnaireId, JSONWriter json) throws SQLException, JSONException
	{
		json.key("charts").array();
        PreparedStatement ps = connection.prepareStatement("SELECT id,name,question,type,diversify " + 
        		" FROM t_quest_chart " + 
        		" WHERE questionnaire = " + questionnaireId + 
        		" ORDER BY index ASC");
        ResultSet rs = ps.executeQuery();
        while(rs.next()) {
        	json.object()
        		.key("id").value(rs.getString("id"))
        		.key("name").value(rs.getString("name"))
        		.key("question").value(rs.getString("question"))
        		.key("type").value(rs.getString("type"))
        		.key("diversify").value(rs.getString("diversify"));
        	json.endObject();
        }
		json.endArray();

	    rs.close();
	    ps.close();
	} 

	
	private void submitAnswers(long userId,  JSONObject request, JSONWriter json) throws SQLException, JSONException 
	{
		StringBuffer query = new StringBuffer("");
		JSONArray questions = request.getJSONArray("answers");
		
		for(int i=0; i< questions.length(); i++) {
			JSONObject question = questions.getJSONObject(i);
			JSONArray answers = question.getJSONArray("answers");
			
			for(int j=0; j<answers.length(); j++) {
				long answer = answers.getLong(j);
		        query.append(
		        	"INSERT INTO t_quest_useranswer " + 
		        		"(person,question,answer) " + 
		        	" VALUES (" + 
		        		userId + ", " +
		        		question.getString("question") + ", " +
		        		answer +
		        	");"
		       );
			}
		}
		
		PreparedStatement ps = connection.prepareStatement(query.toString());
    	ps.execute();
	    ps.close();

    	json.object()
			.key("status").value("OK")
			.endObject();
	} 

	
	
	private void getChartData(String question, JSONWriter json) throws SQLException, JSONException
	{
		json.object();
		json.key("chart").array();

		PreparedStatement ps = connection.prepareStatement(
			"SELECT answer.answer, useranswers.count" + 
				" FROM t_quest_answer answer" + 
				" LEFT JOIN (" +
				"	SELECT answer, count(*) as count" + 
						" FROM t_quest_useranswer " + 
						" WHERE question = " + question + 
						" GROUP BY answer" + 
				 ") useranswers ON useranswers.answer = answer.id" + 
				 " WHERE answer.question = " + question
     	);
	    ResultSet rs = ps.executeQuery();
	    while(rs.next()) {
			json.object();
			json.key("answer").value(rs.getString("answer"));
			Long count = rs.getLong("count");
			json.key("count").value(rs.wasNull()?0:count);
			json.endObject();
		};
		json.endArray();
		json.endObject();

	    rs.close();
	    ps.close();
	} 

	
	private void getXmlChartData(String question, PrintWriter writer) throws SQLException, JSONException
	{
		writer.print("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
		writer.print("<chart>");
		PreparedStatement ps = connection.prepareStatement(
			"SELECT answer.answer, useranswers.count" + 
				" FROM t_quest_answer answer" + 
				" LEFT JOIN (" +
				"	SELECT answer, count(*) as count" + 
						" FROM t_quest_useranswer " + 
						" WHERE question = " + question + 
						" GROUP BY answer" + 
				 ") useranswers ON useranswers.answer = answer.id" + 
				 " WHERE answer.question = " + question
     	);
	    ResultSet rs = ps.executeQuery();
	    while(rs.next()) {
			writer.print("<item>");
			writer.print("<answer>" + rs.getString("answer").replace(' ', '_') + "</answer>");
			Long count = rs.getLong("count");
			writer.print("<count>" + (rs.wasNull()?0:count) + "</count>");
			writer.print("</item>");
		};

	    rs.close();
	    ps.close();
		writer.print("</chart>");
	} 


	
	private void getChartData(String question, String diversifyBy, JSONWriter json) throws SQLException, JSONException
	{
		json.object();
		json.key("chart").array();

		PreparedStatement ps = connection.prepareStatement(
			"SELECT id, answer" + 
				" FROM t_quest_answer answer" +
				" WHERE question = " + question
		);
	    ResultSet rs = ps.executeQuery();
	    while(rs.next()) {
			json.object();
			json.key("answer").value(rs.getString("answer"));
			PreparedStatement dps = connection.prepareStatement(
				"SELECT answer.answer, useranswers.count" + 
					" FROM t_quest_answer answer" + 
					" LEFT JOIN (" +
					"	SELECT answer, count(*) as count" + 
							" FROM t_quest_useranswer " + 
							" WHERE question = " + diversifyBy + 
								" AND person IN (SELECT DISTINCT person FROM t_quest_useranswer WHERE answer = " + rs.getString("id") + ")" + 
							" GROUP BY answer" + 
					 ") useranswers ON useranswers.answer = answer.id" + 
					 " WHERE answer.question = " + diversifyBy
			);
			log.debug(dps.toString());
			ResultSet drs = dps.executeQuery();
		    while(drs.next()) {
				Long count = drs.getLong("count");
				json.key(drs.getString("answer")).value(drs.wasNull()?0:count);
			};
		    drs.close();
		    dps.close();
			json.endObject();
	    }	
		json.endArray();
		json.endObject();

	    rs.close();
	    ps.close();
	}
	
	
	private void getXmlChartData(String question, String diversifyBy, PrintWriter writer) throws SQLException, JSONException
	{
		writer.print("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
		writer.print("<chart>");

		PreparedStatement ps = connection.prepareStatement(
			"SELECT id, answer" + 
				" FROM t_quest_answer answer" +
				" WHERE question = " + question
		);
	    ResultSet rs = ps.executeQuery();
	    while(rs.next()) {
			writer.print("<item>");
			writer.print("<answer>" + rs.getString("answer").replace(' ', '_') + "</answer>");

			PreparedStatement dps = connection.prepareStatement(
				"SELECT answer.answer, useranswers.count" + 
					" FROM t_quest_answer answer" + 
					" LEFT JOIN (" +
					"	SELECT answer, count(*) as count" + 
							" FROM t_quest_useranswer " + 
							" WHERE question = " + diversifyBy + 
								" AND person IN (SELECT DISTINCT person FROM t_quest_useranswer WHERE answer = " + rs.getString("id") + ")" + 
							" GROUP BY answer" + 
					 ") useranswers ON useranswers.answer = answer.id" + 
					 " WHERE answer.question = " + diversifyBy
			);
			ResultSet drs = dps.executeQuery();
			   while(drs.next()) {
				Long count = drs.getLong("count");
				writer.print("<" + drs.getString("answer").replace(' ', '_') + ">");
				writer.print(drs.wasNull()?0:count);
				writer.print("</" + drs.getString("answer").replace(' ', '_') + ">");
			};
			drs.close();
			dps.close();
			writer.print("</item>");
		}	
		rs.close();
		ps.close();
		writer.print("</chart>");
	}
	
	
	
	public void generateBarChart(String question, String diversifyBy, String type, String width, String height, OutputStream out) throws SQLException {

		String title = "X";
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();

        PreparedStatement ps1 = connection.prepareStatement(
			"SELECT question" + 
				" FROM t_quest_question " +
				" WHERE id = " + question
		);
        ResultSet rs1 = ps1.executeQuery();
        if(rs1.next()) {
        	title = rs1.getString("question");
        }
        rs1.close();
		ps1.close();
		log.debug("Title [" + title + "]");

		PreparedStatement ps = connection.prepareStatement(
			"SELECT id, answer" + 
				" FROM t_quest_answer answer" +
				" WHERE question = " + question
		);
		ResultSet rs = ps.executeQuery();
	    while(rs.next()) {
			String series =  rs.getString("answer");
			log.debug("Dataset [" + series + "]");

			PreparedStatement dps = connection.prepareStatement(
				"SELECT answer.answer, useranswers.count" + 
					" FROM t_quest_answer answer" + 
					" LEFT JOIN (" +
					"	SELECT answer, count(*) as count" + 
							" FROM t_quest_useranswer " + 
							" WHERE question = " + diversifyBy + 
								" AND person IN (SELECT DISTINCT person FROM t_quest_useranswer WHERE answer = " + rs.getString("id") + ")" + 
							" GROUP BY answer" + 
					 ") useranswers ON useranswers.answer = answer.id" + 
					 " WHERE answer.question = " + diversifyBy
			);
			ResultSet drs = dps.executeQuery();
			while(drs.next()) {
				Long count = drs.getLong("count");
				count = drs.wasNull()?0:count;
				String answer = drs.getString("answer");
				dataset.addValue(count, answer, series);
			};
			drs.close();
			dps.close();
	    };
	    rs.close();
		ps.close();
 
		JFreeChart chart = null;
		if(type.compareTo("bar") == 0) {
	        chart = ChartFactory.createBarChart("",title,"Number of answers",dataset,PlotOrientation.VERTICAL,true,true,false);
		} if(type.compareTo("bar3d") == 0) {
	        chart = ChartFactory.createBarChart3D("",title,"Number of answers",dataset,PlotOrientation.VERTICAL,true,true,false);
		} else if(type.compareTo("column") == 0) {
	        chart = ChartFactory.createBarChart("",title,"Number of answers",dataset,PlotOrientation.HORIZONTAL,true,true,false);
		}else if(type.compareTo("column3d") == 0) {
	        chart = ChartFactory.createBarChart3D("",title,"Number of answers",dataset,PlotOrientation.HORIZONTAL,true,true,false);
		};
		
        try {
        	if(chart != null) {
        		ChartUtilities.writeChartAsPNG(
        			out, 
        			chart, 
        			(width!=null)?Integer.parseInt(width):600, 
        			(height!=null)?Integer.parseInt(height):480
        		);
        	} else {
        		log.error("Unsupported chart type");
        	}
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

	
	
	public void generateBarChart(String question, String type, String width, String height, OutputStream out) throws SQLException {

		String title = "X";
        DefaultPieDataset dataset = new DefaultPieDataset();
        
        PreparedStatement ps1 = connection.prepareStatement(
			"SELECT question" + 
				" FROM t_quest_question " +
				" WHERE id = " + question
		);
        ResultSet rs1 = ps1.executeQuery();
        if(rs1.next()) {
        	title = rs1.getString("question");
        }
        rs1.close();
		ps1.close();

		
		PreparedStatement ps = connection.prepareStatement(
			"SELECT answer.answer, useranswers.count" + 
				" FROM t_quest_answer answer" + 
				" LEFT JOIN (" +
				"	SELECT answer, count(*) as count" + 
						" FROM t_quest_useranswer " + 
						" WHERE question = " + question + 
						" GROUP BY answer" + 
				 ") useranswers ON useranswers.answer = answer.id" + 
				 " WHERE answer.question = " + question
	     );

	    ResultSet rs = ps.executeQuery();
	    while(rs.next()) {
	    	Long count = rs.getLong("count");
	        dataset.setValue(rs.getString("answer"), rs.wasNull()?0:count);
	    };
	    rs.close();
	    ps.close();

	    
		JFreeChart chart = null;
		if(type.compareTo("pie") == 0) {
			chart = ChartFactory.createPieChart3D("",dataset,true,true,true);
		}
		
        try {
        	if(chart != null) {
        		ChartUtilities.writeChartAsPNG(
        			out, 
        			chart, 
        			(width!=null)?Integer.parseInt(width):600, 
        			(height!=null)?Integer.parseInt(height):480
        		);
        	};
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

}