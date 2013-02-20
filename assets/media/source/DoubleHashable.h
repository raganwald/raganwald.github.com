

#ifndef DOUBLE_HASHABLE_H
#define DOUBLE_HASHABLE_H

#include <string>
using namespace std;

#ifndef BOOLEAN_H
# include "Boolean.h"
#endif

#ifndef HASH_UTIL_H
# include "HashUtil.h"
#endif

class DoubleHashable
{

public:

	typedef HashUtil::Key Key;

	// Default constructor
	DoubleHashable(void);

	// Copy constructor
	DoubleHashable(const DoubleHashable &);

	// Assignment operator must also be defined for each class that
	// inherits from this one.
	// virtual Hashable operator=(const Hashable & source) = 0;

	// Destructor
	virtual ~DoubleHashable(void);

	// Return this hashable's key values
	virtual const Key getKey1(void) const = 0;
	virtual const Key getKey2(void) const = 0;

	virtual bool operator== (const DoubleHashable &);

	// Get/set the next-in-chain 
	void       setNext1(DoubleHashable * setting) { next1_ = setting; }
	DoubleHashable * getNext1(void) const         { return next1_; }

	void       setNext2(DoubleHashable * setting) { next2_ = setting; }
	DoubleHashable * getNext2(void) const         { return next2_; }

private:
	DoubleHashable * next1_;	
	DoubleHashable * next2_;		// Note:  this is not copied, nor freed
};

#endif // DOUBLE_HASHABLE_H