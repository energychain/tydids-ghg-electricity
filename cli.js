const lib = require("./lib");

const app = async function() {
    lib.requestCertification('69256',5000,true);
}
app();