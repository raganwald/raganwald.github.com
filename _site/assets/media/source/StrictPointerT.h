

#ifndef STRICT_POINTER_T_H
#define STRICT_POINTER_T_H

#include <assert.h>
#include <new.h>

template<class Cp_> struct StrictPointerRef {
	Cp_ * ptr_;
	StrictPointerRef(Cp_ * p) : ptr_(p) {}
};

template<class C_>
class StrictPointerT
{
public:
	typedef C_ element_type;

	explicit StrictPointerT(element_type * p_element = 0) //_THROW0()
		: p_element_(p_element)
		, valid_(true)
	{ }

	StrictPointerT(StrictPointerT & that) //_THROW0()
		: p_element_(that.release())
		, valid_(true)
	{ }

	StrictPointerT & operator= (StrictPointerT & that) //_THROW0()
	{
		if ( this != &that ) {
			this->~StrictPointerT();
			new(this) StrictPointerT(that);
		}
		return (*this);
	}

	~StrictPointerT() { delete p_element_;}

	element_type * operator-> (void) const //_THROW0()
	{
		assert( valid_ && p_element_ );
		return get();
	}

	element_type & operator* (void) const //_THROW0()
	{
		assert( valid_ && p_element_ );
		return get();
	}
	
	// Naked!
	element_type * get() const //_THROW0()
	{
		return (p_element_);
	}
	
	element_type * release() //_THROW0()
	{
		assert( valid_ );

		element_type * ret = p_element_;
		valid_ = false;
		p_element_ = 0;
		return ret;
	}

	operator bool() const
	{
		assert( valid_ );
		return p_element_ != 0;
	}

	bool valid (void) const { return valid_; }

public:
	StrictPointerT(StrictPointerRef<C_> ref)
		: p_element_(ref.ptr_)
		, valid_(true) {}

	StrictPointerT & operator=(StrictPointerRef<C_> ref) {
		if (ref.ptr_ != this->get()) {
			delete p_element_;
			p_element_ = ref.ptr_;
			valid_ = true;
		};
		return *this;
	}

	template <class Cp_> operator StrictPointerRef<Cp_>() 
	{
		return StrictPointerRef<Cp_>(this->release());
	}

	template <class Cp_> operator StrictPointerT<Cp_>()
	{
		return StrictPointerT<Cp_>(this->release());
	}

private:

	element_type * p_element_;
	bool valid_;

};

#endif // STRICT_POINTER_T_H
