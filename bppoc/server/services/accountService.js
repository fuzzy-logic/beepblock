const mongoose = require('mongoose');
const ethereumService = require('./ethereumService');

const Profile = mongoose.model('profile');

async function getTransactions(user) {
  return Profile.findOne({ userId: user.id })
    .then((profile) => {
      if (!profile || !profile.accountAddress) {
        throw new Error('Could not locate user profile');
      }
      return ethereumService.getAccount(profile.accountAddress)
        .then((account) => {
          return account.getTransactions().then((transactions) => {
            const accountAddresses = [...new Set(
              transactions.map(t => t.to).concat(transactions.map(t => t.from))
            )];
            console.log(accountAddresses);
            var optRegexp = [];
            accountAddresses.forEach(function(opt){
              optRegexp.push(  new RegExp(opt, "i") );
            });
            return Profile.find({
              "accountAddress": { $in: optRegexp }
            }).then((profiles) => {
              console.log(profiles);
              return transactions.map(t => {
                console.log(t);
                return {
                  id: t.hash,
                  from: profiles.filter(p => p.accountAddress.toLowerCase() == t.from.toLowerCase())[0].accountName,
                  to: profiles.filter(p => p.accountAddress.toLowerCase() == t.to.toLowerCase())[0].accountName,
                  amount: t.value
                }
              });
            });
          });
        });
    });
}

module.exports = { getTransactions };