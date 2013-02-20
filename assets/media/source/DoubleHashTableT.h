

#ifndef DOUBLE_HASH_TABLE_T_H
#define DOUBLE_HASH_TABLE_T_H

#ifndef ABSTRACT_DOUBLE_HASH_TABLE_H
# include "AbstractDoubleHashTable.h"
#endif

#ifndef DOUBLE_HASHABLE_ITERATOR_T
# include "DoubleHashableIteratorT.h"
#endif

#ifndef TA_OBJECT_POOL_H
# include "TaObjectPool.h"
#endif

#ifdef _MSC_VER
# pragma warning(disable:4541)
#endif

template <class DoubleHashable_>
class DoubleHashTableT :
private AbstractDoubleHashTable
{
	public:
		typedef DoubleHashable_ hashable_type;
		typedef DoubleHashableIteratorT<hashable_type> iterator_type;
		typedef AbstractDoubleHashTable::Key key_type;
		
		DoubleHashTableT ()
			: AbstractDoubleHashTable()
		{ }

		virtual ~DoubleHashTableT (void)
		{ }
		
		// WARNING:  h is pointer-remembered (not copied).
		// Caller must allocate h but not free it.
		// h will be freed (via delete) by remove() or ~AbstractDoubleHashTable(),
		// whichever comes first.
		void add(hashable_type * h)
		{ AbstractDoubleHashTable::add(h); }
		
		// Returns a pointer to the object with key k, if it exists.
		// Returns NULL if it isn't found.
		// Caller should copy the object, not remember the pointer.
		hashable_type * get1(const Key k) const
		{ return static_cast<hashable_type *>(AbstractDoubleHashTable::get1(k)); }
		hashable_type * getFirst2(const Key k) const
		{ return static_cast<hashable_type *>(AbstractDoubleHashTable::getFirst2(k)); }
		iterator_type getAll2(const Key k) const
		{ return static_cast<iterator_type>(AbstractDoubleHashTable::getAll2(k)); }
		
		// Returns FALSE on failure (not found).
		Boolean remove1(const Key k)
		{ return AbstractDoubleHashTable::remove1(k); }
		
		void rebuild (void)
		{ AbstractDoubleHashTable::rebuild(); }
		
		// Return h(this)
		static long hash(const Key k) { return AbstractDoubleHashTable::hash(k); }
		
	protected:

		virtual void discard (DoubleHashable * p) { delete p; }
		
};

#endif // DOUBLE_HASH_TABLE_T_H
