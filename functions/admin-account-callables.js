"use strict";
const { onCall } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { REGION } = require("./lib/constants");
const { createAccountActions } = require("./lib/admin-account-actions");
const options = {region:REGION,timeoutSeconds:300,memory:"256MiB",enforceAppCheck:false};
const service = () => createAccountActions({db:getFirestore(),auth:getAuth()});
module.exports = {
  previewAdminAccountAction:onCall(options,request=>service().preview(request)),
  executeAdminAccountAction:onCall(options,request=>service().execute(request))
};
