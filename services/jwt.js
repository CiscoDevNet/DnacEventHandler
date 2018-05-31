/**
 * Copyright 2018 Cisco Systems
 *
 * Author: haihxiao@cisco.com
 **/

 const jwt = require("jsonwebtoken");
 const config = require('../config');
 const AWS = require('aws-sdk');

 const JWTInternalExpirationSeconds = 24 * 60 * 60; // a day
 const IS_OFFLINE = process.env.IS_OFFLINE;

 function initStandardClaims(claims, provider, expirySeconds) {
     let now = Math.floor(new Date().getTime() / 1000);
     claims.iat = now;
     claims.exp = now + expirySeconds;
     claims.iss = provider || 'internal';
 }

 function getJwtSecret() {
     return new Promise(function(resolve, reject) {
         if (!config.vault.jwtSecretValue) {
             if(IS_OFFLINE) {
                 config.vault.jwtSecretValue = process.env.JWT_SECRET;
                 resolve(config.vault.jwtSecretValue);
             } else {
                 const kms = new AWS.KMS();
                 kms.decrypt({
                     CiphertextBlob: Buffer(process.env.JWT_SECRET, 'base64')
                 }).promise().then(data => {
                     config.vault.jwtSecretValue = data.Plaintext.toString('ascii');
                     resolve(config.vault.jwtSecretValue);
                 }).catch(e => {
                     console.error("failed to load jwt secret from kms: " + e.message);
                     reject(e);
                 });
             }
         } else {
             resolve(config.vault.jwtSecretValue);
         }
     });
 }

 async function getUserToken(userClaims, provider) {
     initStandardClaims(userClaims, provider, JWTInternalExpirationSeconds);
     let secret = await getJwtSecret();
     return jwt.sign(userClaims, new Buffer(secret, 'base64'));
 }

 const defaultPerms = [
     {
         "company": "*",
         "domain": "*",
         "role": "*",
         "user": "*"
     }
 ];

 const defaultAbac = {
     'read': defaultPerms,
     'write': defaultPerms,
     'delete': defaultPerms
 };

 module.exports = {
     verify: async function(token) {
         let secret = await getJwtSecret();
         return jwt.verify(token, new Buffer(secret, 'base64'));
     },
     getDefaultPerms: function() {
         return defaultPerms;
     },
     getDefaultAbac: function() {
         return defaultAbac;
     },
     getUserToken: getUserToken,
     getSudoToken: async function() {
         return getUserToken({
             "perms": defaultPerms
         });
     }
};
