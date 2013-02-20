
#ifndef PRIMARY_KEY_ADAPTER_T_H
#define PRIMARY_KEY_ADAPTER_T_H

#ifndef PRIMARY_ADAPTER_T_H
# include "PrimaryAdapterT.h"
#endif

#ifndef HASH_UTIL_H
# include "HashUtil.h"
#endif

template<class I_, class C_>
class PrimaryKeyAdapterT :
public IdAdapterT<I_,C_>
{

public:
	typedef typename C_::Key key_type;

	PrimaryKeyAdapterT (const id_type id, const typename C_::Key & k) // copies what you give it
		: IdAdapterT<I_,C_>(id)
		, key_(k)
	{ }

	~PrimaryKeyAdapterT (void)
	{ }


	virtual const DoubleHashable::Key getKey2(void) const { return HashUtil::StringToKey(key_); }

	const bool hasConcrete (void) const { return false; }

	virtual const typename C_::Key & getConcreteKey (void) { return key_; }

private:

	PrimaryKeyAdapterT & operator= (const PrimaryKeyAdapterT &);
	PrimaryKeyAdapterT (PrimaryKeyAdapterT &);
	PrimaryKeyAdapterT (void); // thou shalt NOT

	typename C_::Key key_;
};

#endif // PRIMARY_KEY_ADAPTER_T_H
