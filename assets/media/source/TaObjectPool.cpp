

#include <assert.h>
#include "MemoryBlock.h"
#include "TaBadAlloc.h"
#include "TaObjectPool.h"

enum { DEFAULT_CHUNK_SIZE = 32 }; // insulated from clients

TaObjectPool::TaObjectPool (int object_size, int chunk_size)
:	ap_block_allocator()
,	object_size_( (size_t)object_size >= sizeof(Link) ? object_size : sizeof(Link) )
,	chunk_size_( chunk_size > 0 ? chunk_size : DEFAULT_CHUNK_SIZE )
,	instance_count_(0)
,	p_free_list_(0)
{
	assert( object_size > 0 );
	MemoryBlock * mb = new MemoryBlock();
	test_alloc(mb);
	ap_block_allocator = StrictPointerT<MemoryBlock>(mb);
	assert( ap_block_allocator->valid() );
}

void TaObjectPool::dryUp (void)
{
	assert( ap_block_allocator->valid() );
	ap_block_allocator->release();
	p_free_list_ = 0;
	instance_count_ = 0;
}

TaObjectPool::~TaObjectPool (void)
{
	assert ( instance_count_ == 0 );
	assert( ap_block_allocator->valid() );
}

void TaObjectPool::replenish (void)
{
	int size = object_size_ * chunk_size_;
	char * start = static_cast<char *>(ap_block_allocator->allocate(size));
	test_alloc(start);
	char * last = &start[(chunk_size_-1) * object_size_];
	for ( char * p = start; p < last; p += object_size_ ) {
		reinterpret_cast<Link *>(p)->p_next = reinterpret_cast<Link *>(p + object_size_);
	}
	reinterpret_cast<Link *>(last)->p_next = 0;
	p_free_list_ = reinterpret_cast<Link *>(start);
}

