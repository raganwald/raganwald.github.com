

#ifndef DEALLOC_DOUBLE_HASH_TABLE_T_H
#define DEALLOC_DOUBLE_HASH_TABLE_T_H

#ifndef DEALLOC_DOUBLE_HASH_TABLE_H
# include "DeallocDoubleHashTable.h"
#endif

#ifndef DOUBLE_HASHABLE_ITERATOR_T
# include "DoubleHashableIteratorT.h"
#endif

#ifndef DOUBLE_HASHABLE_ITERATOR_T
# include "DoubleHashableAllIteratorT.h"
#endif

#ifndef TA_OBJECT_POOL_H
# include "TaObjectPool.h"
#endif

#ifndef EXTERNAL_MEMORY
# include <memory>
# define EXTERNAL_MEMORY
#endif

#ifdef _MSC_VER
# pragma warning(disable:4541)
#endif

template <class DoubleHashable_>
class DeallocDoubleHashTableT :
private DeallocDoubleHashTable
{
	public:
		typedef DoubleHashable_ hashable_type;
		typedef DoubleHashableIteratorT<hashable_type> iterator_type;
		typedef DoubleHashableAllIteratorT<hashable_type> all_iterator_type;
		
		DeallocDoubleHashTableT (int size = 0)
			: DeallocDoubleHashTable(std::auto_ptr<TaObjectPool>(new TaObjectPool(sizeof(hashable_type))),size)
		{ }

		virtual ~DeallocDoubleHashTableT (void)
		{ removeAll(); }
		
		// WARNING:  h is pointer-remembered (not copied).
		// Caller must allocate h but not free it.
		// h will be freed (via delete) by remove() or ~AbstractDoubleHashTable(),
		// whichever comes first.
		void add(hashable_type * h)
		{ DeallocDoubleHashTable::add(h); }
		
		// Returns a pointer to the object with key k, if it exists.
		// Returns NULL if it isn't found.
		// Caller should copy the object, not remember the pointer.
		hashable_type * get1(const Key k) const
		{ return static_cast<hashable_type *>(DeallocDoubleHashTable::get1(k)); }
		hashable_type * getFirst2(const Key k) const
		{ return static_cast<hashable_type *>(DeallocDoubleHashTable::getFirst2(k)); }
		iterator_type getAll2(const Key k) const
		{ return static_cast<iterator_type>(DeallocDoubleHashTable::getAll2(k)); }
		
		// Returns FALSE on failure (not found).
		Boolean remove1(const Key k)
		{ return DeallocDoubleHashTable::remove1(k); }

		void removeAll (void)
		{ DeallocDoubleHashTable::removeAll(); }
		
		void rebuild (void)
		{ DeallocDoubleHashTable::rebuild(); }
		
		// Return h(this)
		static long hash(const Key k) { return DeallocDoubleHashTable::hash(k); }
		
		// returns an iterator over all of the keys
		all_iterator_type getAll (void) const
		{ return static_cast<all_iterator_type>(DeallocDoubleHashTable::getAll()); }

		void * alloc (void)
		{ return DeallocDoubleHashTable::alloc(); }

	protected:

		virtual void discard (DoubleHashable * p)
		{
			static_cast<hashable_type *>(p)->hashable_type::~hashable_type();
			DeallocDoubleHashTable::discard(p);
		}
		
};

#endif // DEALLOC_DOUBLE_HASH_TABLE_T_H