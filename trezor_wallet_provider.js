const TrezorProvider = require("./index.js");
const ProviderEngine = require("web3-provider-engine");
const FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js');
const Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
const Web3 = require("web3");

function TrezorWalletProvider(provider_url, address_index = 0) {

  console.info('Please plug the Trezor and enter your pin in the popped up window. (If the Trezor is already plugged, reconnect it.)');

  this.engine = new ProviderEngine();
    
  const trezorProvider = new TrezorProvider("m/44'/60'/0'/0/" + address_index);

  let intervalHandle = null;
  new Promise((resolve, reject) => {
    intervalHandle = setInterval(() => {
      new Promise(resolve => {trezorProvider.getAccounts(resolve)})
        .then((data) => {
          if (data == null) {
            resolve(data);
            clearInterval(intervalHandle);
          }
        }).catch(reject)
    }, 1000)
  }).then((data) => {
  	this.engine.addProvider(trezorProvider);
    this.engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(provider_url)));
    this.engine.addProvider(new FiltersSubprovider());  	
    this.engine.start();
  }).catch((err) => { 
  	console.error(err);
  	process.exit();
  });
}

TrezorWalletProvider.prototype.sendAsync = function() {
  this.engine.sendAsync.apply(this.engine, arguments);
};

TrezorWalletProvider.prototype.send = function() {
  return this.engine.send.apply(this.engine, arguments);
};

TrezorWalletProvider.prototype.getAddress = function() {
  return this.address;
};

var instance;

module.exports = (function () {
  return {
    getInstance: function (provider_url, address_index) {
      if ( !instance ) {
        instance = new TrezorWalletProvider(provider_url, address_index);
      }
      return instance;
    }
  };
})();
