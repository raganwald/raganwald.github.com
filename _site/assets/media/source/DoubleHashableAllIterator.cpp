

#include "DoubleHashableAllIterator.h"

#ifndef DOUBLE_HASHABLE_H
# include "DoubleHashable.h"
#endif

#ifndef ABSTRACT_DOUBLE_HASH_TABLE_H
# include "AbstractDoubleHashTable.h"
#endif

DoubleHashableAllIterator::DoubleHashableAllIterator (const DoubleHashableAllIterator & that)
: p_table_(that.p_table_)
, bucket_number_(that.bucket_number_)
, p_double_hashable_(that.p_double_hashable_)
{ }

DoubleHashableAllIterator::DoubleHashableAllIterator (const AbstractDoubleHashTable & ref_table)
: p_table_(&ref_table)
, bucket_number_(0)
, p_double_hashable_(ref_table.table1_[0])
{ }

// next prefix
DoubleHashableAllIterator & DoubleHashableAllIterator::operator++ (void)
{
	if ( p_double_hashable_ ) {
		p_double_hashable_ = p_double_hashable_->getNext1();
	}
	int one_less = p_table_->tableSize_-1;
	while ( !p_double_hashable_ && bucket_number_ < one_less ) {
		++bucket_number_;
		p_double_hashable_ = p_table_->table1_[bucket_number_];
	}
	return *this;
}