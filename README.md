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
