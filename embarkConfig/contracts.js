let secret = {};
try {
  secret = require('../.secret.json');
} catch(err) {
  console.dir("warning: .secret.json file not found; this is only needed to deploy to testnet or livenet etc..");
}

const rinkebyBase = {
  enabled: true,
  dappConnection: [
    '$WEB3'
  ],
  strategy: 'explicit',
  tracking: './testnet.chains.json',
  contracts: {
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
    // Blockchain node to deploy the contracts
    deployment: {
      host: 'localhost', // Host of the blockchain node
      port: 8545, // Port of the blockchain node
      type: 'rpc', // Type of connection (ws or rpc),
      // Accounts to use instead of the default account to populate your wallet
      /*,accounts: [
        {
          privateKey: "your_private_key",
          balance: "5 ether"  // You can set the balance of the account in the dev environment
                              // Balances are in Wei, but you can specify the unit with its name
        },
        {
          privateKeyFile: "path/to/file", // Either a keystore or a list of keys, separated by , or ;
          password: "passwordForTheKeystore" // Needed to decrypt the keystore file
        },
        {
          mnemonic: "12 word mnemonic",
          addressIndex: "0", // Optionnal. The index to start getting the address
          numAddresses: "1", // Optionnal. The number of addresses to get
          hdpath: "m/44'/60'/0'/0/" // Optionnal. HD derivation path
        }
      ]*/
    },
    // order of connections the dapp should connect to
    dappConnection: [
      '$WEB3', // uses pre existing web3 object if available (e.g in Mist)
      'ws://localhost:8546',
      'http://localhost:8545',
    ],

    gas: 'auto',

    // Strategy for the deployment of the contracts:
    // - implicit will try to deploy all the contracts located inside the contracts directory
    //            or the directory configured for the location of the contracts. This is default one
    //            when not specified
    // - explicit will only attempt to deploy the contracts that are explicity specified inside the
    //            contracts section.
    strategy: 'explicit',

    contracts: {},
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run`
  development: {
    dappConnection: [
      '$WEB3', // uses pre existing web3 object if available (e.g in Mist)
      'ws://localhost:8546',
      'http://localhost:8545',
    ],
    strategy: 'explicit',
    contracts: {
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
    deployment: {
      accounts: [
        {
          mnemonic: secret.mnemonic,
          hdpath: secret.hdpath || "m/44'/1'/0'/0/",
          numAddresses: "10"
        }
      ],
      host: `ropsten.infura.io/${secret.infuraKey}`,
      port: false,
      protocol: 'https',
      type: "rpc"
    },
    strategy: 'explicit',
    contracts: {
      LPVault: {},
      LiquidPledging: {},
      StandardToken: {}
    },
    afterDeploy: async (dependencies) => {
      await dependencies.contracts.LiquidPledging.methods.initialize(dependencies.contracts.LPVault.options.address).send({from: dependencies.web3.eth.defaultAccount, gas: 1000000});
      await dependencies.contracts.LPVault.methods.initialize(dependencies.contracts.LiquidPledging.options.address).send({from: dependencies.web3.eth.defaultAccount, gas: 1000000});
    },
    dappConnection: ["$WEB3"]
  },
  

  rinkeby: rinkebyBase,
  rinkebyInfura: Object.assign({}, rinkebyBase, {
    deployment: {
      accounts: [
        {
          mnemonic: secret.mnemonic,
          hdpath: secret.hdpath || "m/44'/1'/0'/0/",
          numAddresses: "10"
        }
      ],
      host: `rinkeby.infura.io/${secret.infuraKey}`,
      port: false,
      protocol: 'https',
      type: "rpc"
    }
  }),
  // merges with the settings in default
  // used with "embark run livenet"
  livenet: {
    enabled: true,
    dappConnection: [
      '$WEB3'
    ],
    strategy: 'explicit',
    tracking: './livenet.chains.json',
    contracts: {
      LPVault: {},
      LiquidPledging: {
        address: '0x603A7249E64b8cACe20ffb55926145346ca42A97',
      },
      SNT: {
        address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
      }
    },
    afterDeploy: async (dependencies) => {
      await dependencies.contracts.LiquidPledging.methods.initialize(dependencies.contracts.LPVault.options.address).send({from: dependencies.web3.eth.defaultAccount, gas: 1000000});
      await dependencies.contracts.LPVault.methods.initialize(dependencies.contracts.LiquidPledging.options.address).send({from: dependencies.web3.eth.defaultAccount, gas: 1000000});
    }
  },

  // you can name an environment with specific settings and then specify with
  // "embark run custom_name" or "embark blockchain custom_name"
  //custom_name: {
  //}
}
