
#ifndef MEMORY_BLOCK_H
#define MEMORY_BLOCK_H

class BlockLink;

class MemoryBlock
{

private:
	BlockLink * p_link;
	bool valid_;
	MemoryBlock (const MemoryBlock &); // not implemented
	MemoryBlock & operator= (const MemoryBlock &); // not implemented

public:
	MemoryBlock (void);
	~MemoryBlock (void);

	void * allocate (int); // allocate block specifying bytes
	void release (void); // free ALL blocks of memory!
	bool valid (void) const { return valid_; }
};

#endif // MEMORY_BLOCK_H