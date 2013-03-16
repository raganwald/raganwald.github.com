#!/bin/sh

cd ./_posts/enchanted-forest
coffee --output ../../_specs --compile *.coffee.md

cd ../../_specs
jasmine-node *.js --matchall

cd ..


