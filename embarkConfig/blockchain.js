let secret = {};
try {
  secret = require('../.secret.json');
} catch(err) {
  console.dir("warning: .secret.json file not found; this is only needed to deploy to testnet or livenet etc..");
}

module.exports = {
  // applies to all environments
  default: {
    enabled: true,
    client: "geth",
    accounts: [
      {
        nodeAccounts: true,
        numAddresses: 1,
        password: "embarkConfig/development/devpassword"
      }
    ]
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run` and `embark blockchain`
  development: {
    clientConfig: {
      miningMode: 'dev'
    },
    accounts: [
      {
        nodeAccounts: true,
        numAddresses: 1,
        password: "embarkConfig/development/devpassword"
      }
    ]
  },

  // merges with the settings in default
  // used with "embark run privatenet" and/or "embark blockchain privatenet"
  privatenet: {
    accounts: [
      {
        nodeAccounts: true,
        password: "embarkConfig/privatenet/password"
      }
    ],
    clientConfig: {
      datadir: ".embark/privatenet/datadir",
      miningMode: 'auto',
      genesisBlock: "embarkConfig/privatenet/genesis.json", // Genesis block to initiate on first creation of a development node
    }
  },

    // merges with the settings in default
  // used with "embark run privatparityenet" and/or "embark blockchain privateparitynet"
  privateparitynet: {
    client: "parity",
    genesisBlock: "embarkConfig/privatenet/genesis-parity.json",
    datadir: ".embark/privatenet/datadir",
    miningMode: 'off'
  },

  // merges with the settings in default
  // used with "embark run testnet" and/or "embark blockchain testnet"
  testnet: {
    networkType: "testnet",
    syncMode: "light",
    accounts: [
      {
        nodeAccounts: true,
        numAddresses: "1",
        password: "embarkConfig/testnet/password"
      }
    ]
  },

  rinkeby: {
    networkType: "rinkeby",
    syncMode: "light",
    accounts: [
      {
        nodeAccounts: true,
        numAddresses: "1",
        password: "embarkConfig/testnet/password"
      }
    ]
  },

  rinkebyInfura: {
    endpoint: `https://rinkeby.infura.io/${secret.infuraKey}`,
    accounts: [
      {
        mnemonic: secret.mnemonic,
        numAddresses: 10
      }
    ]
  },

  // merges with the settings in default
  // used with "embark run livenet" and/or "embark blockchain livenet"
  livenet: {
    networkType: "livenet",
    syncMode: "light",
    endpoint: "https://mainnet.infura.io/v3/a2687d7078ff46d3b5f3f58cb97d3e44",
    accounts: [
      {
        privateKeyFile: secret.privateKeyFile,
        password: secret.password
      }
    ],
  }

  // you can name an environment with specific settings and then specify with
  // "embark run custom_name" or "embark blockchain custom_name"
  //custom_name: {
  //}
};
