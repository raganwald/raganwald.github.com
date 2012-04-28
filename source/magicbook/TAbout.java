/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA. */

package com.braithwaitelee.magicbook;

interface TAbout {

	boolean isAllowed ();

	String getShortVerb (); // migrate to resource lookups or pages in the application

	String getLongExplanation ();

}

final class GenericAboutAllowed
implements TAbout {

	private String shortVerb = "AddLink";
	private String longExplanation = "Adding a link is allowed";

	public GenericAboutAllowed () {
	}

	public GenericAboutAllowed (final String shortVerb) {
		this.shortVerb = shortVerb;
		this.longExplanation = shortVerb + " is allowed";
	}

	public GenericAboutAllowed (final String shortVerb, final String longExplanation) {
		this.shortVerb = shortVerb;
		this.longExplanation = longExplanation;
	}

	public boolean isAllowed () { return true; }

	public String getShortVerb () {
		return shortVerb;
	}

	public String getLongExplanation () {
		return longExplanation;
	}

}

final class GenericAboutIsNotAllowed
implements TAbout {

	private String shortVerb;
	private String longExplanation;

	public GenericAboutIsNotAllowed (final String shortVerb) {
		this.shortVerb = shortVerb;
		this.longExplanation = shortVerb + " is not allowed";
	}

	public GenericAboutIsNotAllowed (final String shortVerb, final String longExplanation) {
		this.shortVerb = shortVerb;
		this.longExplanation = longExplanation;
	}

	public boolean isAllowed () { return false; }

	public String getShortVerb () {
		return shortVerb;
	}

	public String getLongExplanation () {
		return longExplanation;
	}

}

/**
 * useful when trying to unlink
 */
final class GenericAboutLinkDoesNotExist
implements TAbout {

	final String longExplanation;

	public GenericAboutLinkDoesNotExist (TNamedPage from, TNamedPage to) {
		longExplanation = "Disallowed because " + from.getName()
			+ " and " + to.getName() + " aren't linked.";
	}

	public boolean isAllowed () { return false; }

	public String getShortVerb () {
		return "~Unlink";
	}

	public String getLongExplanation () {
		return longExplanation;
	}

}