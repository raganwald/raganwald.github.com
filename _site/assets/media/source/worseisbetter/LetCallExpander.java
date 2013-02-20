/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA. */

package com.braithwaitelee.worseisbetter;

import java.util.*;

public class LetCallExpander
extends AbstractSubtreeVisitor {

public LetCallExpander (String name) {
	super(name);
}

public LetCallExpander () {
	super();
}

public Object visitSubtree (Subtree subtree, Object optional)
throws Exception {
	List nodes = subtree.getNodes();
	for ( int i = 0; i < nodes.size(); ++i ) {
		AbstractSyntaxTree.Node node = (AbstractSyntaxTree.Node) nodes.get(i);
		node.invite(this, null); // pre-flatten absolutely everything
	}
	if ( nodes.size() != 4 ) {
		;
	}
	else if ( !Symbol.LET_CALL.equals( nodes.get(0) ) ) {
		;
	}
	else if ( nodes.size() == 1  ) { // (let/call)
		throw new Exception( "no label for let/call" );
	}
	else { // (let/call name ...)
		List let = new ArrayList();
		let.add( Symbol.BEGIN );
		Subtree define = new Subtree();
		define.addNode( Symbol.DEFINE );
		define.addNode( (AbstractSyntaxTree.Node) nodes.get(1) ); // name
		Symbol labelSymbol = Symbol.gensym();
		Subtree newContinuation = new Subtree();
		newContinuation.addNode( Symbol.NEW_CONTINUATION );
		newContinuation.addNode( labelSymbol );
		newContinuation.addNode( Symbol.CURRENT_ENVIRONMENT );
		define.addNode( newContinuation );
		let.add( define );
		Subtree callContinuation = new Subtree();
		callContinuation.addNode( Symbol.CALL_CONTINUATION );
		callContinuation.addNode( (AbstractSyntaxTree.Node) nodes.get(1) );
		for (int i = 2; i < nodes.size(); ++i) {
			callContinuation.addNode( (AbstractSyntaxTree.Node) nodes.get(i) );
		}
		let.add( callContinuation );
		Subtree labelSubtree = new Subtree();
		labelSubtree.addNode( Symbol.LABEL );
		labelSubtree.addNode( labelSymbol );
		let.add( labelSubtree );
		subtree.setNodes( let );
		  
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

public void testSimpleLetExchange ()
throws Exception {
	testTransformation(
			"(let/call return-to-me-continuation target-continuation value)",
			"(begin " +
			"	(define	return-to-me-continuation " +
			"		(new-continuation G1 @current-environment)) " +
			"	(call-continuation return-to-me-continuation target-continuation value) " +
			"	(label G1)) "
			);
}
	
}