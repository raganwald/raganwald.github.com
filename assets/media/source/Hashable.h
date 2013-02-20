
#ifndef HASHABLE_H
#define HASHABLE_H

#include <string>
using namespace std;

#include <assert.h>

#ifndef BOOLEAN_H
# include "Boolean.h"
#endif

#ifndef ABSTRACT_HASH_TABLE_H
# include "AbstractHashTable.h"
#endif

#ifndef HASH_TABLE_H
# include "HashTable.h"
#endif

#ifndef SINGLE_LINKABLE_H
# include "SingleLinkable.h"
#endif

class Hashable;

class Hashable :
public SingleLinkableT<Hashable>
{
	friend class AbstractHashTable;
	friend class DeallocDoubleHashTable;
	friend class DeallocHashTable;
	friend class HashableIterator;
	friend class HashableKeyIterator;
	friend class Timestamp;

public:

	typedef AbstractHashTable::Key Key;

	// Default constructor
	Hashable(void);

	// Copy constructor
	explicit Hashable(const Hashable & source);

private:
	// No assignment operator
	Hashable & operator=(const Hashable & source) { assert(0); return *this; }

public:
	// Destructor
	virtual ~Hashable(void);

	// Return this hashable's key value
	virtual const Key getKey(void) const = 0;

	// Create an object using new() and copy this object into it
	virtual Hashable * clone(void);

	// Copy this object into the address specified in addr
	// NB: It's the caller's responsibility to ensure that
	//     the memory allocated at addr is big enough.
	virtual Hashable * clone(void * addr);

protected:
	void       init(void);
	void       copyFrom(const Hashable & source);
};

#endif /* HASHABLE_H */


