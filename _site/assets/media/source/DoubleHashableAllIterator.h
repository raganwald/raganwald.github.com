

#ifndef DOUBLE_HASHABLE_ALL_ITERATOR_H
#define DOUBLE_HASHABLE_ALL_ITERATOR_H

class AbstractDoubleHashTable;
class DoubleHashable;

#ifdef _MSC_VER
# pragma warning(disable:4541)
#endif

class DoubleHashableAllIterator
{
	public:
		
		DoubleHashableAllIterator (const DoubleHashableAllIterator &);
		
		explicit DoubleHashableAllIterator (const AbstractDoubleHashTable &);
		
		virtual ~DoubleHashableAllIterator (void)
		{ }
		
		// next prefix
		DoubleHashableAllIterator & operator++ (void);
		
		//dereference
		DoubleHashable & operator* (void) const
		{ return *p_double_hashable_; }
		
		DoubleHashable * operator-> (void) const
		{ return p_double_hashable_; }
		
		operator bool (void) const
		{ return p_double_hashable_ != 0; }
			
	private:
		
		DoubleHashableAllIterator & operator= (const DoubleHashableAllIterator &); // don't
		
		const AbstractDoubleHashTable * p_table_;
		int bucket_number_;
		DoubleHashable * p_double_hashable_;
		
};

#endif // DOUBLE_HASHABLE_ALL_ITERATOR_H/