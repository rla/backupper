const fs = require('fs');
const path = require('path');
const assert = require('assert');
const S3 = require('aws-sdk/clients/s3');
const log = require('./log');

// Uploads the file into the backups bucket.

exports.upload = async (file, bucket, accessKeyId, secretAccessKey) => {
    assert.equal(typeof file, 'string');
    assert.equal(typeof bucket, 'string');
    assert.equal(typeof accessKeyId, 'string');
    assert.equal(typeof secretAccessKey, 'string');
    const key = path.basename(file);
    log.info(`Uploading file ${file} to S3 bucket ${bucket}.`);
    return new Promise((resolve, reject) => {
        const s3 = new S3({
            apiVersion: '2006-03-01',
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey
        });
        const params = {
            Bucket: bucket,
            Key: key,
            Body: fs.createReadStream(file)
        };
        const options = { partSize: 10 * 1024 * 1024, queueSize: 1 };
        const manager = s3.upload(params, options, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
        manager.on('httpUploadProgress', (arg) => {
            log.info(`Uploaded ${Math.floor(arg.loaded / 1024 / 1024)}MB.`);
        });
    });
};
