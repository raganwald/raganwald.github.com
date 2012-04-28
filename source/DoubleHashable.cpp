

#include "DoubleHashable.h"

DoubleHashable::DoubleHashable(void)
:	next1_(NULL)
,	next2_(NULL)
{ }

DoubleHashable::DoubleHashable(const DoubleHashable & that)
:	next1_(NULL)
,	next2_(NULL)
{ }

DoubleHashable::~DoubleHashable(void)
{
	next1_ = NULL;
	next2_ = NULL;
}

bool DoubleHashable::operator== (const DoubleHashable & that) {
	return this->getKey1() == that.getKey1() && this->getKey2() == that.getKey2();
}
