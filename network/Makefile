init:
	geth --identity "AttackHelicopter" \
			--rpc \
			--rpcapi "eth,net,web3" \
			--rpcport "8545" \
			--rpcaddr "127.0.0.1" \
			--rpccorsdomain "*" \
			--datadir "data" \
			--networkid 808 \
			--nat "any" \
			init CustomGenesis.json

gimme:
	geth --identity "AttackHelicopter" \
	     --rpc \
	     --rpcapi "eth,net,web3" \
	     --rpcport "8545" \
	     --rpcaddr "127.0.0.1" \
	     --rpccorsdomain "*" \
	     --datadir "data" \
	     --networkid 808 \
	     --nat "any" \
			 account new

console:
	geth --identity "AttackHelicopter" \
	     --rpc \
	     --rpcapi "eth,net,web3,personal" \
	     --rpcport "8545" \
	     --rpcaddr "127.0.0.1" \
	     --rpccorsdomain "*" \
	     --datadir "data" \
	     --networkid 808 \
	     --nat "any" \
			 --etherbase "${ETHER_ADDRESS}" \
			 --mine
	     console
