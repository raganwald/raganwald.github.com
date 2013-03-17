
#ifndef DOUBLE_HASHABLE_ITERATOR_T_H
#define DOUBLE_HASHABLE_ITERATOR_T_H

#ifndef DOUBLE_HASHABLE_ITERATOR_H
# include "DoubleHashableIterator.h"
#endif

#ifdef _MSC_VER
# pragma warning(disable:4541)
#endif

template<class DoubleHashable_>
class DoubleHashableIteratorT :
private DoubleHashableIterator
{
	public:
		typedef DoubleHashable_ hashable_type;

		DoubleHashableIteratorT (void)
			: DoubleHashableIterator()
		{ }

		DoubleHashableIteratorT (const DoubleHashableIterator & hi)
			: DoubleHashableIterator(hi)
		{ }

		DoubleHashableIteratorT (const DoubleHashableIteratorT & that)
			: DoubleHashableIterator(static_cast<DoubleHashableIterator>(that))
		{ }

		DoubleHashableIteratorT & operator= (const DoubleHashableIteratorT & that)
		{
			if ( this != &that ) {
				DoubleHashableIteratorT::~DoubleHashableIteratorT();
				new(this) DoubleHashableIteratorT(that);
			}
			return *this;
		}
		
		~DoubleHashableIteratorT (void)
		{ }
		
		// next prefix
		DoubleHashableIteratorT & operator++ (void)
		{ return static_cast<DoubleHashableIteratorT &>(DoubleHashableIterator::operator++()); }
		// next postfix
		const DoubleHashableIteratorT & operator++ (int)
		{ return static_cast<DoubleHashableIteratorT &>(DoubleHashableIterator::operator++(0)); }
		
		// move
		DoubleHashableIteratorT & operator+= (const int x)
		{ 
			DoubleHashableIterator::operator+=(x);
			return *this;
		}
		
		// add
		DoubleHashableIteratorT operator+ (const int x)
		{ return DoubleHashableIterator::operator+(x); }
		
		//dereference
		hashable_type & operator* (void) const
		{ return static_cast<hashable_type &>(DoubleHashableIterator::operator*()); }

		hashable_type * operator-> (void) const
		{ return static_cast<hashable_type *>(DoubleHashableIterator::operator->()); }

		// compare to pointers
		bool operator== (const hashable_type * that) const
		{ return DoubleHashableIterator::operator==(that); }
		
		// convert as an operator
		//operator hashable_type* (void)
		//{ return static_cast<hashable_type *>(static_cast<DoubleHashable *>(this)); }

		operator bool (void) const
		{ return DoubleHashableIterator::operator bool(); }
		
};

#endif // DOUBLE_HASHABLE_ITERATOR_T_H