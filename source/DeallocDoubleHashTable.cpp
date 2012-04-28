

#ifndef DEALLOC_DOUBLE_HASH_TABLE_H
# include "DeallocDoubleHashTable.h"
#endif

#ifndef DOUBLE_HASHABLE_H
# include "DoubleHashable.h"
#endif


DeallocDoubleHashTable::~DeallocDoubleHashTable(void)
{
	ap_pool_->dryUp();
}

void DeallocDoubleHashTable::discard (DoubleHashable * p)
{
	// normally we would call its destructor first
	ap_pool_->free(p);
}