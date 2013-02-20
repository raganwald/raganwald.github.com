/**
 *
 * ColumnGrinder.java
 *
 * ColumnGrinder does 'distinct values'.
 *
 * Copyright (C) 2000 Reginald Braithwaite-Lee
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 * 
 *
 */

package com.wireshooter.grinder;

import java.io.*;

import java.util.*;

import java.sql.SQLException;

import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.w3c.dom.Node;
import org.w3c.dom.NamedNodeMap;

import freemarker.template.*;

class ColumnGrinder
extends AbstractChildGrinder
implements TGrindElement
{

static final String LIST_OF_VALUES_AND_LINKS_KEY_PROP =	"com.wireshooter.grinder.ColumnGrinder.list-of-values-and-links-key";
static final String LBV_VALUE_INDEX_KEY_PROP =			"com.wireshooter.grinder.ColumnGrinder.lbv-value-index-key";
static final String LBV_LIST_INDEX_KEY_PROP =			"com.wireshooter.grinder.ColumnGrinder.lbv-list-index-key";

final String columnName;
final String listofValuesAndLinks;
final String lbvValueIndexKey;
final String lbvListIndexKey;

final GrindElementFactory gef;

protected ColumnGrinder (GrindElementFactory gef_, Properties p, Element element_, String columnName_)
{
	super(p,element_);
	
	gef = gef_;
	columnName = columnName_;
	
	listofValuesAndLinks = myProperties.getProperty(LIST_OF_VALUES_AND_LINKS_KEY_PROP,"valueAndLinksList");
	lbvValueIndexKey = myProperties.getProperty(LBV_VALUE_INDEX_KEY_PROP,"value");
	lbvListIndexKey = myProperties.getProperty(LBV_LIST_INDEX_KEY_PROP,"links");
}

public TLink getRelativeLink ()
{
	StringBuffer returnUrl = new StringBuffer(columnName);
	returnUrl.append(urlSeparator);
	returnUrl.append(indexFileName);
	
	final Node nameNode = element.getAttributeNode(linkNameAttribute);
	if ( nameNode == null ) {
		return new Link(returnUrl.toString(),columnName);
	}
	else return new Link(returnUrl.toString(),nameNode.getNodeValue());
}

public final void doGrind (
	TBlackboard blackboard, TBlackboard.TCookie cookie, String currentTable,
	Map currentQuery, File currentFolder, TNavigation nav)
throws SQLException, TGrindElement.DisplaySelectionException, IOException
{
	List geList = new LinkedList();
	
	NodeList nl = element.getChildNodes();
	for (int j = 0; j < nl.getLength(); ++j) {
		Node childNode = nl.item(j);
		if ( childNode.getNodeType() == Node.ELEMENT_NODE ) {
			if ( childNode instanceof Element ) {
				final TGrindElement ge = gef.GrindElement( (Element) childNode );
				if ( ge != null ) {
					geList.add(ge);
				}
			}
			else System.err.println(childNode.toString());
		}
	}
	
	File myFolder = this.getMyFolder(currentFolder);
	myFolder.mkdirs();
	
	System.err.println("selecting distinct "+columnName+" in "+currentTable);

	Map newQuery = new HashMap();
	if ( currentQuery != null ) {
		newQuery.putAll(currentQuery);
	}
	SimpleList listOfChildren = new SimpleList();
	List listOfValues = new LinkedList();
	final TLink myLink = this.getRelativeLink();
	TNavigation childNav = new Navigation(nav.getRoot(),myLink);

	// assemble navigation for children
	
	SimpleList linksByValueList = new SimpleList();
	
	Iterator iterValues = blackboard.distinctValues(cookie,currentTable,columnName,currentQuery);
	while ( iterValues.hasNext() ) {
		Map valueMap = (Map) iterValues.next();
		final String value = valueMap.get(columnName).toString();
		listOfValues.add(value);
		
		SimpleList linksForThisValue = new SimpleList();
		
		for (Iterator i = geList.iterator(); i.hasNext(); ) {
			TGrindElement childGrinder = (TGrindElement) i.next();
			TLink childLink = childGrinder.getRelativeLink();
			
			linksForThisValue.add(new Link(value + urlSeparator + childLink.getUrl(), childLink.getName()));
			
			childLink = new Link(
				value + urlSeparator + childLink.getUrl(),
				value // hard wire the name
				);
				
			childNav.addSibling(childLink);
			listOfChildren.add(childLink);			
		}
		
		SimpleHash valueAndListStruct = new SimpleHash();
		valueAndListStruct.put(lbvValueIndexKey,new SimpleScalar(value));
		valueAndListStruct.put(lbvListIndexKey,linksForThisValue);
		
		linksByValueList.add(valueAndListStruct);
		
	}
	
	// now grind children
	
	for (Iterator i = listOfValues.iterator(); i.hasNext(); ) {
		final String value = i.next().toString();
		File childFolderFile = new File(myFolder,value); // need conversion to acceptable characters???
		childFolderFile.mkdirs();
		newQuery.put(columnName,value);
		
		for (Iterator j = geList.iterator(); j.hasNext(); ) {
			TGrindElement childGrinder = (TGrindElement) j.next();
			childGrinder.doGrind(blackboard, cookie, currentTable, newQuery, childFolderFile, childNav);
		}
	}
	
	// time for me!
	
	String templateFilePath = null;
	
	final Node templateNode = element.getAttributeNode(templateAttribute);
	if ( templateNode == null ) {
		templateFilePath = defaultIndexTemplate;
	}
	else templateFilePath = templateNode.getNodeValue();
	
	SimpleHash modelRoot = new SimpleHash();
	modelRoot.put(commentKey,new SimpleScalar("Using "+templateFilePath+" to create "+element.toString()));
	modelRoot.put(linksKey,listOfChildren);
	modelRoot.put(navigationKey,nav);
	modelRoot.put(listofValuesAndLinks,linksByValueList);
	
	Template template = new Template(templateFilePath);
	
	File indexFile = new File(myFolder,indexFileName);
	PrintWriter pw = new PrintWriter(new BufferedWriter(new FileWriter(indexFile)));
	
	template.process(modelRoot,pw);
	
	pw.close();
}

/**
 *
 * answers the File for the folder this creates
 *
 * does NOT create the folder!!!
 *
 * @param currentFolder the folder handed down by the 'parent'
 * @return the File for the folder, or pass the currentFolder through
 *
 */
protected File getMyFolder (File currentFolder)
{
	return new File(currentFolder,columnName);
}

}