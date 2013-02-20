

#ifndef DOUBLE_HASHABLE_ALL_ITERATOR_T_H
#define DOUBLE_HASHABLE_ALL_ITERATOR_T_H

#ifndef DOUBLE_HASHABLE_ALL_ITERATOR_H
# include "DoubleHashableAllIterator.h"
#endif

#ifdef _MSC_VER
# pragma warning(disable:4541)
#endif

template<class DoubleHashable_>
class DoubleHashableAllIteratorT :
private DoubleHashableAllIterator
{
	public:

		typedef DoubleHashable_ hashable_type;
		
		DoubleHashableAllIteratorT (const DoubleHashableAllIteratorT & that)
			: DoubleHashableAllIterator(that)
		{ }
		
		DoubleHashableAllIteratorT (const DoubleHashableAllIterator & that)
			: DoubleHashableAllIterator(that)
		{ }
		
		explicit DoubleHashableAllIteratorT (const AbstractDoubleHashTable & ref_table)
			: DoubleHashableAllIterator(ref_table)
		{ }
		
		virtual ~DoubleHashableAllIteratorT (void)
		{ }
		
		// next prefix
		DoubleHashableAllIteratorT operator++ (void)
		{ return static_cast<DoubleHashableAllIteratorT>(DoubleHashableAllIterator::operator++()); }
		
		//dereference
		hashable_type & operator* (void) const
		{ return static_cast<hashable_type &>(DoubleHashableAllIterator::operator*()); }
		
		hashable_type * operator-> (void) const
		{ return static_cast<hashable_type *>(DoubleHashableAllIterator::operator->()); }
		
		operator bool (void) const
		{ return DoubleHashableAllIterator::operator bool(); }
			
	private:
		
		DoubleHashableAllIteratorT & operator= (const DoubleHashableAllIteratorT &); // don't
		
};

#endif // DOUBLE_HASHABLE_ALL_ITERATOR_T_H
