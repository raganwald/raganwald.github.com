/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA.

Written by Reginald Braithwaite-Lee http://www.brathwaite-lee.com/

No, it is not commented: if you're reading this and you'll be interviewing for a position with me,
it's up to you to review this code and make your own deductions. In fact, you'll score extra points
for giving me an intelligent critique of this class, so take your time and really study it.

*/


import java.util.Set;
import java.util.SortedSet;
import java.util.HashSet;
import java.util.TreeSet;
import java.util.Iterator;
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;
import java.util.Collection;

public class rocks {

public static void main (final String[] argv)
throws Exception {
	final List weights = new ArrayList();
	for (int i = 0; i < argv.length; ++i) {
		weights.add(new Integer(argv[i]));
	}
	final SortedSet canExactlyBalance = new TreeSet();
	canExactlyBalance.add(new Integer(0));
	final Set allPowers = powerBag(weights);
	Iterator itAllPowers = allPowers.iterator();
	while ( itAllPowers.hasNext() ) {
		Collection onePowerBag = (Collection) itAllPowers.next();
		int sumonePowerBag = sum(onePowerBag);
		canExactlyBalance.add( new Integer(sumonePowerBag) );
		final Set slices = powerBag(onePowerBag);
		Iterator itSlices = slices.iterator();
		while ( itSlices.hasNext() ) {
			final int sumOneSlice = sum((Collection) itSlices.next());
			final int sumOtherSlice = sumonePowerBag-sumOneSlice;
			canExactlyBalance.add( new Integer(Math.abs(sumOneSlice-sumOtherSlice)) );
		}
	}
	final int high = ((Integer) canExactlyBalance.last()).intValue()-1;
	final SortedSet missing = new TreeSet();
	for (int i = 0; i < high; ++i) {
		if ( canExactlyBalance.contains(new Integer(i)) )
			continue;
		else if ( canExactlyBalance.contains(new Integer(i-1)) && canExactlyBalance.contains(new Integer(i+1)) )
			continue;
		else missing.add(new Integer(i));
	}
	if ( missing.isEmpty() ) {
		System.out.print("Can measure rocks from 0 to ");
		System.out.print(high+2);
		System.out.println(" correctly");
	}
	else {
		System.out.print("Cannot measure rocks from 0 to ");
		System.out.print(high+1);
		System.out.println(" because we can't measure: ");
		Iterator itMissing = missing.iterator();
		System.out.print(itMissing.next());
		while ( itMissing.hasNext() ) {
			System.out.print(", ");
			System.out.print(itMissing.next());
		}
		System.out.println();
	}
}

static int sum (final Collection in) {
	int ret = 0;
	Iterator i = in.iterator();
	while ( i.hasNext() ) {
		ret += ((Integer) i.next()).intValue();
	}
	return ret;
}

static Set powerBag (final Collection in) {
	Set power = new HashSet();
	Iterator i = in.iterator();
	while ( i.hasNext() ) {
		Object element = i.next();
		power.add(Collections.singleton(element));
		List remaining = new ArrayList();
		remaining.addAll(in);
		remaining.remove(element);
		Set subPowers = powerBag(remaining);
		Iterator j = subPowers.iterator();
		while ( j.hasNext() ) {
			List sub = new ArrayList();
			sub.addAll((Collection) j.next());
			sub.add(element);
			Collections.sort(sub);
			power.add(sub);
		}
	}
	return Collections.unmodifiableSet(power);
}

}