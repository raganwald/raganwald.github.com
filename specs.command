#!/bin/sh

rm -f ~/Dropbox/sites/raganwald.github.com/_specs/*.js
if [ $@ > 0 ]; then
  coffee --output ~/Dropbox/sites/raganwald.github.com/_specs --compile $1 $2 $3 $4 $5 $6 $7 $8 $9
else
  coffee --output ~/Dropbox/sites/raganwald.github.com/_specs --compile ~/Dropbox/sites/raganwald.github.com/_posts/enchanted-forest/*.coffee.md
fi
jasmine-node ~/Dropbox/sites/raganwald.github.com/_specs --matchall


