pragma solidity ^0.4.18;

//   On mainnet extract the values from here: https://developer.kyber.network/docs/Environments-Mainnet/
//   On ropsten extract the values from here: https://developer.kyber.network/docs/Environments-Ropsten/

contract KyberNetworkProxy {
  function getExpectedRate(address src, address dest, uint srcQty) public pure returns(uint expectedRate, uint slippageRate);
  function trade(address src, uint srcAmount, address dest, address destAddress, uint  maxDestAmount, uint minConversionRate, address walletId) public payable returns(uint);
  function swapTokenToToken(address src, uint srcAmount, address dest, uint minConversionRate) public pure;
  function swapEtherToToken(address token, uint minConversionRate) public payable returns(uint);
}
