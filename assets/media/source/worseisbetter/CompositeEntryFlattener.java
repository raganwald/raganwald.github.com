/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA. */

package com.braithwaitelee.worseisbetter;

public class CompositeEntryFlattener
extends CompositeNodeVisitor {
	
public CompositeEntryFlattener (String name) {
	super(name);
	this.addTransformer(new EntryFlattener());
	this.addTransformer(new SetBangBeginFlattener());
	this.addTransformer(new BeginBeginFlattener());
}

public void testCasesWithoutSetBangs ()
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

public void testSimplestSetBangCase ()
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

public void testSetBangWithinDefine ()
throws Exception {
	testTransformation(
			"(define bash (begin (set! foo (begin (+1 bar) bar)) foo))",
			"(begin (+1 bar) (set! foo bar) (define bash foo))");

}

public void testCasesWithoutLabels ()
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

public void testCasesWithLabelsThatShouldNotFlatten ()
throws Exception {
	testTransformation(
			"(begin (set! foo (+ 1 2)) (call-continuation @return-continuation 3) (label fud))",
			"(begin (set! foo (+ 1 2)) (call-continuation @return-continuation 3) (label fud))");
	testTransformation(
			"(begin (set! foo (+ 1 2)) (call-continuation @return-continuation 3) (label fud) (set! bar (+ foo 1)))",
			"(begin (set! foo (+ 1 2)) (call-continuation @return-continuation 3) (label fud) (set! bar (+ foo 1)))");
}

public void testApply ()
throws Exception {
	testTransformation(
			"(bash " +
			"	foo " +
			"	(begin " +
			"		(call-continuation bar \"some value\") " +
			"		(label fud)) " +
			"	blitz)"
		,
			"(begin " +
			"	(call-continuation bar \"some value\") " +
			"	(define G1 (label fud)) " +
			"	(bash foo G1 blitz))"
		);
}

public void testApplyWithPriorApplication ()
throws Exception {
	testTransformation(
			"(bash " +
			"	(+ foo 1) " +
			"	(begin " +
			"		(call-continuation bar \"some value\") " +
			"		(label fud)) " +
			"	blitz)"
		,
			"(begin " +
			"	(define G1 (+ foo 1)) " +
			"	(call-continuation bar \"some value\") " +
			"	(define G2 (label fud)) " +
			"	(bash G1 G2 blitz))"
		);
}

public void testApplyWithSubsequentApplication ()
throws Exception {
	testTransformation(
			"(bash " +
			"	foo " +
			"	(begin " +
			"		(call-continuation bar null) " +
			"		(label fud)) " +
			"	(+ blitz 1))"
		,
			"(begin " +
			"	(call-continuation bar null) " +
			"	(define G1 (label fud)) " +
			"	(bash foo G1 (+ blitz 1)))"
		);
}

public void testLabelInsideTwoLayersOfApplications ()
throws Exception {
	testTransformation(
			"(bash (+ foo 1) (blug  (- bar 2) (begin (call-continuation blitz \"another value\") (label fud))))", // flatten recursively
			"(begin " +
			"	(define G3 (+ foo 1)) " +
			"	(define G1 (- bar 2)) " +
			"	(call-continuation blitz \"another value\") " +
			"	(define G2 (label fud)) " +
			"	(define G4 (blug G1 G2)) " +
			"	(bash G3 G4)) "
		);
}

public void testLabelInsideExchange ()
throws Exception {
	testTransformation(
		"(bash " +
		"	(+ foo 1) " +
		"	(begin " +
		"		(call-continuation " +
		"			blitz " +
		"			(bar " +
		"				(- bortz 2) " +
		"				(begin " +
		"					(call-continuation bumf null) " +
		"					(label bumf-label)))) " +
		"		(label blitz-label)))"
	,
		"(begin " +
		"	(define G4 (+ foo 1)) " +
		"	(define G1 (- bortz 2)) " +
		"	(call-continuation bumf null) " +
		"	(define G2 (label bumf-label)) " +
		"	(define G3 (bar G1 G2)) " +
		"	(call-continuation blitz G3) " +
		"	(define G5 (label blitz-label)) " +
		"	(bash G4 G5)) "
	);
}

public void testCallInsideCallReversedWithExchangeSyntax ()
throws Exception {
	testTransformation(
		"(bash " +
		"	(begin " +
		"		(call-continuation " +
		"			(bar " +
		"				(begin " +
		"					(call-continuation bumf null) " +
		"					(label bumf-label)) " +
		"				(- bortz 2)) " +
		"			blitz) " +
		"		(label bar-call)) " +
		"	(+ foo 1))"
	,
		"(begin " +
		"	(call-continuation bumf null) " +
		"	(define G1 (label bumf-label)) " +
		"	(define G2 (bar G1 (- bortz 2))) " +
		"	(call-continuation G2 blitz) " +
		"	(define G3 (label bar-call)) " +
		"   	(bash G3 (+ foo 1))) "
	);
}

public void testCallsInsideBegins ()
throws Exception {
	testTransformation(
			"(foo " +
			"	(begin " +
			"		(+ bar 1) " +
			"		(begin " +
			"			(call-continuation fud bar) " +
			"			(label fud-label)) " +
			"		(blitz null)) " +
			"	bash) "
	,
			"(begin" +
			"	(+ bar 1) " +
			"	(call-continuation fud bar) " +
			"	(label fud-label) " +
			"	(define G1 (blitz null)) " +
			"   	(foo G1 bash)) "
	);
}

}