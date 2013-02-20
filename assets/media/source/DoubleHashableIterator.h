

#ifndef DOUBLE_HASHABLE_ITERATOR_H
#define DOUBLE_HASHABLE_ITERATOR_H

#ifndef assert
# include <assert.h>
#endif

class DoubleHashable;

class DoubleHashableIterator
{
public:
	DoubleHashableIterator (void);
	explicit DoubleHashableIterator (DoubleHashable &);
	explicit DoubleHashableIterator (DoubleHashable *);
	DoubleHashableIterator (const DoubleHashableIterator &);
	DoubleHashableIterator & operator= (const DoubleHashableIterator &);
	~DoubleHashableIterator (void);

	// next prefix
	DoubleHashableIterator & operator++ (void);
	// next postfix
	DoubleHashableIterator operator++ (int)
	{
		DoubleHashableIterator old = *this;
		++(*this);
		return old;
	}

	// move
	DoubleHashableIterator & operator+= (const int);

	//dereference
	DoubleHashable & operator* (void) const;
	DoubleHashable * operator-> (void) const;

	// compare to pointers
	bool operator== (const DoubleHashable *) const;

	// convert as an operator
	operator DoubleHashable* (void) const;
	operator bool (void) const;

private:
	DoubleHashable * ptr_;
	const long key_;
};

inline DoubleHashableIterator::DoubleHashableIterator (void)
:	ptr_(0) // legal!
,	key_(0)
{ }

inline DoubleHashableIterator::DoubleHashableIterator (const DoubleHashableIterator & that)
:	ptr_(that.ptr_)
,	key_(that.key_)
{ }

//dereference
inline DoubleHashable & DoubleHashableIterator::operator* (void) const
{
	assert ( ptr_ );
	return *ptr_;
}

inline DoubleHashableIterator::operator bool (void) const
{
	return ptr_ != 0;
}

inline DoubleHashableIterator::~DoubleHashableIterator (void)
{ }

#endif // DOUBLE_HASHABLE_ITERATOR_H
