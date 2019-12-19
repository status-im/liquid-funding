const rinkebyBase = {
  enabled: true,
  dappConnection: [
    '$WEB3'
  ],
  strategy: 'explicit',
  tracking: './testnet.chains.json',
  deploy: {
    LPVault: {
    },
    LiquidPledging: {
    },
    RecoveryVault: {
    },
    LPFactory: {
      address: '0x968F0a788F29b5B33296C61cEB34F1c40C55e52c',
      args: {
        _vaultBase: '$LPVault',
        _lpBase: '$LiquidPledging',
      }
    },
    // contracts for testing
    StandardToken: {
    },
    SNT: {
      // minting address: 0xEdEB948dE35C6ac414359f97329fc0b4be70d3f1
    },
    Kernel: {
      address: "0x49798b01e64295497624645B77004614CC5160c3",
      file: "@aragon/os/contracts/kernel/Kernel.sol"
    },
    ACL: {
      file: "@aragon/os/contracts/acl/ACL.sol"
    }
  }
};

module.exports = {
  // default applies to all environments
  default: {
    dappConnection: [
      '$EMBARK',
      '$WEB3', // uses pre existing web3 object if available (e.g in Mist)
      'ws://localhost:8546',
      'http://localhost:8545',
    ],

    dappAutoEnable: false,

    gas: 'auto',

    // Strategy for the deployment of the contracts:
    // - implicit will try to deploy all the contracts located inside the contracts directory
    //            or the directory configured for the location of the contracts. This is default one
    //            when not specified
    // - explicit will only attempt to deploy the contracts that are explicity specified inside the
    //            contracts section.
    strategy: 'explicit',

    deploy: {},
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run`
  development: {
    dappConnection: [
      '$EMBARK',
      '$WEB3', // uses pre existing web3 object if available (e.g in Mist)
      'ws://localhost:8546',
      'http://localhost:8545',
    ],
    strategy: 'explicit',
    deploy: {
      LPVault: {},
      LiquidPledging: {
        instanceOf: 'LiquidPledgingMock'
      },
      RecoveryVault: {},
      LPFactory: {
        args: ['$LPVault', '$LiquidPledging'],
      },
      // contracts for testing
      StandardToken: {},
      Kernel: {
        file: "@aragon/os/contracts/kernel/Kernel.sol"
      },
      ACL: {
        file: "@aragon/os/contracts/acl/ACL.sol"
      },
      cDAI: {
        instanceOf: "StandardToken",
        address: '0xf5dce57282a584d2746faf1593d3121fcac444dc'
      },
      cETH: {
        instanceOf: "StandardToken",
        address: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5'
      },
      SNT: {
        address: '0x744d70FDBE2Ba4CF95131626614a1763DF805B9E'
      }
    },

    // afterDeploy: [
    //   `console.log('we deployed here')`,
    //   `embark.logger.info('we deployed here')`,
    //   `LPFactory.methods.newLP("$accounts[0]", "$RecoveryVault").send({ gas: 7000000 })
    //     .then(({ events }) => {
    //       console.log('method ran');
    //       global.LiquidPledging = new web3.eth.Contract(LiquidPledgingMockAbi, events.DeployLiquidPledging.returnValues.liquidPledging);
    //       global.LPVault = new web3.eth.Contract(LPVaultAbi, events.DeployVault.returnValues.vault);
    //       StandardToken.methods.mint(accounts[1], web3.utils.toWei('1000')).send();
    //       StandardToken.methods.approve(global.LiquidPledging.address, '0xFFFFFFFFFFFFFFFF').send({ from: "$accounts[1]" });
    //   })`
    // .catch(err => console.log('error', err))
    // `,
    // `web3.eth.getAccounts().then(accounts => {
    //   return LPFactory.methods.newLP(accounts[0], "$RecoveryVault").send({ gas: 7000000 })
    //     .then(({ events }) => {
    //       global.LiquidPledging = new web3.eth.Contract(LiquidPledgingMockAbi, events.DeployLiquidPledging.returnValues.liquidPledging);
    //       global.LPVault = new web3.eth.Contract(LPVaultAbi, events.DeployVault.returnValues.vault);
    //       StandardToken.methods.mint(accounts[1], web3.utils.toWei('1000')).send();
    //       StandardToken.methods.approve(global.LiquidPledging.address, '0xFFFFFFFFFFFFFFFF').send({ from: accounts[1] });
    //     });
    // })
    // .catch(err => console.log('error', err))
    // `,
    // ],
  },

  // merges with the settings in default
  // used with "embark run privatenet"
  privatenet: {},

  // merges with the settings in default
  // used with "embark run testnet"
  testnet: {},

  // merges with the settings in default
  // used with "embark run ropsten"
  ropsten: {
    tracking: './ropsten.chains.json',
    strategy: 'explicit',
    deploy: {
      DAI: {
        instanceOf: "StandardToken",
        address: "0xaD6D458402F60fD3Bd25163575031ACDce07538D"
      },
      LPVault: {},
      LiquidPledging: {},
      StandardToken: {},
      SNT: {
        address: "0x8aA3672a99C489E5Dc5dfDb40e607bE49970cbF7"
      },
      SwapProxy: {
        address: "0x73d3731F9c21e21785Ec5677CC39AB4880CAaFe9",
        args: [
          '$LiquidPledging',
          "0x818E6FECD516Ecc3849DAf6845e3EC868087B755",
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          "0x0000000000000000000000000000000000000000",
          20
        ]
      }
    },
    afterDeploy: async (dependencies) => {
      await dependencies.contracts.LiquidPledging.methods.initialize(dependencies.contracts.LPVault.options.address).send({from: dependencies.web3.eth.defaultAccount, gas: 1000000});
      await dependencies.contracts.LPVault.methods.initialize(dependencies.contracts.LiquidPledging.options.address).send({from: dependencies.web3.eth.defaultAccount, gas: 1000000});
      await dependencies.contracts.LPVault.methods.setAutopay(true).send({from: dependencies.web3.eth.defaultAccount, gas: 1000000});
    },
    dappConnection: ["$WEB3"]
  },

  rinkeby: rinkebyBase,
  rinkebyInfura: rinkebyBase,
  // merges with the settings in default
  // used with "embark run livenet"
  livenet: {
    enabled: true,
    dappConnection: [
      '$WEB3'
    ],
    strategy: 'explicit',
    tracking: './livenet.chains.json',
    deploy: {
      LPVault: {},
      LiquidPledging: {
        address: '0x603A7249E64b8cACe20ffb55926145346ca42A97',
      },
      DAI: {
        instanceOf: "StandardToken",
        address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
      },
      cDAI: {
        instanceOf: "StandardToken",
        address: '0xf5dce57282a584d2746faf1593d3121fcac444dc'
      },
      cETH: {
        instanceOf: "StandardToken",
        address: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5'
      },
      SNT: {
        address: '0x744d70FDBE2Ba4CF95131626614a1763DF805B9E'
      },
      SwapProxy: {
        address: "0x10E1FC179cd37CFed5B77AC4b65D17f0B789360E",
        args: [
          '$LiquidPledging',
          "0x818E6FECD516Ecc3849DAf6845e3EC868087B755",
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          "0x0000000000000000000000000000000000000000",
          20
        ]
      }
    },
    afterDeploy: async (dependencies) => {
      // await dependencies.contracts.LiquidPledging.methods.initialize(dependencies.contracts.LPVault.options.address).send({from: dependencies.web3.eth.defaultAccount, gas: 1000000});
      // await dependencies.contracts.LPVault.methods.initialize(dependencies.contracts.LiquidPledging.options.address).send({from: dependencies.web3.eth.defaultAccount, gas: 1000000});
      // await dependencies.contracts.LPVault.methods.setAutopay(true).send({from: dependencies.web3.eth.defaultAccount, gas: 1000000});
    }
  },

  // you can name an environment with specific settings and then specify with
  // "embark run custom_name" or "embark blockchain custom_name"
  //custom_name: {
  //}
}
