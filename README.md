- - -

<p align="center">
<a href="https://gitter.im/status-im/liquid-funding"><img src="https://badges.gitter.im/Join Chat.svg" alt="Gitter"></a>
</p>

- - -

Welcome to the code for the liquid-funding dapp which uses the liquidpledging contracts by Giveth, a new way to distribute donated ether while keeping ownership in the hands of the original donor.

## Table of content

- [Getting Started](#getting-started)
    - [Install](#install)
    - [Requirements](#requirements)

### Install
1) `npm install`
2) `npm -g install embark`
3) For development `embark run` or `embark run {network}`
  * There is an issue with the dev environment because of the contract size
  * Using `embark run rinkeby` works
    * You will need to either have a synced Geth node with Rinkeby (automatically started by Embark)
    * Add a `deployment` section to the contract config in `embarkConfig/contracts.js` ([example using Infura](https://embark.status.im/docs/contracts_deployment.html#Deploying-to-Infura))
4) To start the CRA pipeline `npm run start`

### Requirements
[NodeJS](https://nodejs.org/) (v8.4.0 or higher) 
[npm](https://www.npmjs.com/) (5.4.1 or higher)
[Embark](https://embark.status.im/) (v4.0.0 or higher)

## Deployment Details
| Contract                   | Ropsten Address                            | Mainnet Address                            |
| ---------------------------|------------------------------------------- | ------------------------------------------ |
| LiquidPledging             | 0x2cEfae94eB05737827D245E9cb6c1ca3C2A0Fe52 | 0x603A7249E64b8cACe20ffb55926145346ca42A97 |
| LPVault                    | 0x8B860ed047f832294AE249042F17bC0E4C629274 | 0x1DC9F06caf1558287b1b8Afc8a152a739D1F3d38 |
| SwapProxy                  | 0x73d3731F9c21e21785Ec5677CC39AB4880CAaFe9 | 0x10E1FC179cd37CFed5B77AC4b65D17f0B789360E |
