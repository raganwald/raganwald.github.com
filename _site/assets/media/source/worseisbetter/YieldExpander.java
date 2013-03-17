/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA. */

package com.braithwaitelee.worseisbetter;

import java.util.*;

public class YieldExpander
extends AbstractSubtreeVisitor {

public YieldExpander (String name) {
	super(name);
}

public YieldExpander () {
	super();
}

public Object visitSubtree (Subtree subtree, Object optional)
throws Exception {
	List nodes = subtree.getNodes();
	for ( int i = 0; i < nodes.size(); ++i ) {
		AbstractSyntaxTree.Node node = (AbstractSyntaxTree.Node) nodes.get(i);
		node.invite(this, null); // pre-flatten absolutely everything
	}
	if ( nodes.size() < 1 ) {
		;
	}
	else if ( !Symbol.YIELD.equals( nodes.get(0) ) ) {
		;
	}
	else if ( nodes.size() < 2 ) {
		throw new Exception(subtree.invite(new UglyPrinter(),null) + " is improperly formed");
	}
	else { // (yield ...)
		List begin = new ArrayList();
		begin.add( Symbol.BEGIN );
		Symbol labelSymbol = Symbol.gensym();
		Subtree newContinuation = new Subtree();
		newContinuation.addNode( Symbol.NEW_CONTINUATION );
		newContinuation.addNode( labelSymbol );
		newContinuation.addNode( Symbol.CURRENT_ENVIRONMENT );
		Subtree callContinuation = new Subtree();
		callContinuation.addNode( Symbol.CALL_CONTINUATION );
		callContinuation.addNode( newContinuation );
		callContinuation.addNode( Symbol.RETURN_CONTINUATION );
		for (int i = 1; i < nodes.size(); ++i) {
			callContinuation.addNode( (AbstractSyntaxTree.Node) nodes.get(i) );
		}
		begin.add( callContinuation );
		Subtree labelSubtree = new Subtree();
		labelSubtree.addNode( Symbol.LABEL );
		labelSubtree.addNode( labelSymbol );
		begin.add( labelSubtree );
		subtree.setNodes( begin );
		  
	}
	return subtree;
}

public void testNoExchanges ()
throws Exception {
	testTransformation(
			"(defun bash () null)",
			"(defun bash () null)");
	testTransformation(
			"(begin (set! blitz \"blitz\") (set! foo \"foo\"))",
			"(begin (set! blitz \"blitz\") (set! foo \"foo\"))");
	testTransformation(
			"(bash (+ foo bar) (+ blitz 7))",
			"(bash (+ foo bar) (+ blitz 7))");
}

public void testNoLetExchanges ()
throws Exception {
	testTransformation(
			"(call-continuation continuation)",
			"(call-continuation continuation)");
	testTransformation(
			"(call-continuation continuation value)",
			"(call-continuation continuation value)");
	testTransformation(
			"(bash (+ foo (call-continuation continuation value)) (+ blitz 7))",
			"(bash (+ foo (call-continuation continuation value)) (+ blitz 7))");
}

public void testSimpleCall ()
throws Exception {
	testTransformation(
			"(yield  value)",
			"(begin " +
			"	(call-continuation " +
			"		(new-continuation G1 @current-environment) " +
			"		@return-continuation " +
			"		value) " +
			"	(label G1)) "
			);
}
	
}