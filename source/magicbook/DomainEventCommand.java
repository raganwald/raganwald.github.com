/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA. */

package com.braithwaitelee.magicbook;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Iterator;

import javax.servlet.http.HttpServletResponse;

final class DomainEventCommand
extends AbstractRedirectingRequestCommand {

protected String doCommand (final List parameters) {

	// encapsulates ideas of trasnactions, barely
	final TTransactionPersister persister = WriteRepository.getPersister();

	if ( parameters.size() < 1 )
		return errorValue( HttpServletResponse.SC_BAD_REQUEST, "expect domainEvent-type!parameter-1...!parameter-n" );
	String domainEventType = (String) parameters.get(0);

	final Map domainEventParameters = new HashMap();
	Iterator iParameters = parameters.iterator();
	iParameters.next(); // iterate past the type
	while ( iParameters.hasNext() ) {
		final String parameterName = (String) iParameters.next();
		if ( !iParameters.hasNext() )
			return errorValue(
				HttpServletResponse.SC_BAD_REQUEST,
				"no value for parameter " + parameterName );
		domainEventParameters.put(parameterName, (String) iParameters.next());
	}

	// in the full ui, we expect that the mechanism for choosing a domainEvent type will tell us what the parameters
	// are so we can display an appropriate form or some such
	// as we know from "real world" apps, we also do not expect that the parameters will always be fixed
	// for example, multi-page forms with optional pages like apply online
	// we'll try to apply a new paradigm wherever possible :-)

	TDomainEvent domainEvent;
	try {
		domainEvent = DomainEventFactory.newDomainEvent(domainEventType, domainEventParameters);
	}
	catch (Exception e) {
		return errorValue(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
	}

	// the domainEvent knows whether the parameters are valid and whether it can try to commit
	// future versions should return an about object rather than a boolean

	TDomainEvent.TResult result = domainEvent.getResult();
	TAbout aboutAssemblingWriteSet = result.getAbout();

	if ( !aboutAssemblingWriteSet.isAllowed() )
		return errorValue(
				HttpServletResponse.SC_BAD_REQUEST,
				"unable to construct write set: " + aboutAssemblingWriteSet.getLongExplanation() );
	else {
		TAbout aboutCommitment = null;
		try {
			Iterator iWrites = result.getWriteList().iterator();
			while ( iWrites.hasNext() ) {
				TWrite write = (TWrite) iWrites.next();
				boolean writeAllowed = persister.addWrite(write);
				if ( !writeAllowed )
					return errorValue(HttpServletResponse.SC_BAD_REQUEST, "write was refused for some reason" );
			}
			if ( persister.hasWritesToCommitOrAbandon() )
				aboutCommitment = persister.commit();
			else return result.getRedirectionString();
		}
		finally {
			if ( persister.hasWritesToCommitOrAbandon() ) persister.abandon();
		}

		if ( aboutCommitment.isAllowed() )
			return result.getRedirectionString();
		else return errorValue(HttpServletResponse.SC_BAD_REQUEST, "commit refused "+aboutCommitment.getLongExplanation() );
	}
}

}