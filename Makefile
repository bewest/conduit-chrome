BROWSERIFY=./node_modules/.bin/browserify

all: backend

backend: lib
	$(BROWSERIFY) -x serialport -x bunyan \
     -r buffer  \
     -r comlink2-uart/index:comlink2 \
     -r ./lib/index:lib \
     -r jquery-browserify:jquery \
     -o backend/vendor/lib.js

.PHONY: backend
