

#ifndef DEALLOC_DOUBLE_HASH_TABLE_H
#define DEALLOC_DOUBLE_HASH_TABLE_H

#ifndef AUTO_PTR_H
# include "auto_ptr.h"
#endif

#ifndef TA_OBJECT_POOL_H
# include "TaObjectPool.h"
#endif

#ifndef ABSTRACT_DOUBLE_HASH_TABLE
# include "AbstractDoubleHashTable.h"
#endif

#ifndef EXTERNAL_MEMORY
# include <memory>
# define EXTERNAL_MEMORY
#endif

class DeallocDoubleHashTable : public AbstractDoubleHashTable
{
public:
	DeallocDoubleHashTable (auto_ptr<TaObjectPool> ap_pool)
		:	AbstractDoubleHashTable()
		,	ap_pool_(ap_pool)
	{ }
	DeallocDoubleHashTable (auto_ptr<TaObjectPool> ap_pool, int size)
		:	AbstractDoubleHashTable(size)
		,	ap_pool_(ap_pool)
	{ }
	virtual ~DeallocDoubleHashTable(void);
	
	virtual void * alloc (void)
	{
		return ap_pool_->alloc();
	}

protected:

	virtual void discard (DoubleHashable * p) = 0;

private:
	auto_ptr<TaObjectPool> ap_pool_;
};

#endif // DEALLOC_DOUBLE_HASH_TABLE_H
