

#ifndef TA_OBJECT_POOL_H
#define TA_OBJECT_POOL_H

#ifndef EXTERNAL_ASSERT_H
# include <assert.h>
# define EXTERNAL_ASSERT_H
#endif

#ifndef EXTERNAL_STDDEF_H
# include <stddef.h>
# define EXTERNAL_STDDEF_H
#endif

#ifndef STRICT_POINTER_T_H
# include "StrictPointerT.h"
#endif

class MemoryBlock;

class TaObjectPool
{
private:

	StrictPointerT<MemoryBlock> ap_block_allocator;

	const size_t object_size_;
	const int chunk_size_;
	int instance_count_;

	struct Link
	{
		Link * p_next;
	};

	Link * p_free_list_;
	void replenish (void);

private:

	TaObjectPool (const TaObjectPool &); // not implemented
	TaObjectPool & operator= (const TaObjectPool &); // not implemented

public:

	TaObjectPool (int object_size, int chunk_size = 0);

	~TaObjectPool (void);

	void * alloc (void);
	void free (void *);
	void dryUp (void); // release all dynamic memory from this pool

};

inline void * TaObjectPool::alloc (void)
{
	if ( !p_free_list_ ) {
		replenish();
	}
	assert ( p_free_list_ );
	Link * p = p_free_list_;
	p_free_list_ = p->p_next;
	++instance_count_;
	return p;
}

inline void TaObjectPool::free (void * p_obj)
{
	Link * p = static_cast<Link *>(p_obj);
	p->p_next = p_free_list_;
	p_free_list_ = p;
	--instance_count_;
}
#endif // TA_OBJECT_POOL_H
