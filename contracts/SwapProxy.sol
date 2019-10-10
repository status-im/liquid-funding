pragma solidity ^0.4.18;

import "./LiquidPledging.sol";


//   On mainnet extract the values from here: https://developer.kyber.network/docs/Environments-Mainnet/
//   On ropsten extract the values from here: https://developer.kyber.network/docs/Environments-Ropsten/

contract KyberNetworkProxy {
    function getExpectedRate(address src, address dest, uint srcQty) public pure returns(uint expectedRate, uint slippageRate);
    function trade(address src, uint srcAmount, address dest, address destAddress, uint  maxDestAmount, uint minConversionRate, address walletId) public payable returns(uint);
    function swapTokenToToken(address src, uint srcAmount, address dest, uint minConversionRate) public pure;
    function swapEtherToToken(address token, uint minConversionRate) public payable returns(uint);
}

interface ERC20Token {
    function transfer(address _to, uint256 _value) external returns (bool success);
    function approve(address _spender, uint256 _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);
    function balanceOf(address _owner) external view returns (uint256 balance);
    function allowance(address _owner, address _spender) external view returns (uint256 remaining);
    function totalSupply() external view returns (uint256 supply);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

contract SwapProxy {
    address public ETH;
    KyberNetworkProxy public kyberProxy;
    LiquidPledging public liquidPledging;
    address public vault;
    uint public maxSlippage;

    /**
     * @param _liquidPledging LiquidPledging contract address
     * @param _kyberProxy Kyber Network Proxy address
     * @param _ETH Kyber ETH address
     * @param _vault address that receives swap fees
     * @param _maxSlippage most slippage as a percentage
     */
    function SwapProxy(address _liquidPledging, address _kyberProxy, address _ETH, address _vault, uint _maxSlippage) public {
      require(_maxSlippage < 100);
      if (_vault == address(0)){
        _vault = address(this);
      }
      liquidPledging = LiquidPledging(_liquidPledging);
      kyberProxy = KyberNetworkProxy(_kyberProxy);
      ETH = _ETH;
      vault = _vault;
      maxSlippage = _maxSlippage;
    }

    /**
     * @notice Gets the conversion rate for the destToken given the srcQty.
     * @param srcToken source token contract address
     * @param srcQty amount of source tokens
     * @param destToken destination token contract address
     * @return exchange rate
   */
    function getConversionRates(address srcToken, uint srcQty, address destToken) public view returns (uint exchangeRate)
    {
      if(srcToken == address(0)){
          srcToken = ETH;
      }

      uint minConversionRate;
      (minConversionRate, ) = kyberProxy.getExpectedRate(srcToken, destToken, srcQty);

      return minConversionRate;
    }

    /**
     * @notice Funds a project in desired token using ETH
     * @dev Requires a msg.value
     * @param idReceiver receiver of donation
     * @param token token to convert from ETH
     */
    function fundWithETH(uint64 idReceiver, address token) public payable {
      require(msg.value > 0);

      uint expectedRate;
      uint slippageRate;
      (expectedRate, slippageRate) = kyberProxy.getExpectedRate(ETH, token, msg.value);
      require(expectedRate > 0);
      uint slippagePercent = (slippageRate * 100) / expectedRate;
      require(slippagePercent <= maxSlippage);
      uint maxDestinationAmount = (slippageRate / (10**18)) * msg.value;
      uint amount = kyberProxy.trade.value(msg.value)(ETH, msg.value, token, address(this), maxDestinationAmount, slippageRate, vault);
      require(amount > 0);

      ERC20Token(token).approve(address(liquidPledging), amount);
      liquidPledging.addGiverAndDonate(idReceiver, token, amount);
    }

    /**
     * @notice Funds a project in desired token using an ERC20 Token
     * @param idReceiver receiver of donation
     * @param token token to convert from
     * @param amount being sent
     * @param receiverToken token being converted to
     */
    function fundWithToken(uint64 idReceiver, address token, uint amount, address receiverToken) public {
      require(ERC20Token(token).transferFrom(msg.sender, address(this), amount));

      uint expectedRate;
      uint slippageRate;
      (expectedRate, slippageRate) = kyberProxy.getExpectedRate(token, receiverToken, amount);
      require(expectedRate > 0);
      uint slippagePercent = (slippageRate * 100) / expectedRate;
      require(slippagePercent <= maxSlippage);
      require(ERC20Token(token).approve(address(kyberProxy), 0));
      require(ERC20Token(token).approve(address(kyberProxy), amount));

      uint maxDestinationAmount = (slippageRate / (10**18)) * amount;
      uint receiverAmount = kyberProxy.trade(token, amount, receiverToken, address(this), maxDestinationAmount, slippageRate, vault);
      require(receiverAmount > 0);

      ERC20Token(token).approve(address(liquidPledging), receiverAmount);
      liquidPledging.addGiverAndDonate(idReceiver, receiverToken, receiverAmount);
    }

}
