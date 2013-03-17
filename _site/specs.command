#!/bin/sh

cd ~/Dropbox/sites/raganwald.github.com/_posts/enchanted-forest
coffee --output ~/Dropbox/sites/raganwald.github.com/_specs --compile *.coffee.md
jasmine-node ~/Dropbox/sites/raganwald.github.com/_specs --matchall


