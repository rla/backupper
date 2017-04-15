const path = require('path');
const assert = require('assert');
const Git = require('./git');
const github = require('../github');
const delay = require('../delay');

module.exports = class GitHub {

    constructor(key) {
        assert.equal(typeof key, 'string',
            'GitHub API key must be set.');
        this.key = key;
    }

    // Runs the backup operation.

    async execute(siteBase, pkey) {
        assert.equal(typeof siteBase, 'string');
        assert.equal(typeof pkey, 'string');
        const repos = await github.repos(this.key);
        const gits = repos.map((repo) => new Git(repo, 22));
        for (const git of gits) {
            await git.execute(siteBase, pkey);
            await delay(2000);
        }
    }
};
