/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA. */

package com.braithwaitelee.magicbook;

import java.io.IOException;

import java.util.Iterator;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServlet;
import javax.servlet.ServletException;

import junit.framework.Assert;

/**
 * a very thin CLI useful for writing acceptance tests
 */
public final class MagicBook
extends HttpServlet {

private static final Class DEFAULT_COMMAND_CLASS = DisplayPageCommand.class;

private static Map commandMap = new HashMap();

private synchronized static TRequestCommand instance (String cmdClazzName)
throws ClassNotFoundException, ClassCastException, InstantiationException, IllegalAccessException {

	TRequestCommand cmd = (TRequestCommand) commandMap.get(cmdClazzName);

	if ( cmd == null ) {

		Class cmdClazz = Class.forName(cmdClazzName);
		cmd = (TRequestCommand) cmdClazz.newInstance();
		commandMap.put(cmdClazzName, cmd);

	}
	return cmd;

}

public void doGet (HttpServletRequest req, HttpServletResponse res)
throws ServletException, IOException {

	TRequestCommand cmd = null;
	List parameters;
	try {
		parameters = CommandUrlUtility.shortPathToCommand(req.getPathInfo());
	}
	catch (Exception e) {
		res.sendError(HttpServletResponse.SC_BAD_REQUEST, req.getPathInfo() + " bad: " + e.getMessage() );
		return;
	}
	String requestCommandName = (String) parameters.get(0);

	// fix URI, we don't want people bookmarking explicit commands
	if (  requestCommandName.equalsIgnoreCase(DEFAULT_COMMAND_CLASS.getName())
			&& req.getPathInfo().indexOf(CommandUrlUtility.PARAMETER_SEPARATOR) >= 0 ) {
		try {
			res.sendRedirect(
				req.getServletPath()
				+ CommandUrlUtility.commandToShortPath(parameters)
			);
			return;
		}
		catch (Exception e) {
			res.sendError(HttpServletResponse.SC_BAD_REQUEST, req.getPathInfo() + " bad: " + e.getMessage() );
			return;
		}
	}

	parameters.remove(0);

	try {
		cmd = instance(requestCommandName);
	}
	catch (ClassNotFoundException cnfe) {
		res.sendError(HttpServletResponse.SC_BAD_REQUEST, requestCommandName + " does not exist" );
		return;
	}
	catch (ClassCastException cce) {
		res.sendError(HttpServletResponse.SC_BAD_REQUEST, requestCommandName + " is not a valid command" );
		return;
	}
	catch (InstantiationException ie) {
		res.sendError(HttpServletResponse.SC_BAD_REQUEST, requestCommandName + " cannot be instantiated" );
		return;
	}
	catch (IllegalAccessException iae) {
		res.sendError(HttpServletResponse.SC_BAD_REQUEST, requestCommandName + " cannot be accessed" );
		return;
	}

	Assert.assertNotNull("command is null for "+requestCommandName, cmd);

	cmd.doCommand(req, res, parameters);

}

}