

#ifndef PRIMARY_ADAPTER_T_H
#define PRIMARY_ADAPTER_T_H

#ifndef DOUBLE_HASHABLE_H
# include "DoubleHashable.h"
#endif

template<class I_, class C_>
class PrimaryAdapterT :
public DoubleHashable
{

public:

	typedef I_ id_type;
	typedef C_ concrete_type;

public:

	PrimaryAdapterT (const id_type id)
		: id_(id)
	{ }

	virtual ~PrimaryAdapterT (void)
	{ }

	virtual const DoubleHashable::Key getKey1(void) const
		{ return id_; }

	virtual const DoubleHashable::Key getKey2(void) const = 0; // override

	virtual const bool hasConcrete (void) const = 0; // override

	id_type getID (void) const { return id_; }

#ifndef FIX
	virtual const concrete_type & getConcrete (void) const
		{ return * new concrete_type(); }

	virtual concrete_type & getConcrete (void)
		{ return * new concrete_type(); }
#endif

	virtual const typename concrete_type::Key & getConcreteKey (void) = 0; // override

	static const DoubleHashable::Key IdToKey (const id_type id)
		{ return id; }

private:

	PrimaryAdapterT & operator= (const PrimaryAdapterT &);
	PrimaryAdapterT (PrimaryAdapterT &);
	PrimaryAdapterT (void); // thou shalt NOT

	const id_type id_;

};

#endif // PRIMARY_ADAPTER_T_H
