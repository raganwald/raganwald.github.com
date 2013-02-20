

#ifndef HASH_UTIL_H
#define HASH_UTIL_H

#include <string>

class HashUtil
{
public:
	typedef long Key;

	static const Key StringToKey (const std::string &);

	static const Key StringToKey (const char *);

};

inline const HashUtil::Key HashUtil::StringToKey (const std::string & str_ref)
{
	return HashUtil::StringToKey(str_ref.c_str());
}

#endif // HASH_UTIL_H