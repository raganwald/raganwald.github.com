/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA. */

package com.braithwaitelee.worseisbetter;

import java.util.*;

public class IfFlattener
extends AbstractSubtreeVisitor {
	
private static final NodeVisitor containsEntryRecognizer = new ContainsEntryRecognizer();

public IfFlattener (String name) {
	super(name);
}

public IfFlattener () {
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
	else if ( !Symbol.IF.equals( nodes.get(0) ) ) {
		;
	}
	else if ( nodes.size() < 3 || nodes.size() > 4 ) {
		throw new Exception(subtree.invite(new UglyPrinter(),null) + " is improperly formed");
	}
	else { // (if <cond> <expr-t> ...)
		AbstractSyntaxTree.Node condExpr = (AbstractSyntaxTree.Node) nodes.get(1);
		AbstractSyntaxTree.Node trueExpr = (AbstractSyntaxTree.Node) nodes.get(2);
		AbstractSyntaxTree.Node falseExpr =
				( nodes.size() == 4 )
				? ((AbstractSyntaxTree.Node) nodes.get(3))
				: Symbol.NIL;
		if ( Boolean.TRUE.equals( trueExpr.invite(containsEntryRecognizer,null) )
			|| Boolean.TRUE.equals( falseExpr.invite(containsEntryRecognizer,null) ) ) {
			List beginNodeList = new ArrayList();
			beginNodeList.add( Symbol.BEGIN );
			Symbol trueLabelSymbol = Symbol.gensym();
			Subtree ifStatement = new Subtree();
			ifStatement.addNode( Symbol.IF );
			ifStatement.addNode( condExpr );
			Subtree gotoStatement = new Subtree();
			gotoStatement.addNode( Symbol.GOTO );
			gotoStatement.addNode( trueLabelSymbol );
			gotoStatement.addNode( Symbol.NIL );
			ifStatement.addNode( gotoStatement );
			ifStatement.addNode( Symbol.NIL );
			beginNodeList.add( ifStatement );
			Symbol returnLabelSymbol = Symbol.gensym();
			Subtree returnFalseStatement = new Subtree();
			returnFalseStatement.addNode( Symbol.GOTO );
			returnFalseStatement.addNode( returnLabelSymbol );
			returnFalseStatement.addNode( falseExpr );
			beginNodeList.add( returnFalseStatement );
			Subtree trueLabelStatement = new Subtree();
			trueLabelStatement.addNode( Symbol.LABEL );
			trueLabelStatement.addNode( trueLabelSymbol );
			beginNodeList.add( trueLabelStatement );
			Subtree returnTrueStatement = new Subtree();
			returnTrueStatement.addNode( Symbol.GOTO );
			returnTrueStatement.addNode( returnLabelSymbol );
			returnTrueStatement.addNode( trueExpr );
			beginNodeList.add( returnTrueStatement );
			Subtree returnLabelStatement = new Subtree();
			returnLabelStatement.addNode( Symbol.LABEL );
			returnLabelStatement.addNode( returnLabelSymbol );
			beginNodeList.add( returnLabelStatement );
			subtree.setNodes( beginNodeList );
		}
	}
	return subtree;
}

public void testIfWithNoLabels ()
throws Exception {
	testTransformation(
		"(if foo bar blitz)"
	,
		"(if foo bar blitz)"
	);
}

public void testIfWithCondLabel ()
throws Exception {
	testTransformation(
		"(if " +
		"	(begin " +
		"		(call-continuation continuation foo) " +
		"		(label continuation-label)) " +
		"	bar blitz)"
	,
		"(if " +
		"	(begin " +
		"		(call-continuation continuation foo) " +
		"		(label continuation-label)) " +
		"	bar blitz)"
	);
}

public void testIfWithTrueExprLabel ()
throws Exception {
	testTransformation(
		"(if " +
		"	bar " +
		"	(begin " +
		"		(call-continuation continuation foo) " +
		"		(label continuation-label)) " +
		"	blitz)"
	,
		"(begin " +
		"	(if " +
		"		bar " +
		"		(goto G1 null) " +
		"		null) " +
		"	(goto G2 blitz) " +
		"	(label G1) " +
		"	(goto G2 " +
		"		(begin " +
		"			(call-continuation continuation foo) " +
		"			(label continuation-label))) " +
		"	(label G2)) "
	);
}

}