/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA. */

package com.braithwaitelee.worseisbetter;

import java.util.*;

public class SetBangBeginFlattener
extends AbstractSubtreeVisitor {

public SetBangBeginFlattener (String name) {
	super(name);
}

public SetBangBeginFlattener () {
	super();
}
	
public Object visitSubtree (Subtree subtree, Object optional)
throws Exception {
		
	List nodes = subtree.getNodes();
	for ( int i = 0; i < nodes.size(); ++i )
		((AbstractSyntaxTree.Node) nodes.get(i)).invite(this, optional);
	if ( nodes.size() > 2 ) {
		if (
			( Symbol.SET_BANG.equals(nodes.get(0)) && nodes.get(2) instanceof Subtree )
			|| ( Symbol.DEFINE.equals(nodes.get(0)) && nodes.get(2) instanceof Subtree )
		) {
			Subtree expr = (Subtree) nodes.get(2);
			List exprNodes = expr.getNodes();
			if ( Symbol.BEGIN.equals( exprNodes.get(0) ) ) {
				List newNodes = new ArrayList();
				newNodes.add( Symbol.BEGIN );
				AbstractSyntaxTree.Node receiverNode = (AbstractSyntaxTree.Node) nodes.get(1);
				if ( receiverNode instanceof Subtree ) {
					Symbol tempVariable = Symbol.gensym();
					Subtree tempSubtree = new Subtree();
					tempSubtree.addNode( Symbol.DEFINE );
					tempSubtree.addNode( tempVariable );
					tempSubtree.addNode( receiverNode );
					receiverNode = tempVariable;
				}
				for ( int i = 1; i < exprNodes.size() - 1; ++i ) {
					AbstractSyntaxTree.Node oneExpr = (AbstractSyntaxTree.Node) exprNodes.get(i);
					oneExpr.invite(this, null);
					newNodes.add( oneExpr );
				}
				Subtree setBangOrDefine = new Subtree();
				setBangOrDefine.addNode( (AbstractSyntaxTree.Node) nodes.get(0) );
				setBangOrDefine.addNode( receiverNode );
				setBangOrDefine.addNode( (AbstractSyntaxTree.Node) exprNodes.get(exprNodes.size() - 1) );
				newNodes.add(setBangOrDefine);
				subtree.setNodes(newNodes);
			}
		}
	}	
	return subtree;
}

public void testCasesWithoutsetBangOrDefines ()
throws Exception {
	testTransformation(
			"",
			"");
	testTransformation(
			"()",
			"()");
	testTransformation(
			"foo",
			"foo");
	testTransformation(
			"(defun bash () null)",
			"(defun bash () null)");
}

public void testSimplestsetBangOrDefineCase ()
throws Exception {
	testTransformation(
			"(set! bash (begin (foo) (bar) blitz))",
			"(begin (foo) (bar) (set! bash blitz))");
}

public void testSimplestDefineCase ()
throws Exception {
	testTransformation(
			"(define bash (begin (foo) (bar) blitz))",
			"(begin (foo) (bar) (define bash blitz))");
}

public void testsetBangOrDefineWithinDefine ()
throws Exception {
	testTransformation(
			"(define bash (begin (set! foo (begin (+1 bar) bar)) foo))",
			"(begin (begin (+1 bar) (set! foo bar)) (define bash foo))");

}

public void testDefineWithinBeginWithinDefine ()
throws Exception {
	testTransformation(
			"(define G3 " +
			"	(begin " +
			"		(define G1 (- bortz 2)) " +
			"		(define G2 (accept bumf null)) " +
			"		(bar G1 G2))) ",
			"	(begin " +
			"		(define G1 (- bortz 2)) " +
			"		(define G2 (accept bumf null)) " +
			"		(define G3 (bar G1 G2))) " );
}

public void testDebugComposite1 ()
throws Exception {
	testTransformation(
			"(define G3 " +
			"	(begin " +
			"		(define G1 (- bortz 2)) " +
			"		(define G2 (accept bumf null)) " +
			"		(bar G1 G2))) ",
			"	(begin " +
			"		(define G1 (- bortz 2)) " +
			"		(define G2 (accept bumf null)) " +
			"		(define G3 (bar G1 G2))) " );
}

public void testDebugComposite2 ()
throws Exception {
	testTransformation(
			"(begin " +
			"	(define G3 " +
			"		(begin " +
			"			(define G1 (- bortz 2)) " +
			"			(define G2 (accept bumf null)) " +
			"			(bar G1 G2))) " +
			"	(accept blitz G3)) ",
			"(begin " +
			"	(begin " +
			"		(define G1 (- bortz 2)) " +
			"		(define G2 (accept bumf null)) " +
			"		(define G3 (bar G1 G2))) " +
			"	(accept blitz G3)) ");
}

public void testDebugComposite3 ()
throws Exception {
	testTransformation(
			"(define G5 " +
			"	(begin " +
			"		(define G3 " +
			"			(begin " +
			"				(define G1 (- bortz 2)) " +
			"				(define G2 (accept bumf null)) " +
			"				(bar G1 G2))) " +
			"		(accept blitz G3))) ",
			"(begin " +
			"	(begin " +
			"		(define G1 (- bortz 2)) " +
			"		(define G2 (accept bumf null)) " +
			"		(define G3 (bar G1 G2))) " +
			"	(define G5 (accept blitz G3))) ");
}

public void testResultsAreStable1 ()
throws Exception {
	testTransformation(
			"(begin " +
			"	(define G1 (accept bar null)) " +
			"	(bash foo G1 blitz))",
			"(begin " +
			"	(define G1 (accept bar null)) " +
			"	(bash foo G1 blitz))" );
}

public void testResultsAreStable2 ()
throws Exception {
	testTransformation(
			"(begin (define G1 (+ foo 1)) (define G2 (accept bar null)) (bash G1 G2 blitz))", // flatten leaders
			"(begin (define G1 (+ foo 1)) (define G2 (accept bar null)) (bash G1 G2 blitz))");
}

public void testResultsAreStable3 ()
throws Exception {
	testTransformation(
			"(begin (define G1 (accept bar)) (bash foo G1 (+ blitz 1)))",
			"(begin (define G1 (accept bar)) (bash foo G1 (+ blitz 1)))");
}

//			"(begin" +
//			"	(define G4 (+ foo 1)) " +
//			"	(define G5 " +
//			"		(begin " +
//			"			(define G3 " +
//			"				(begin " +
//			"					(define G1 (- bortz 2)) " +
//			"					(define G2 (accept bumf null)) " +
//			"					(bar G1 G2))) " +
//			"			(accept blitz G3))) " +
//			"   	(bash G4 G5)) "
	
}