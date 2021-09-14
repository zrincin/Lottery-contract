import Web3 from 'web3';

let web3;

// Modern DAPP browsers
if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    window.ethereum.enable();
} 

// Legacy DAPP browsers
else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
    }

else {
    window.alert(`
    Metamask not detected. 
    You need to install it in order to be able to use the DAPP! 
    (https://metamask.io/index.html)` )
}


export default web3;

