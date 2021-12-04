module.exports = {
    CHAIN_ID_LIST: [
        {
            chainId: '0x38', 
            chainName: 'BSC',
            rpcUrls: ['https://bsc-dataseed4.ninicoin.io/'],
            buyUrl: 'https://pancakeswap.finance/swap?inputCurrency=0x76076880e1ebbce597e6e15c47386cd34de4930f',
            blockExplorerUrls: ['https://bscscan.com'],
            nativeCurrency:  {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
                },
        }, {
            chainId: '0xa86a',
            chainName: 'Avalanche',
            rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
            buyUrl: 'https://app.pangolin.exchange/#/swap?inputCurrency=0x76076880e1ebbce597e6e15c47386cd34de4930f',
            blockExplorerUrls: ['https://cchain.explorer.avax.network/'],
            nativeCurrency:  {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18
                },
        }
    ],
    TOKEN_DETAIL: {
      address: '0x76076880e1ebbce597e6e15c47386cd34de4930f',
      symbol: "OPUS",
      decimals: 18,
      image: 'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/0x76076880e1EBBcE597e6E15c47386cd34de4930F/logo.png'
    },
    ERC20_ABI: [
        {
            "inputs": [
                {
                    "internalType":"address",
                    "name":"account",
                    "type":"address"
                }
            ],
            "name":"balanceOf",
            "outputs": [
                {
                    "internalType":"uint256",
                    "name":"",
                    "type":"uint256"
                }
            ],
            "stateMutability":"view",
            "type":"function"
        },
        {
          "type":"function",
          "stateMutability":"view",
          "payable":false,
          "outputs":[
            {
              "type":"uint256",
              "name":"",
              "internalType":"uint256"
            }
          ],
          "name":"totalSupply",
          "inputs":[],
          "constant":true
        },
        {
          "constant":true,
          "inputs":[
            {
              "internalType":"address",
              "name":"owner",
              "type":"address"
            },{
              "internalType":"address",
              "name":"spender",
              "type":"address"
            }
          ],
          "name":"allowance",
          "outputs":[
            {
              "internalType":"uint256",
              "name":"",
              "type":"uint256"
            }
          ],
          "payable":false,
          "stateMutability":"view",
          "type":"function"
        },
        {
          "constant":false,
          "inputs":[
            {
              "internalType":"address",
              "name":"spender",
              "type":"address"
            },{
              "internalType":"uint256",
              "name":"amount",
              "type":"uint256"
            }
          ],
          "name":"approve",
          "outputs":[
            {
              "internalType":"bool",
              "name":"",
              "type":"bool"
            }
          ],
          "payable":false,
          "stateMutability":"nonpayable",
          "type":"function"
        }
    ],
    ROUTER_ABI: [
        {
          "type":"function",
          "stateMutability":"view",
          "outputs":[
            {
              "type":"uint256[]",
              "name":"amounts",
              "internalType":"uint256[]"
            }
          ],
          "name":"getAmountsOut",
          "inputs":[
            {
              "type":"uint256",
              "name":"amountIn",
              "internalType":"uint256"
            },{
              "type":"address[]",
              "name":"path",
              "internalType":"address[]"
            }
          ]
        }
    ],
    FARMING_ABI: [
      {
        "inputs":[
          {
            "internalType":"uint256",
            "name":"","type":"uint256"
          },{
            "internalType":"address",
            "name":"",
            "type":"address"
          }
        ],
        "name":"userInfo",
        "outputs":[
          {
            "internalType":"uint256",
            "name":"amount",
            "type":"uint256"
          },{
            "internalType":"uint256",
            "name":"rewardDebt",
            "type":"uint256"
          }
        ],
        "stateMutability":"view",
        "type":"function"
      }, {
        "inputs":[
          {
            "internalType":"uint256",
            "name":"_pid",
            "type":"uint256"
          },{
            "internalType":"address",
            "name":"_user",
            "type":"address"
          }
        ],
        "name":"pendingOpus",
        "outputs":[
          {
            "internalType":"uint256",
            "name":"",
            "type":"uint256"
          }
        ],
        "stateMutability":"view",
        "type":"function"
      }, {
        "inputs":[
          {
            "internalType":"uint256",
            "name":"_pid",
            "type":"uint256"
          },{
            "internalType":"uint256",
            "name":"_amount",
            "type":"uint256"
          },{
            "internalType":"address",
            "name":"_referrer",
            "type":"address"
          }
        ],
        "name":"deposit",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
      }, {
        "inputs":[
          {
            "internalType":"uint256",
            "name":"_pid",
            "type":"uint256"
          },{
            "internalType":"uint256",
            "name":"_amount",
            "type":"uint256"
          }
        ],
        "name":"withdraw",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
      },{
        "inputs":
        [
          {
            "internalType":"uint256",
            "name":"_amount",
            "type":"uint256"
          }
        ],
        "name":"enterStaking",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
      }, {
        "inputs":[
          {
            "internalType":"uint256",
            "name":"_amount",
            "type":"uint256"
          }
        ],
        "name":"leaveStaking",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
      }
    ]
}