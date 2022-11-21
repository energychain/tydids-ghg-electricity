#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();
const lib = require("./lib");


program
  .name('tydids-ghg-certificate')
  .description('TyDIDs based Greenhouse Gas Certificates.')
  .version('1.0.0');

program.command('requestCertificate')
  .description('Get a new signed certificate for electricity consumption (Germany only!)')
  .argument('<zip>', 'Zipcode (Postleitzahl) of electricity consumption location')
  .argument('<wh>', 'Watt-hours electricity from public grid (mains)')
  .option('-pk, --privateKey <string>', 'Private Key. If omitted a random wallet key will be generated (for testing only!)', '')
  .option('-v, --verbose', 'Verbose output')
  .option('-o, --output <directory>', 'Writes certificate in directory on filesystem (JSON)')
  .action(async (zip, wh, command) => {
    if(command.privateKey.length !== 66) delete command.privateKey;
    if(typeof command.verbose == 'undefined') command.verbose = false;

    const certificate = await lib.requestCertification(zip,wh * 1,{
      verbose:command.verbose,
      privateKey:command.privateKey
    });
    
    if(typeof command.output !== 'undefined') {
        const fs = require("fs");
        const basefile = command.output + "/"+certificate.did.payload;

        fs.writeFileSync(basefile+".json",JSON.stringify(certificate));
        for (const [key, value] of Object.entries(certificate.presentations)) {
          fs.writeFileSync(basefile+"."+key+".json",JSON.stringify(value));
        }
    } else {
      console.log(certificate);
    }
  });

  program.command('validateCertificate')
  .description('Validates given Certificate JSON')
  .argument('<certificate>', 'JSON File with certificate')
  .argument('<hash>', 'Watt-hours electricity from public grid (mains)')
  .argument('<issuer>', 'Required Issuer')
  .argument('<owner>', 'Required Owner')
  .action(async (certificate, hash, issuer,owner) => {
    const fs = require("fs");

    certificate = JSON.parse(fs.readFileSync(certificate));

    let options = {
      issuer:issuer,
      owner:owner
    }

    const validation = await lib.validateSignature(certificate,hash,options);
    console.log(validation);
  });  
program.parse();
