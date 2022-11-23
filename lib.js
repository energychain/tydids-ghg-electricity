const validateSignature = async function(certificate,hash,options) {
    const tydids = require("tydids");
    const wallet = tydids.wallet(options.privateKey);
    let verbose = false;
    if(typeof options.verbose !== 'undefined') verbose = options.verbose 
    if(await wallet.tydids.verifyMessage(certificate.owner.payload,certificate.owner.signature) !== options.issuer) throw "Certificate invalid Signer - owner";
    if(certificate.owner.payload.owner !== options.owner) throw "Invalid consensus - owner not wallet";
    if(verbose) console.log("- Validated Consensus: Owner");

    if(await wallet.tydids.verifyMessage(certificate.hash.payload,certificate.hash.signature) !== options.issuer) throw "Certificate invalid Signer - hash";
    if(certificate.hash.payload !== hash) throw "Invalid hash - not as calcultated";
    if(verbose) console.log("- Validated Consensus: Hash");

    for (const [key, value] of Object.entries(certificate.presentations)) {
        if(await wallet.tydids.verifyMessage(value.payload,value.signature) !== options.issuer) throw "Certificate invalid Signer - Presentation:"+key;
        if(verbose) console.log("- Validated Consensus: Presentation "+key);
    }
    return true;
}

const validateNFT = async function(certificate,options) {
    let verbose = false;
    if(typeof options.verbose !== 'undefined') verbose = options.verbose;

    const ABI = [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "approved",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "ApprovalForAll",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "previousOwner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "renounceOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "uri",
                    "type": "string"
                }
            ],
            "name": "safeMint",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes",
                    "name": "data",
                    "type": "bytes"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "setApprovalForAll",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "getApproved",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                }
            ],
            "name": "isApprovedForAll",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ownerOf",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes4",
                    "name": "interfaceId",
                    "type": "bytes4"
                }
            ],
            "name": "supportsInterface",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "tokenURI",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];
    const ethers = require("ethers");
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.tydids.com/");
    const wallet = new ethers.Wallet(options.privateKey,provider);
    const instance = new ethers.Contract("0x60c1c9B26D655531294b84642939E9625E9B8fB4", ABI, wallet);
    const ownerId = await instance.ownerOf(certificate.nft.payload.tokenId);
    const tokenURI = await instance.tokenURI(certificate.nft.payload.tokenId);
    if(ownerId !== wallet.address) throw "NFT Owner is not this ID";
    if(tokenURI !== certificate.did.payload.url) throw "NFT is not DID";

    if(verbose) {
        console.log("tokenId:",certificate.nft.payload.tokenId);
        console.log("onwerId:",ownerId);
        console.log("tokenURI:",tokenURI);
    }
}

exports.validateSignature = async function(certificate,hash,options) {
    return await validateSignature(certificate,hash,options);
}


exports.requestCertification = async function(zip,wh_consumption,options) {

    const tydids = require("tydids");
    const axios = require("axios");
    let verbose = false;

    if((typeof options == 'undefined')||(options == null)) {
        options = {};
    }

    if(typeof options.verbose !== 'undefined') verbose = options.verbose;

    if(verbose) console.log("tydids-ghg-electricity.requestCertification("+zip+","+wh_consumption+")");
    
    if( (""+zip).length !== 5 ) { throw "Invalid zipcode (zip)" }
    if( isNaN(wh_consumption) ) { throw "wh_consumption is not a number" }

    const wallet = tydids.wallet(options.privateKey);

    const intermediateRequest = {
        zip:zip,
        wh:wh_consumption * 1
    };
    if(verbose) console.log("- create intermediate request");

    const intermediate = (await axios.post("https://api.corrently.io/v2.0/tydids/bucket/gsi",intermediateRequest)).data;
    if(verbose) console.log("- received intermediate:",{issuer:intermediate.payload._iss,intermediateId:intermediate.intermediate,hash:intermediate.hash});
    if(verbose) console.log(intermediate);
    
    const issuer = intermediate.payload._iss;

    if(intermediate.payload.consumption.actual !== wh_consumption) throw "Intermediate has different consumption";
    if(intermediate.payload.location.zip !== zip) throw "Intermediate has different location (zip)";
    if(verbose) console.log("- validated input values in intermediate");
    
    const hash = wallet.tydids.hashMessage(intermediate.payload);
    if(hash !== intermediate.hash) throw "Hash received does not match calculated hash";

    if(verbose) console.log("- validated hash for payload");

    if(verbose) console.log("- sign intermediate with my ID",wallet.address);
   
    const certRequest = {
        signature:await wallet.signMessage(hash),
        owner:wallet.address,
        hash:hash
    }

    if(verbose) console.log("- request certificate");
    const certificate = (await axios.post("https://api.corrently.io/v2.0/tydids/sign",certRequest)).data;
    if(verbose) console.log("- received certificate",certificate);

    validateSignature(certificate, hash,{
        issuer:issuer,
        privateKey:wallet.privateKey,
        owner:wallet.address,
        verbose:verbose
    })
    validateNFT(certificate,options);
    return certificate;
}
