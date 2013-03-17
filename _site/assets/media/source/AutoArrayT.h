
#ifndef AUTO_ARRAY_T_H
#define AUTO_ARRAY_T_H

#include <assert.h>
#include <new.h>

template<class Cp_> struct AutoArrayRef {
	Cp_ * ptr_;
	AutoArrayRef(Cp_ * p) : ptr_(p) {}
};

template<class C_>
class AutoArrayT
{
public:
	typedef C_ element_type;

	explicit AutoArrayT(element_type * p_element) //_THROW0()
		: array_(p_element)
	{
		assert( array_ );
	}

	AutoArrayT(AutoArrayT & that) //_THROW0()
		: array_(that.release())
	{ }

	AutoArrayT & operator= (AutoArrayT & that) //_THROW0()
	{
		if ( this != &that ) {
			this->~AutoArrayT();
			new(this) AutoArrayT(that);
		}
		return (*this);
	}

	~AutoArrayT() {
		delete[] array_;
	}

	void setAll (const int v, const int el)
	{
		memset(array_, v, el * sizeof(element_type));
	}

	element_type & operator[] (int index)
	{
		assert( array_ );
		return array_[index];
	}

	element_type & operator[] (int index) const
	{
		assert( array_ );
		return array_[index];
	}
	
	// Naked!
	element_type * get() const //_THROW0()
	{
		return (array_);
	}
	
	element_type * release() //_THROW0()
	{
		assert( array_ );

		element_type * ret = array_;
		array_ = 0;
		return ret;
	}

	operator bool() const
	{
		return array_ != 0;
	}

	bool valid (void) const { return array_ != 0; }

public:
	AutoArrayT(AutoArrayRef<C_> ref)
		: array_(ref.ptr_) {}

	AutoArrayT & operator=(AutoArrayRef<C_> ref) {
		if (ref.ptr_ != this->get()) {
			delete[] array_;
			array_ = ref.ptr_;
		};
		return *this;
	}

	template <class Cp_> operator AutoArrayRef<Cp_>() 
	{
		return AutoArrayRef<Cp_>(this->release());
	}

	template <class Cp_> operator AutoArrayT<Cp_>()
	{
		return AutoArrayT<Cp_>(this->release());
	}

private:

	element_type * array_;

};

#endif // AUTO_ARRAY_T_H
