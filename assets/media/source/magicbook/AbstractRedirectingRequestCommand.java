/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA. */

package com.braithwaitelee.magicbook;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

public abstract class AbstractRedirectingRequestCommand
implements TRequestCommand {

protected abstract String doCommand (List parameters);

protected final static String SEPARATOR = "__!__";

protected final String errorValue(int statusCode, String message) {
	return Integer.toString(statusCode) + SEPARATOR + message;
}

public final void doCommand (final HttpServletRequest req, final HttpServletResponse res, final List parameters)
throws ServletException, IOException {
	String redirectionOrError = this.doCommand(parameters);
	int separatorIndex = redirectionOrError.indexOf(SEPARATOR);
	if ( separatorIndex >= 0 ) {
		int statusCode;
		final String codeString = redirectionOrError.substring(0,separatorIndex);
		String errorMessage = redirectionOrError.substring(separatorIndex + SEPARATOR.length());
		try {
			statusCode = Integer.parseInt(codeString);
		}
		catch (NumberFormatException nfe) {
			errorMessage = "I'm confused about status code "+codeString+" when telling you about "+errorMessage;
			statusCode = HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
		}
		res.sendError(statusCode, errorMessage);
	}
	else res.sendRedirect(
		res.encodeRedirectURL(
			req.getServletPath() + CommandUrlUtility.pathToShortPath(redirectionOrError)));
}

}