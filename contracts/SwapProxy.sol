pragma solidity ^0.4.18;

import "./LiquidPledging.sol";
import "./common/SafeToken.sol";
import "./common/Pausable.sol";
import "./IKyberSwap.sol";

contract SwapProxy is Pausable, SafeToken {
    address public ETH;
    address public vault;
    uint public maxSlippage;
    KyberNetworkProxy public kyberProxy;
    LiquidPledging public liquidPledging;

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
      uint slippageRate;
      (minConversionRate, slippageRate) = kyberProxy.getExpectedRate(srcToken, destToken, srcQty);
      require(minConversionRate > 0);
      return slippageRate;
    }

    /**
     * @notice Funds a project in desired token using ETH
     * @dev Requires a msg.value
     * @param idReceiver receiver of donation
     * @param token token to convert from ETH
     */
    function fundWithETH(uint64 idReceiver, address token) public payable whenNotPaused {
      require(msg.value > 0);
      uint expectedRate;
      uint slippageRate;
      (expectedRate, slippageRate) = kyberProxy.getExpectedRate(ETH, token, msg.value);
      require(expectedRate > 0);
      uint slippagePercent = 100 - ((slippageRate * 100) / expectedRate);
      require(slippagePercent <= maxSlippage);
      uint maxDestinationAmount = (slippageRate / (10**18)) * msg.value;
      uint amount = kyberProxy.trade.value(msg.value)(ETH, msg.value, token, address(this), maxDestinationAmount, slippageRate, vault);
      require(amount > 0);
      require(EIP20Interface(token).approve(address(liquidPledging), amount));
      liquidPledging.addGiverAndDonate(idReceiver, token, amount);
    }

    /**
     * @notice Funds a project in desired token using an ERC20 Token
     * @param idReceiver receiver of donation
     * @param token token to convert from
     * @param amount being sent
     * @param receiverToken token being converted to
     */
    function fundWithToken(uint64 idReceiver, address token, uint amount, address receiverToken) public whenNotPaused {
      Error err = doTransferIn(token, msg.sender, amount);
      require(err == Error.NO_ERROR);

      uint expectedRate;
      uint slippageRate;
      (expectedRate, slippageRate) = kyberProxy.getExpectedRate(token, receiverToken, amount);
      require(expectedRate > 0);
      uint slippagePercent = (slippageRate * 100) / expectedRate;
      require(slippagePercent <= maxSlippage);
      require(EIP20Interface(token).approve(address(kyberProxy), 0));
      require(EIP20Interface(token).approve(address(kyberProxy), amount));

      uint maxDestinationAmount = (slippageRate / (10**18)) * amount;
      uint receiverAmount = kyberProxy.trade(token, amount, receiverToken, address(this), maxDestinationAmount, slippageRate, vault);
      require(receiverAmount > 0);
      require(EIP20Interface(token).approve(address(liquidPledging), receiverAmount));
      liquidPledging.addGiverAndDonate(idReceiver, receiverToken, receiverAmount);
    }

    function transferOut(address asset, address to, uint amount) public onlyOwner {
      Error err = doTransferOut(asset, to, amount);
      require(err == Error.NO_ERROR);
    }

    function() payable external {}
}
