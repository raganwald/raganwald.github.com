
#ifndef HASHABLE_H
# include "Hashable.h"
#endif

Hashable::Hashable(void)
: SingleLinkableT<Hashable>()
{ }

Hashable::Hashable(const Hashable & source)
: SingleLinkableT<Hashable>(source)
{ }

Hashable::~Hashable(void)
{ }

Hashable * Hashable::clone(void)
{
	assert(FALSE);		// we don't actually know how to construct ourselves

	return NULL;		// indicate failure
}

Hashable * Hashable::clone(void * addr)
{
	assert(FALSE);		// we don't actually know how to construct ourselves

	assert(NULL != addr);

	return NULL;		// indicate failure
}

