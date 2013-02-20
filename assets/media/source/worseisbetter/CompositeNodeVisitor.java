/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA. */

package com.braithwaitelee.worseisbetter;

import java.util.List;
import java.util.ArrayList;

public class CompositeNodeVisitor
extends AbstractNodeVisitor {
	
private List visitors = new ArrayList();
private NodeVisitor deepcopy = new NodeCopier();

private final int MAXIMUM_ITERATIONS = 8;
	
public CompositeNodeVisitor (String name) {
	super(name);
}

public void addTransformer (NodeVisitor visitor) {
	if ( !visitors.contains(visitor) ) {
		visitors.add(visitor);
	}
}

private Object visit (AbstractSyntaxTree.Node node, Object optional)
throws Exception {
	Object accumulator = optional;
	AbstractSyntaxTree.Node oldNode = (AbstractSyntaxTree.Node) node.invite(deepcopy, null);
	int numberOfIterations = 0;
	do {
		for ( int i = 0; i < visitors.size(); ++i ) {
			accumulator = node.invite( (NodeVisitor) visitors.get(i), accumulator );
		}
	} while ( !node.equals(oldNode) && ++numberOfIterations < MAXIMUM_ITERATIONS );
	return accumulator;
}
	
public Object visitSymbol (Symbol symbol, Object optional)
throws Exception {
	return visit(symbol, optional);
}

public Object visitSubtree (Subtree subtree, Object optional)
throws Exception {
	return visit(subtree, optional);
}

public Object visitJavaLiteral (JavaLiteral javaLiteral, Object optional)
throws Exception {
	return visit(javaLiteral, optional);
}

public Object visitStringLiteral (StringLiteral stringLiteral, Object optional)
throws Exception {
	return visit(stringLiteral, optional);
}

}