deps:
	if [ -z `which node123` ] ; then echo "install nodejs https://nodejs.org/en/download/" ; fi
	echo "now run make configure"

configure:
	npm install ethereumjs-testrpc
	npm install solc
	npm install truffle

clean:
	rm -rf ./build/*

test:
	testrpc
	truffle test
