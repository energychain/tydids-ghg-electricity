exports.requestCertification = async function(zip,wh_consumption,verbose) {
    const tydids = require("tydids");
    const axios = require("axios");
    if(verbose) console.log("tydids-ghg-electricity.requestCertification("+zip+","+wh_consumption+")");
    
    if( (""+zip).length !== 5 ) { throw new Exception("Invalid zipcode (zip)") }
    if( isNaN(wh_consumption) ) { throw new Exception("wh_consumption is not a number") }

    const wallet = tydids.wallet(process.env.PRIVATE_KEY);
    const intermediateRequest = {
        zip:zip,
        wh:wh_consumption * 1
    };
    if(verbose) console.log("- create intermediate request");

    const intermediate = (await axios.post("https://api.corrently.io/v2.0/tydids/bucket/gsi",intermediateRequest)).data;
    if(verbose) console.log("- received intermediate:",{issuer:intermediate.payload._iss,intermediateId:intermediate.intermediate,hash:intermediate.hash});

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

    if(await wallet.tydids.verifyMessage(certificate.owner.payload,certificate.owner.signature) !== issuer) throw "Certificate invalid Signer - owner";
    if(certificate.owner.payload.owner !== wallet.address) throw "Invalid consensus - owner not wallet";
    if(verbose) console.log("- Validated Consensus: Owner");

    if(await wallet.tydids.verifyMessage(certificate.hash.payload,certificate.hash.signature) !== issuer) throw "Certificate invalid Signer - hash";
    if(certificate.hash.payload !== hash) throw "Invalid hash - not as calcultated";
    if(verbose) console.log("- Validated Consensus: Hash");

    for (const [key, value] of Object.entries(certificate.presentations)) {
        if(await wallet.tydids.verifyMessage(value.payload,value.signature) !== issuer) throw "Certificate invalid Signer - Presentation:"+key;
        if(verbose) console.log("- Validated Consensus: Presentation "+key);
    }
    return certificate;
}