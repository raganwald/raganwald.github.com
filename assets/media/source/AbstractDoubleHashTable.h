

#ifndef ABSTRACT_DOUBLE_HASH_TABLE_H
#define ABSTRACT_DOUBLE_HASH_TABLE_H

#ifndef BOOLEAN_H
# include "Boolean.h"
#endif

#ifndef AUTO_ARRAY_T_H
# include "AutoArrayT.h"
#endif

class DoubleHashable;
class DoubleHashableIterator;

#ifndef HASH_UTIL_H
# include "HashUtil.h"
#endif

class AbstractDoubleHashTable
{
	friend class DoubleHashableAllIterator;

public:
	typedef HashUtil::Key Key;

	// default constructor
	AbstractDoubleHashTable(long tableSize = 0);

	// no copy constructor
private:
	AbstractDoubleHashTable(const AbstractDoubleHashTable & source);

public:
	// destructor
	virtual ~AbstractDoubleHashTable(void);

	// WARNING:  h is pointer-remembered (not copied).
	// Caller must allocate h but not free it.
	// h will be freed (via delete) by remove() or ~AbstractDoubleHashTable(),
	// whichever comes first.
	void add(DoubleHashable * h);

	// Returns a pointer to the object with key k, if it exists.
	// Returns NULL if it isn't found.
	// Caller should copy the object, not remember the pointer.
	DoubleHashable * get1(const Key) const;
	DoubleHashable * getFirst2(const Key) const;
	DoubleHashableIterator getAll2(const Key) const;

	// Returns FALSE on failure (not found).
	Boolean remove1(const Key k);

	void removeAll (void);

	// Rebuilds the table--use if you know that one of the DoubleHashables
	// has changed key
	void rebuild (void);

	// returns an iterator over all of the keys
	DoubleHashableAllIterator getAll (void) const;

	// Return h(this)
	static long hash(const Key k) { return k; }

	// Dump the list of keys in the hash table to stdout
	void debugDump(void);

protected:
	const unsigned long tableSize_;
	AutoArrayT<DoubleHashable *> table1_;
	AutoArrayT<DoubleHashable *> table2_;
	virtual void discard (DoubleHashable *) = 0;
};

#endif // ABSTRACT_DOUBLE_HASH_TABLE_H
