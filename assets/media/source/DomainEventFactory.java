/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA. */

package com.braithwaitelee.magicbook;

import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.Iterator;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

import junit.framework.TestCase;

final class DomainEventFactory
extends TestCase {

private final static String defaultTypePrefix = "com.braithwaitelee.magicbook.";

/**
 * @throws java.lang.Exception
 *
 * The deal here is that this factory is currently used directly from the "CL" (an URL).
 * That may be temporary, but the feedback bandwidth is very narrow, namely an error
 * code with a single text message. TAbouts are inappropriate: they are used for richer
 * UI opportunities such as giving individual field feedback.
 */
static TDomainEvent newDomainEvent (final String domainEventType, final Map domainEventParameters)
throws Exception {
	assertNotNull(domainEventType);
	assertFalse("".equals(domainEventType));

	final String fullyQualifiedDomainEventType =
		(domainEventType.indexOf(".") <= 0
			? defaultTypePrefix + domainEventType
			: domainEventType);

	try {
		final Class domainEventClazz = Class.forName(fullyQualifiedDomainEventType);
		Method[] domainEventClazzMethodArray = domainEventClazz.getDeclaredMethods();
		// cache later
		Map stringSetters = new HashMap();
		Map patternGetters = new HashMap();
		for (int i = 0; i < domainEventClazzMethodArray.length; ++i) {
			Method eachMethod = domainEventClazzMethodArray[i];
			if ( Modifier.isPublic(eachMethod.getModifiers())
				&& !Modifier.isStatic(eachMethod.getModifiers()) ) {
				final String methodName = eachMethod.getName();

				if ( methodName.startsWith("set")
						&& methodName.length() > 3
						&& eachMethod.getReturnType().equals(Void.TYPE)
						&& eachMethod.getParameterTypes().length == 1
						&& eachMethod.getParameterTypes()[0].equals(String.class) )
					stringSetters.put(
						methodName.substring(3),
						eachMethod);
				else if ( methodName.startsWith("get")
						&& methodName.endsWith("Pattern")
						&& methodName.length() > 10
						&& TPattern.class.isAssignableFrom(eachMethod.getReturnType())
						&& eachMethod.getParameterTypes().length == 0 )
					patternGetters.put(
						methodName.substring(3,methodName.length()-7),
						eachMethod);
				else continue;
			}
			else continue;
		}

		Set parameterSet = stringSetters.keySet();
		Set checkedParameterSet = new HashSet();
		checkedParameterSet.addAll(patternGetters.keySet());
		checkedParameterSet.retainAll(parameterSet);

		TDomainEvent domainEvent = (TDomainEvent) domainEventClazz.newInstance();

		Iterator iParameters = domainEventParameters.entrySet().iterator();
		while ( iParameters.hasNext() ) {
			// job one: check that all parameters are valid
			String parameterName = (String) ((Map.Entry) iParameters.next()).getKey();
			if ( "".equals(parameterName) )
				throw new Exception("empty parameter");
			if ( parameterSet.contains(parameterName) ) {
				if ( checkedParameterSet.contains(parameterName) ) {
					Method getterMethod = (Method) patternGetters.get(parameterName);
					assertNotNull(getterMethod);
					Object[] arguments = new Object[0];
					TPattern pattern = (TPattern) getterMethod.invoke(domainEvent, arguments);
					TAbout aboutThisParameter = pattern.matchString((String) domainEventParameters.get(parameterName));
					if ( !aboutThisParameter.isAllowed() )
						throw new Exception(aboutThisParameter.getLongExplanation());
				}
				Method setterMethod = (Method) stringSetters.get(parameterName);
				assertNotNull(setterMethod);
				Object[] arguments = new Object[1];
				arguments[0] = (String) domainEventParameters.get(parameterName);
				setterMethod.invoke(domainEvent, arguments);
			}
			else throw new Exception(parameterName + " is not a parameter of " + domainEventType);
		}
		return domainEvent;
	}
	catch (ClassNotFoundException cnfe) {
		throw new Exception(domainEventType + " is not a valid class");
	}

}

}