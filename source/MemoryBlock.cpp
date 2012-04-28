

#include "MemoryBlock.h"
#include <assert.h>
#include "TaBadAlloc.h"

class BlockLink
{
private:
	void * p_block;
	BlockLink * p_link;
	bool valid_;
	BlockLink (const BlockLink &); // not implemented
	BlockLink & operator= (const BlockLink &); // not implemented

public:
	BlockLink (void * block, BlockLink * next)
		:	p_block(block)
		,	p_link(next)
		,	valid_(true)
	{ }

	~BlockLink (void)
	{
		assert( valid_ );
		valid_ = false;
		delete[] p_block;
	}

	BlockLink * next () const
	{
		assert( valid_ );
		return p_link;
	}

	bool valid (void) const
	{
		return valid_;
	}
};

MemoryBlock::MemoryBlock (void)
:	p_link(0)
,	valid_(true)
{ }

MemoryBlock::~MemoryBlock (void)
{
	valid_ = false;
	release();
}

void MemoryBlock::release (void)
{
	while ( p_link )
	{
		BlockLink * q = p_link;
		assert( q->valid() );
		p_link = p_link->next();
		delete q;
	}
}

void * MemoryBlock::allocate (int bytes)
{
	void * p = new char[bytes];
	test_alloc(p);
	p_link = new BlockLink(p,p_link);
	test_alloc( p_link );
	assert( p_link->valid() );
	return p;
}
