const CrossBorderPayment = artifacts.require('CrossBorderPayment');

module.exports = function(deployer) {
    deployer.deploy(CrossBorderPayment)
}