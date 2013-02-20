
/* This work is licensed under the Creative Commons Attribution-NonCommercial License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/1.0/ or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305, USA.

Written by Reginald Braithwaite-Lee http://www.brathwaite-lee.com/

The purpose of this class is to get a feel for the Groovy language

*/

public class rocks {

public static void main(String[] proposedWeights) {

Set weightsWeCanMeasure = new TreeSet() // could be even faster with a slightly opaque array implementation
weightsWeCanMeasure.add 0
proposedWeights.each { eachWeight |
	eachWeight = Integer.valueOf(eachWeight)
	inAdditionYouCanAlsoWeigh = [ eachWeight ]
	weightsWeCanMeasure.each { weCanAlreadyMeasure |
		inAdditionYouCanAlsoWeigh += weCanAlreadyMeasure + eachWeight
		inAdditionYouCanAlsoWeigh += Math.abs(weCanAlreadyMeasure - eachWeight)
	}
	inAdditionYouCanAlsoWeigh.each { weightsWeCanMeasure.add(it) }
}

lastWeight = 0
weightsWeCanMeasure.each { weight |
	if ( weight > lastWeight + 2 ) {
		println "can weigh up to ${lastWeight} units"
		return
	}
	lastWeight = weight
}
println "can weigh up to ${lastWeight} units"

}

}