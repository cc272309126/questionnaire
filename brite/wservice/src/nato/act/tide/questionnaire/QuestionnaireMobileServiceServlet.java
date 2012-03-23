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




public class QuestionnaireMobileServiceServlet extends HttpServlet {

    private static Logger    log  = Logger.getLogger(QuestionnaireMobileServiceServlet.class.getName());

	
	public void doGet(HttpServletRequest request,HttpServletResponse response) throws ServletException, IOException 
	{
		try {
			response.addHeader("Expires","-1");
			QuestionnaireMobileService service = new QuestionnaireMobileService();
			service.doGet(request, response);
		} catch (SQLException ex) {
			log.error(ex);
			throw new ServletException(ex);
		} catch (JSONException ex) {
			log.error(ex);
			throw new ServletException(ex);
		}
	}

	
	public void doPost(HttpServletRequest request,HttpServletResponse response) throws ServletException, IOException
	{
		try {
			response.addHeader("Expires","-1");
			QuestionnaireMobileService service = new QuestionnaireMobileService();
			service.doPost(request, response);

		} catch (SQLException ex) {
			log.error(ex);
			throw new ServletException(ex);
		} catch (JSONException ex) {
			log.error(ex);
			throw new ServletException(ex);
		}
	}

}