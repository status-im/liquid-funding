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
        args: {
          _vaultBase: '$LPVault',
          _lpBase: '$LiquidPledging',
        },
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

  rinkeby: {
    dappConnection: [
      '$WEB3', // uses pre existing web3 object if available (e.g in Mist)
      'ws://localhost:8546',
      'http://localhost:8545',
    ],
    strategy: 'explicit',
    contracts: {
      LPVault: {
        address: "0x6732c6Cd8DA14C7E065b51689410058815657427",
      },
      LiquidPledging: {
        address: "0x314159265dd8dbb310642f98f50c066173c1259b"
      },
      RecoveryVault: {
        address: "0xeF6daB6A9b17379DBaAF4d6d54C96F8Bf3c945e5"
      },
      LPFactory: {
        address: "0x4d3d8aB9b20B6D95215Bc7Df0426c9DFcB0D61fb"
      //  args: {
      //    _vaultBase: '$LPVault',
      //    _lpBase: '$LiquidPledging',
        },
      },
      // contracts for testing
    StandardToken: {
      address: "0x6732c6Cd8DA14C7E065b51689410058815657427"
    },
    Kernel: {
      address: "0x31CE00C0F0126cff08E91A83271f4e1a3624Fa6A",
      file: "@aragon/os/contracts/kernel/Kernel.sol"
      },
    ACL: {
      address: "0x74dDdbaFD8001Ae38971c23c6dc250A82aD37552",
      file: "@aragon/os/contracts/acl/ACL.sol"
      }
    }
  },

  // merges with the settings in default
  // used with "embark run livenet"
  livenet: {},

  // you can name an environment with specific settings and then specify with
  // "embark run custom_name" or "embark blockchain custom_name"
  //custom_name: {
  //}
};
