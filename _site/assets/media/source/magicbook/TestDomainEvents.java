/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA. */

package com.braithwaitelee.magicbook;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import java.util.Iterator;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

import junit.framework.TestCase;

import java.net.URL;
import javax.servlet.http.HttpServletResponse;

import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import com.gargoylesoftware.htmlunit.FailingHttpStatusCodeException;
import com.gargoylesoftware.htmlunit.html.HtmlAnchor;
import com.gargoylesoftware.htmlunit.ElementNotFoundException;

public class TestDomainEvents
extends TestCase {

private static final String PARAMETER_SEPARATOR = CommandUrlUtility.PARAMETER_SEPARATOR;

public static final String MAGIC_BOOK_URL_PREFIX = "http://localhost/servlet/" + MagicBook.class.getName() + "/";

private WebClient webClient = null;
private String pageNameSuffix = null;

private static int suffixNumber = 1;

public void setUp ()
throws Exception {
	super.setUp();
	System.getProperties().put("org.apache.commons.logging.simplelog.defaultlog", "fatal");
	webClient = new WebClient();
	pageNameSuffix = "TestDomainEvents"+Long.toString(suffixNumber++);
}

public void tearDown ()
throws Exception {
	webClient = null;
	pageNameSuffix = null;
	super.tearDown();
}

/**
 * Doesn't do anything, just redirects
 */
public void testNOP ()
throws Exception {
	createPage("/nop");;

	final URL commitUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ DomainEventCommand.class.getName()
		+ PARAMETER_SEPARATOR
		+ NOPDomainEvent.class.getName());
	webClient.getPage(commitUrl);
}

/**
 * Tests that we can validate a parameter.
 *
 * Doesn't actually test whether we use the parameter
 *
 */
public void testPattern ()
throws Exception {
	URL visibleNOPUrl;
	HtmlPage nopPage;

	createPage("/nop");;

	final URL getNOPUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ "nop"
		+ CommandUrlUtility.CURRENT_PAGE_SUFFIX);

	final URL shouldntWorkUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ DomainEventCommand.class.getName()
		+ PARAMETER_SEPARATOR
		+ DiplayNopWithAnyPagePatternDomainEvent.class.getName()
		+ PARAMETER_SEPARATOR
		+ "Parameter"
		+ PARAMETER_SEPARATOR
		+ "/fooBarBlitz");
	try {
		nopPage = (HtmlPage) webClient.getPage(shouldntWorkUrl);
		fail("Expected to get an error for failing to match pattern, but it worked");
	}
	catch (FailingHttpStatusCodeException fhsce) {
		assertEquals( "Wrong error status code", HttpServletResponse.SC_BAD_REQUEST, fhsce.getStatusCode() );
	}

	final URL shouldWorkUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ DomainEventCommand.class.getName()
		+ PARAMETER_SEPARATOR
		+ DiplayNopWithAnyPagePatternDomainEvent.class.getName()
		+ PARAMETER_SEPARATOR
		+ "Parameter"
		+ PARAMETER_SEPARATOR
		+ "/nop");
	nopPage = (HtmlPage) webClient.getPage(shouldWorkUrl);
	visibleNOPUrl = nopPage.getWebResponse().getUrl();
	assertEquals( "should have redirected", visibleNOPUrl, getNOPUrl );
}

/**
 *  Tests that we can take a paramater, make sure it is a valid page path,
 *  and then actually use the parameter
 */
public void testPageParameterWorks ()
throws Exception {
	URL visibleNOPUrl;
	HtmlPage nopPage;

	createPage("/nop");

	final URL getNOPUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ "nop"
		+ CommandUrlUtility.CURRENT_PAGE_SUFFIX);

	final URL missingMandatoryParameterUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ DomainEventCommand.class.getName()
		+ PARAMETER_SEPARATOR
		+ DisplayPageDomainEvent.class.getName());
	try {
		webClient.getPage(missingMandatoryParameterUrl);
		fail("Expected to get an error for a missing parameter, but it worked");
	}
	catch (FailingHttpStatusCodeException fhsce) {
		assertEquals( "Wrong error status code", HttpServletResponse.SC_BAD_REQUEST, fhsce.getStatusCode() );
	}

	final URL shouldntWorkUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ DomainEventCommand.class.getName()
		+ PARAMETER_SEPARATOR
		+ DisplayPageDomainEvent.class.getName()
		+ PARAMETER_SEPARATOR
		+ "BadParameter"
		+ PARAMETER_SEPARATOR
		+ "/nop");
	try {
		webClient.getPage(shouldntWorkUrl);
		fail("Expected to get an error for wrong parameter, but it worked");
	}
	catch (FailingHttpStatusCodeException fhsce) {
		assertEquals( "Wrong error status code", HttpServletResponse.SC_BAD_REQUEST, fhsce.getStatusCode() );
	}

	final URL shouldWorkUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ DomainEventCommand.class.getName()
		+ PARAMETER_SEPARATOR
		+ DisplayPageDomainEvent.class.getName()
		+ PARAMETER_SEPARATOR
		+ "Path"
		+ PARAMETER_SEPARATOR
		+ "/nop");
	nopPage = (HtmlPage) webClient.getPage(shouldWorkUrl);
	visibleNOPUrl = nopPage.getWebResponse().getUrl();
	assertEquals( "should have redirected", visibleNOPUrl, getNOPUrl );
}

/**
 *
 *  Tests that we can create actual writes, cross linking two pages
 *  together.
 *
 */
public void testCrossLinkTwoNewPages ()
throws Exception {

	createOriginAndDestinationPages();

	final URL shouldntWorkUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ DomainEventCommand.class.getName()
		+ PARAMETER_SEPARATOR
		+ CrossReferenceDomainEvent.class.getName()
		+ PARAMETER_SEPARATOR
		+ "FirstPage"
		+ PARAMETER_SEPARATOR
		+ "/origin"
		+ pageNameSuffix
		+ PARAMETER_SEPARATOR
		+ "SecondPage"
		+ PARAMETER_SEPARATOR
		+ "/origin"
		+ pageNameSuffix);
	try {
		webClient.getPage(shouldntWorkUrl);
		fail("Expected to get an error for two identical pages, but it worked");
	}
	catch (FailingHttpStatusCodeException fhsce) {
		assertEquals( "Wrong error status code", HttpServletResponse.SC_BAD_REQUEST, fhsce.getStatusCode() );
	}

	final URL shouldWorkUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ DomainEventCommand.class.getName()
		+ PARAMETER_SEPARATOR
		+ CrossReferenceDomainEvent.class.getName()
		+ PARAMETER_SEPARATOR
		+ "FirstPage"
		+ PARAMETER_SEPARATOR
		+ "/origin"
		+ pageNameSuffix
		+ PARAMETER_SEPARATOR
		+ "SecondPage"
		+ PARAMETER_SEPARATOR
		+ "/destination"
		+ pageNameSuffix);

	webClient.getPage(shouldWorkUrl);

	final URL getOriginUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ "origin"
		+ pageNameSuffix
		+ CommandUrlUtility.CURRENT_PAGE_SUFFIX);
	final HtmlPage originPage = (HtmlPage) webClient.getPage(getOriginUrl);
	List anchors = originPage.getAnchors();
	assertTrue("no anchors found in origin page", anchors.size() > 0);
	Iterator i = anchors.iterator();
	boolean hasDestinationLink = false;
	while ( i.hasNext() ) {
		HtmlAnchor anchor = (HtmlAnchor) i.next();
		String href = anchor.getHrefAttribute();
		if ( href.indexOf("destination") >=0 ) {
			// make sure link actually works
			anchor.click();
			hasDestinationLink = true; // worked!
			break;
		}
	}
	assertTrue("no link from origin to destination", hasDestinationLink);

	final URL getDestinationUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ "destination"
		+ pageNameSuffix
		+ CommandUrlUtility.CURRENT_PAGE_SUFFIX);
	final HtmlPage destinationPage = (HtmlPage) webClient.getPage(getDestinationUrl);
	anchors = destinationPage.getAnchors();
	assertTrue("no anchors found in destination page", anchors.size() > 0);
	i = anchors.iterator();
	boolean hasOriginLink = false;
	while ( i.hasNext() ) {
		HtmlAnchor anchor = (HtmlAnchor) i.next();
		String href = anchor.getHrefAttribute();
		if ( href.indexOf("origin") >=0 ) {
			// make sure link actually works
			anchor.click();
			hasOriginLink = true; // worked!
			break;
		}
	}
	assertTrue("no link from destination to origin", hasOriginLink);
}

/**
 *
 * Tests that event writes are atomic
 *
 * We're going to manually link the destination to the origin
 * page, then we expect that the write will fail and that the
 * origin page will not be linked to the destination page.
 *
 */
public void testAtomicityOfEvents ()
throws Exception {

	createOriginAndDestinationPages();

	final URL linkOriginToDestinationUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ BinaryLinkCommand.class.getName()
		+ PARAMETER_SEPARATOR
		+ LinkWriteFactory.SEE_ALSO
		+ PARAMETER_SEPARATOR
		+ "/"
		+ "destination"
		+ pageNameSuffix
		+ PARAMETER_SEPARATOR
		+ "/"
		+ "origin"
		+ pageNameSuffix);
	webClient.getPage(linkOriginToDestinationUrl);

	final URL shouldntWorkUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ DomainEventCommand.class.getName()
		+ PARAMETER_SEPARATOR
		+ CrossReferenceDomainEvent.class.getName()
		+ PARAMETER_SEPARATOR
		+ "FirstPage"
		+ PARAMETER_SEPARATOR
		+ "/origin"
		+ pageNameSuffix
		+ PARAMETER_SEPARATOR
		+ "SecondPage"
		+ PARAMETER_SEPARATOR
		+ "/destination"
		+ pageNameSuffix);
	try {
		webClient.getPage(shouldntWorkUrl);
		fail("Expected to get an error trying to cross reference, but it worked");
	}
	catch (FailingHttpStatusCodeException fhsce) {
		assertEquals( "Wrong error status code", HttpServletResponse.SC_BAD_REQUEST, fhsce.getStatusCode() );
	}

	final URL getOriginUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ "origin"
		+ pageNameSuffix
		+ CommandUrlUtility.CURRENT_PAGE_SUFFIX);
	final HtmlPage originPage = (HtmlPage) webClient.getPage(getOriginUrl);
	List anchors = originPage.getAnchors();
	Iterator i = anchors.iterator();
	boolean hasDestinationLink = false;
	while ( i.hasNext() ) {
		HtmlAnchor anchor = (HtmlAnchor) i.next();
		String href = anchor.getHrefAttribute();
		if ( href.indexOf("destination") >=0 ) {
			// make sure link actually works
			anchor.click();
			hasDestinationLink = true; // worked!
			break;
		}
	}
	assertFalse("shouldn't be a link from origin to destination", hasDestinationLink);

	final URL getDestinationUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ "destination"
		+ pageNameSuffix
		+ CommandUrlUtility.CURRENT_PAGE_SUFFIX);
	final HtmlPage destinationPage = (HtmlPage) webClient.getPage(getDestinationUrl);
	anchors = destinationPage.getAnchors();
	assertTrue("no anchors found in destination page", anchors.size() > 0);
	i = anchors.iterator();
	boolean hasOriginLink = false;
	while ( i.hasNext() ) {
		HtmlAnchor anchor = (HtmlAnchor) i.next();
		String href = anchor.getHrefAttribute();
		if ( href.indexOf("origin") >=0 ) {
			// make sure link actually works
			anchor.click();
			hasOriginLink = true; // worked!
			break;
		}
	}
	assertTrue("didn't preserve link from destination to origin", hasOriginLink);
}

private void createOriginAndDestinationPages ()
throws Exception {
	final URL createOriginUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ CreatePageCommand.class.getName()
		+ PARAMETER_SEPARATOR
		+ "/"
		+ "origin"
		+ pageNameSuffix);
	final URL getOriginUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ "origin"
		+ pageNameSuffix
		+ CommandUrlUtility.CURRENT_PAGE_SUFFIX);
	final HtmlPage originPage = (HtmlPage) webClient.getPage(createOriginUrl);
	final URL visibleOriginUrl = originPage.getWebResponse().getUrl();
	assertEquals( "should have redirected", visibleOriginUrl, getOriginUrl );
	final URL createDestinationUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ CreatePageCommand.class.getName()
		+ PARAMETER_SEPARATOR
		+ "/"
		+ "destination"
		+ pageNameSuffix);
	final URL getDestinationUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ "destination"
		+ pageNameSuffix
		+ CommandUrlUtility.CURRENT_PAGE_SUFFIX);
	final HtmlPage destinationPage = (HtmlPage) webClient.getPage(createDestinationUrl);
	final URL visibleDestinationUrl = destinationPage.getWebResponse().getUrl();
	assertEquals( "should have redirected", visibleDestinationUrl, getDestinationUrl );
}

private void createPage (final String path)
throws Exception {
	HtmlPage nopPage;
	assertTrue(path.startsWith("/"));

	final URL getNOPUrl = new URL(
		MAGIC_BOOK_URL_PREFIX
		+ path.substring(1)
		+ CommandUrlUtility.CURRENT_PAGE_SUFFIX);
		final URL createNOPUrl = new URL(
			MAGIC_BOOK_URL_PREFIX
			+ CreatePageCommand.class.getName()
			+ PARAMETER_SEPARATOR
			+ path);
		nopPage = (HtmlPage) webClient.getPage(createNOPUrl);
		final URL visibleNOPUrl = nopPage.getWebResponse().getUrl();
		assertEquals( "should have redirected", visibleNOPUrl, getNOPUrl );
}

}

class NOPDomainEvent
implements TDomainEvent {

public TResult getResult () {
	return new TResult () {
		public TAbout getAbout () { return new GenericAboutAllowed("NOP"); }
		public List getWriteList () { return Collections.EMPTY_LIST; }
		public String getRedirectionString () { return "/nop"; }
	};
}

}

class DisplayPageDomainEvent
implements TDomainEvent {

private String path = "";

public void setPath (final String str) { path = str; }

public TResult getResult () {
	return new TResult () {
		public TAbout getAbout () { return new GenericAboutAllowed("NOP"); }
		public List getWriteList () { return Collections.EMPTY_LIST; }
		public String getRedirectionString () { return path; }
	};
}

}

class DiplayNopWithAnyPagePatternDomainEvent
implements TDomainEvent {

public void setParameter (final String str) { }

public TPattern getParameterPattern () {
	return new AnyPagePattern();
}

public TResult getResult () {
	return new TResult () {
		public TAbout getAbout () { return new GenericAboutAllowed("NOP"); }
		public List getWriteList () { return Collections.EMPTY_LIST; }
		public String getRedirectionString () { return "/nop"; }
	};
}

}

/**
 * patterns cannot be context sensitive: they must be STABLE
 *
 * they will be used to match events with domain circumstances
 * so for example, we can't write a pattern for cross reference that
 * explicitly forbids cross referencing a page with itself. that
 * must be handled in the validation step when getting the result.
 *
 * I'm taking more trouble writing this event as an example
 * implementation
 *
 */
class CrossReferenceDomainEvent
extends TestCase
implements TDomainEvent {

private String firstPagePath = null;
private String secondPagePath = null;
private final static TPattern ANY_PAGE = new AnyPagePattern();

public void setFirstPage (final String path) {
	firstPagePath = path;
}
public TPattern getFirstPagePattern () {
	return ANY_PAGE;
}

public void setSecondPage (final String path) {
	secondPagePath = path;
}
public TPattern getSecondPagePattern () {
	return ANY_PAGE;
}

// these have to be instance variables because
// Java doesn't do full closures

TAbout aboutFirstPage;
TAbout aboutSecondPage;
List writeList;

public TResult getResult () {
	// have to test for nulls: we don't guarantee that all parameters
	// will be supplied, this makes optional parameters possible
	if ( null == firstPagePath )
		return new TResult () {
			public TAbout getAbout () { return new AboutNull("FirstPage"); }
			public List getWriteList () { return Collections.EMPTY_LIST; }
			public String getRedirectionString () { return null; }
		};
	if ( null == secondPagePath )
		return new TResult () {
			public TAbout getAbout () { return new AboutNull("SecondPage"); }
			public List getWriteList () { return Collections.EMPTY_LIST; }
			public String getRedirectionString () { return null; }
		};
	// checking patterns is superfluous
	aboutFirstPage = getFirstPagePattern().matchString(firstPagePath);
	if ( !aboutFirstPage.isAllowed() )
		return new TResult () {
			public TAbout getAbout () { return aboutFirstPage; }
			public List getWriteList () { return Collections.EMPTY_LIST; }
			public String getRedirectionString () { return null; }
		};
	aboutSecondPage = getSecondPagePattern().matchString(secondPagePath);
	if ( !aboutFirstPage.isAllowed() )
		return new TResult () {
			public TAbout getAbout () { return aboutSecondPage; }
			public List getWriteList () { return Collections.EMPTY_LIST; }
			public String getRedirectionString () { return null; }
		};
	if ( firstPagePath.equals(secondPagePath) )
		return new TResult () {
			public TAbout getAbout () {
				return new GenericAboutIsNotAllowed("CrossReference", firstPagePath + " is the same as " + secondPagePath);
			}
			public List getWriteList () { return Collections.EMPTY_LIST; }
			public String getRedirectionString () { return null; }
		};
	else {
		final TNamedPage firstPage = PageMap.getPage(firstPagePath);
		assertNotNull(firstPage);
		final TNamedPage secondPage = PageMap.getPage(secondPagePath);
		assertNotNull(secondPage);

		writeList = new ArrayList();
		writeList.add(new SeeAlso(firstPage, secondPage));
		writeList.add(new SeeAlso(secondPage, firstPage));

		return new TResult () {
			public TAbout getAbout () {
				return new GenericAboutAllowed("CrossReference", firstPagePath + " cross-referenced with " + secondPagePath);
			}
			public List getWriteList () { return writeList; }
			public String getRedirectionString () { return firstPagePath; }
		};
	}
}

}