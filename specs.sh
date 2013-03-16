#!/bin/sh

cd ./_posts
coffee --output ../_specs --compile *.coffee.md

cd ../_specs
jasmine-node *.js --matchall


