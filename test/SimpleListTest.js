


var SimpleList = artifacts.require("./SimpleList.sol");

contract('SimpleList', function() {
  it("should fucking work", async function() {
      const instance = await SimpleList.deployed();
      const initialCount = (await instance.getEntityCount());
      console.log('Initial size: ' + initialCount);
      assert.equal(0, initialCount, "Initial size should be 0");

      await instance.newEntity("bob", 12);

      const newCount = await instance.getEntityCount();
      console.log('Size after first insert: ' + newCount);
      assert.equal(1, newCount, "Size after first insert should be 1");

      await instance.newEntity("alice", 13);

      const newNewCount = await instance.getEntityCount();
      console.log('Size after second insert: ' + newNewCount);
      assert.equal(2, newNewCount, "Size after secound insert should be 2");

      const secondItemName = await instance.getEntityName(1);
      console.log("Name of second item: " + secondItemName);
      assert.equal("alice", secondItemName, "Second item name should be 'alice'");
    });
});
