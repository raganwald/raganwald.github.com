

#include "AbstractDoubleHashTable.h"
#include <assert.h>
#include "DoubleHashable.h"
#include "DoubleHashableAllIterator.h"
#include "DoubleHashableIterator.h"
#include "general.h"
#include <iostream>
#include "TaBadAlloc.h"

enum { DEFAULT_TABLE_SIZE = 5003 }; // should be a prime number

// default constructor
AbstractDoubleHashTable::AbstractDoubleHashTable(long tableSize)
: tableSize_(tableSize > 0 ? tableSize : DEFAULT_TABLE_SIZE)
, table1_(new DoubleHashable *[tableSize > 0 ? tableSize : DEFAULT_TABLE_SIZE])
, table2_(new DoubleHashable *[tableSize > 0 ? tableSize : DEFAULT_TABLE_SIZE])
{
	table1_.setAll(0, tableSize_);
	table2_.setAll(0, tableSize_);
}

// destructor
AbstractDoubleHashTable::~AbstractDoubleHashTable(void)
{
#ifndef NDEBUG
	if ( table1_ || table2_ ) {
		assert( table1_ && table2_ );
		for ( unsigned long i = 0; i < tableSize_; ++i ) {
			assert( table1_[i] == NULL );
			assert( table2_[i] == NULL );
		}
	}
#endif
}

DoubleHashableAllIterator AbstractDoubleHashTable::getAll(void) const
{
	return DoubleHashableAllIterator(*this);
}

DoubleHashableIterator AbstractDoubleHashTable::getAll2(const AbstractDoubleHashTable::Key k) const
{
	return DoubleHashableIterator(getFirst2(k));
}

// WARNING:  h is pointer-remembered (not copied).
// Caller must allocate h but not free it.
// h will be freed (via delete) by remove() or ~AbstractDoubleHashTable(),
// whichever comes first.
void AbstractDoubleHashTable::add(DoubleHashable * h)
{
	assert(NULL != h);
	assert(NULL == get1(h->getKey1()));	// can't replace; remove, then add

	unsigned long i = hash(h->getKey1());
	i %= tableSize_;

	h->setNext1(table1_[i]);
	table1_[i] = h;

	i = hash(h->getKey2());
	i %= tableSize_;

	h->setNext2(table2_[i]);
	table2_[i] = h;
}

// Returns a pointer to the object with key k, if it exists.
// Returns NULL if it isn't found.
// Caller should copy the object, not remember the pointer.
DoubleHashable * AbstractDoubleHashTable::get1(const AbstractDoubleHashTable::Key k) const
{
	unsigned long i = hash(k);
	i %= tableSize_;

	DoubleHashable * p = table1_[i];

	while (p) {
		if ( p->getKey1() == k ) {
			return p;
		}
		p = p->getNext1();
	}

	return NULL;
}

DoubleHashable * AbstractDoubleHashTable::getFirst2(const AbstractDoubleHashTable::Key k) const
{
	unsigned long i = hash(k);
	i %= tableSize_;

	DoubleHashable * p = table2_[i];

	while (p) {
		if ( p->getKey2() == k ) {
			return p;
		}
		p = p->getNext2();
	}

	return NULL;
}

// Returns FALSE on failure (not found).
static Boolean remove_(const long tableSize_, const AutoArrayT<DoubleHashable *> & table2_, DoubleHashable * h)
{
	unsigned long i = AbstractDoubleHashTable::hash(h->getKey2());
	i %= tableSize_;

	if ( table2_[i] == NULL ) {
		return FALSE;
	}
	else {
		DoubleHashable * p = table2_[i];
		DoubleHashable * q = table2_[i]->getNext2();

		if ( p == h ) {
			table2_[i] = q;
			return TRUE;
		}
		else {
			while (q) {
				if ( q == h ) {
					p->setNext2(q->getNext2());
					return TRUE;
				}
				
				p = q;
				q = q->getNext2();
			}
			return FALSE;
		}
	}
}

// Returns FALSE on failure (not found).
Boolean AbstractDoubleHashTable::remove1(const AbstractDoubleHashTable::Key k)
{
	unsigned long i = hash(k);
	i %= tableSize_;

	if ( table1_[i] == NULL ) {
		return FALSE;
	}
	else {
		DoubleHashable * p = table1_[i];
		DoubleHashable * q = table1_[i]->getNext1();

		if ( p->getKey1() == k ) {
			table1_[i] = q;
			if ( remove_(tableSize_, table2_, p) ) {
				this->discard(p);
				return TRUE;
			}
			else {
				return FALSE;
			}

		}
		else {
			while (q) {
				if ( q->getKey1() == k ) {
					p->setNext1(q->getNext1());
					if ( remove_(tableSize_, table2_, q) ) {
						this->discard(q);
						return TRUE;
					}
					else {
						return FALSE;
					}
				}
				
				p = q;
				q = q->getNext1();
			}
			return FALSE;
		}
	}
}

void AbstractDoubleHashTable::removeAll (void)
{
	for ( unsigned long i = 0; i < tableSize_; ++i ) {

		DoubleHashable * q = table1_[i];
		table1_[i] = NULL;
		table2_[i] = NULL;

		while ( q ) {
			DoubleHashable * p = q;
			q = q->getNext1();
			this->discard(p);
		}

	}
}

void AbstractDoubleHashTable::rebuild (void)
{
	unsigned long i;
	AutoArrayT<DoubleHashable *> oldTable(new DoubleHashable *[tableSize_]);
	
	for (i = 0; i < tableSize_; ++i) {
		oldTable[i] = table1_[i];
		table1_[i] = NULL;
	}
	
	for (i = 0; i < tableSize_; ++i) {
		DoubleHashable * p, * q;
		
		if (NULL != oldTable[i]) {
			p = oldTable[i];
			do {
				q = p->getNext1();
				this->add(p);
				p = q;
			} while (q);
			
			oldTable[i] = NULL;
		}
	}
}

// default implementation
void AbstractDoubleHashTable::discard (DoubleHashable * p)
{
	delete p;
	p = NULL;
}
