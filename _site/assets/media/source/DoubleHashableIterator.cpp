
#include "DoubleHashableIterator.h"
#include "DoubleHashable.h"
#include <new.h>
#include <assert.h>

DoubleHashableIterator::DoubleHashableIterator (DoubleHashable & h)
:	ptr_(&h)
,	key_(h.getKey2())
{ }

DoubleHashableIterator::DoubleHashableIterator (DoubleHashable * p)
:	ptr_(p)
,	key_(p ? p->getKey2() : 0)
{ }

DoubleHashableIterator & DoubleHashableIterator::operator= (const DoubleHashableIterator & that)
{
	if ( this != &that ) {
		this->~DoubleHashableIterator();
		new(this) DoubleHashableIterator(that);
	}
	return *this;
}

// next and previous
DoubleHashableIterator & DoubleHashableIterator::operator++ (void)
{
	if ( ptr_ ) {
		do {
			ptr_ = ptr_->getNext2();
		} while ( ptr_ && ptr_->getKey2() != key_ );
	}
	return *this;
}

// move
DoubleHashableIterator & DoubleHashableIterator::operator+= (const int how_many)
{
	assert( how_many >= 0 );
	for ( int i = 0; i < how_many; ++i ) {
		this->operator++();
	}
	return *this;
}

DoubleHashable * DoubleHashableIterator::operator-> (void) const
{
	assert ( ptr_ );
	return ptr_;
}

// compare to pointers
bool DoubleHashableIterator::operator== (const DoubleHashable * h) const
{
	return ptr_ == h;
}


DoubleHashableIterator::operator DoubleHashable* (void) const
{
	return ptr_;
}
