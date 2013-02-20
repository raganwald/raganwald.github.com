/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA. */

package com.braithwaitelee.worseisbetter;

import java.util.List;

public class ContainsEntryRecognizer
extends AbstractSubtreeRecognizer {

public ContainsEntryRecognizer (String name) {
	super(name);
}

public ContainsEntryRecognizer () {
	super();
}
	
private static final NodeVisitor entryRecognizer = new EntryRecognizer();

public Object visitSubtree (Subtree subtree, Object optional)
throws Exception {
	if ( Boolean.TRUE.equals( subtree.invite(entryRecognizer, optional) ) )
		return Boolean.TRUE;
	else {
		List nodes = subtree.getNodes();
		for ( int i = 0; i < nodes.size(); ++i ) {
			if ( Boolean.TRUE.equals(((AbstractSyntaxTree.Node) nodes.get(i)).invite(this, optional)) )
				return Boolean.TRUE;
		}
		return Boolean.FALSE;
	}
}

public void testRecognizesAnEntry ()
throws Exception {
	testRecognizes("foo", Boolean.FALSE);
	testRecognizes("(foo \"bar\")", Boolean.FALSE);
	testRecognizes("(call-continuation foo \"bar\")", Boolean.FALSE);
	testRecognizes("(set! foo (bash bar))", Boolean.FALSE);
	testRecognizes("(set! foo (call-continuation foo \"bar\"))", Boolean.FALSE);
	testRecognizes("(label \"bar\")", Boolean.TRUE);
	testRecognizes("(set! foo (label \"bar\"))", Boolean.TRUE);
}

}