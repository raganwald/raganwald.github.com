package com.raganwald;

/**
 * 
 * @author reg@raganwald.com
 * 
 * @see http://www.nextag.com/serv/main/about/jobs/java.jsp
 * @see http://endangeredit.xlan.org/story/2005/7/18/151520/852
 * @see http://www.oreillynet.com/pub/wlg/5094
 * 
 * Programming Problem
 * 
 * Given a deck of nCards unique cards, cut the deck iCut cards from top and perform a perfect shuffle.
 * A perfect shuffle begins by putting down the bottom card from the top portion of the deck followed
 * by the bottom card from the bottom portion of the deck followed by the next card from the top
 * portion, etc., alternating cards until one portion is used up. The remaining cards go on top. The
 * problem is to find the number of perfect shuffles required to return the deck to its original order.
 * Your function should be declared as:
 * 
 * static long shuffles(int nCards,int iCut);
 * 
 * Please send the result of shuffles(1002,101) along with your program and your resume to
 * 'resume' at nextag.com.
 * 
 * ****************************************************************************************************
 * 
 * My solution is not Java-esque. Before you scream OO murder, ask yourself this question: what part
 * of the problem is susceptible to polymorphism? And yes, I used arrays instead of Vectors and Sets.
 * And yes, I know about the dangers of premature optimization. I can write a slower version that
 * makes extensive use of the collections classes in Java, with iterators, and what-have-you.
 * 
 * ****************************************************************************************************
 * 
 * How did Reg do? For the record, I figured out the main "aha" in about fifteen minutes. The programming
 * took about half an hour, then I looked up the answer on the Internet and found some much better code for
 * calculating the least common multiple. Another half hour was spent cleaning things up (sadly, this is as
 * clean as I'm prepared to make a diversion like this).
 * 
 * Strike that last comment, part of effectiveness is knowing when to stop gold plating.
 *
 */
public class Shuffle {

	public static void main(String[] args) {
		final int nCards = 1002;
		final int iCut = 101;
		final int runs = 10000;
		long totalTime = 0;
		long cycles = 0;
		for (int run = 0; run < runs; ++run) {
			if (run > 0 && run % 1000 == 0) System.out.println(run + " runs done.");
			final long t_before = System.currentTimeMillis();
			cycles = shuffles(nCards,iCut);
			final long t_after = System.currentTimeMillis();
			totalTime = totalTime + t_after - t_before;
		}
		System.out.println("Perfectly shuffling a deck with " + nCards + " cards, taking "
				+ iCut + " cards from the top cycles in " + cycles + " shuffles.");
		System.out.println("(" + totalTime + " milliseconds to process " + runs + " times)");
	}
	
	static long shuffles(int nCards, int iCut) {
		assert iCut < nCards;
		assert nCards > 1;
		int[] permutation = new int[nCards];
		int place = 0;
		int card = iCut;
		final int sizeOfBottomPortion = nCards-iCut;
		if (sizeOfBottomPortion < iCut) {
			while (place <= nCards-iCut) {
				permutation[place] = place++;
			}
		}
		else {
			while(card < sizeOfBottomPortion) {
				permutation[place++] = card++;
			}
		}
		while (card < nCards) {
			permutation[place++] = card;
			permutation[place++] = card++ - sizeOfBottomPortion;
		}
		boolean[] hasCycled = new boolean[permutation.length];
		int numberDone = 0;
		int[] shuffled = new int[permutation.length];
		int[] unshuffled = new int[permutation.length];
		int[] temp;
		// first iteration's a gimme, but not worth optimizing
		for (int i = 0; i < permutation.length; ++i) {
			unshuffled[i] = permutation[i];
		}
		long iterationNumber = 1;
		long result = 1;
		while (numberDone < permutation.length) {
			for(int i = 0; i < permutation.length; ++i) {
				shuffled[i] = unshuffled[permutation[i]];
			}
			iterationNumber++;
			boolean isAPossibleFactor = false;
			for(int i = 0; i < permutation.length; ++i) {
				if (shuffled[i] == i && !hasCycled[i]) {
					hasCycled[i] = true;
					isAPossibleFactor = true;
					++numberDone;
				}
			}
			if (isAPossibleFactor) {
				result = lcm(result, iterationNumber);
			}
			temp = unshuffled;
			unshuffled = shuffled;
			shuffled = temp;
		}
		return result; 
	}

	/**
	 * @see http://www.oreillynet.com/pub/wlg/5094
	 */
    private static long gcd(long a, long b) {
        if (a == 0 && b == 0) return 1;
        if (a < 0) return gcd(-a, b);
        if (b < 0) return gcd(a, -b);
        if (a == 0) return b;
        if (b == 0) return a;
        if (a == b) return a;
        if (b < a) return gcd(b, a);
        return gcd(a, b % a);
    }

    /**
	 * @see http://www.oreillynet.com/pub/wlg/5094
	 */
    private static long lcm(long a, long b) {
        return Math.abs(a * b) / gcd(a, b);
    }
	
}
