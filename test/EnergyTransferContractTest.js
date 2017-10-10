const EnergyTransferContract = artifacts.require("./EnergyTransferContract.sol");

contract('Energy Transfer Contract', (accounts) => {
  const gridAccount = accounts[0];
  const buyerAccount = accounts[1];
  const sellerAccount = accounts[2];

  it("Should record grid prices", async () => {
      const instance = await EnergyTransferContract.deployed();

      await instance.publishGridPrice(10, 20, 5, { from: gridAccount });
      const gridPrice = await instance.getCurrentGridPrice(gridAccount);

      assert.equal(gridPrice[0], 10, "Buy price should be 10");
      assert.equal(gridPrice[1], 20, "Sell price should be 20");
      assert.equal(gridPrice[2], 5, "Minimum margin should be 5");
    });

    it("Should replace an existing grid price with a new grid price", async () => {
        const instance = await EnergyTransferContract.deployed();

        await instance.publishGridPrice(10, 20, 5, { from: gridAccount });
        await instance.publishGridPrice(15, 25, 5, { from: gridAccount });
        const gridPrice = await instance.getCurrentGridPrice(gridAccount);

        assert.equal(gridPrice[0], 15, "Buy price should be 15");
        assert.equal(gridPrice[1], 25, "Sell price should be 25");
        assert.equal(gridPrice[2], 5, "Minimum margin should be 5");
      });
});
