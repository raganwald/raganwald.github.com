
#include "HashUtil.h"

#ifndef string
# include <string>
#endif

#include <limits.h>

using namespace std;

#if  LONG_MAX == 2147483647L

static const int MASQUE = sizeof(long) - 1;

const HashUtil::Key HashUtil::StringToKey (const char * p_char)
{
	long hash = 1299827; // the 100,000th prime. why not :-)
	int i = 0;
	while ( p_char[i] ) {
		hash += p_char[i] << (8 * (i & MASQUE));
		i++;
	}
	return hash;
}

#else // wierd, not 2^n

static const int INT_BYTES = sizeof(int);

#error write a general purpose StringToKey!!!

#endif // ( sizeof(int) == 2 | sizeof(int) == 4 | sizeof(int) == 8 | sizeof(int) == 16 )