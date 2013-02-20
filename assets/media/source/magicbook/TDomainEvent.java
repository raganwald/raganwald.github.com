/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA. */

package com.braithwaitelee.magicbook;

import java.util.List;

/**
 * individual domain events do not enforce or understand their "public" write patterns
 * that comes from the factory, which understands the concepts of a domain event type
 */
public interface TDomainEvent {

public static interface TResult {

public TAbout getAbout ();
public List getWriteList ();
public String getRedirectionString ();

}

public TResult getResult ();

}