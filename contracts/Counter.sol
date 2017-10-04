pragma solidity ^0.4.13;

// This contract demonstrates a simple non-constant (transactional) function
// increment() takes no parameters and merely increments the "iteration" value.

contract Counter {
    uint count;

    function Counter() {
        count = 0;
    }

    function increment(uint i) {
        count += i;
    }

    function getCount() constant returns (uint) {
        return count;
    }

}
