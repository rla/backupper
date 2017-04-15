const assert = require('assert');
const promisify = require('./promisify');
const request = promisify(require('request'));
const log = require('./log');
const delay = require('./delay');

const apiRequest = async (key, url) => {
    assert.equal(typeof key, 'string');
    assert.equal(typeof url, 'string');
    log.info(`GitHub API call to ${url}.`);
    const response = await request({
        url: url,
        json: true,
        headers: { 'User-Agent': 'Node.js request package' },
        auth: {
            user: key,
            pass: 'x-oauth-basic'
        }
    });
    assert.equal(response.statusCode, 200);
    return response.body;
};

// Fetches the list of organizations that
// the user belongs to.

const orgsRequest = async (key, page = 1) => {
    assert.equal(typeof key, 'string');
    assert.equal(typeof page, 'number');
    const url = `https://api.github.com/user/orgs?page=${page}&per_page=50`;
    const body = await apiRequest(key, url);
    return body.map((org) => org.login);
};

// Fetches the list of organization repos.

const orgReposRequest = async (key, org, page = 1) => {
    assert.equal(typeof key, 'string');
    assert.equal(typeof org, 'string');
    assert.equal(typeof page, 'number');
    const url = `https://api.github.com/orgs/${encodeURIComponent(org)}/repos?page=${page}&per_page=50`;
    const body = await apiRequest(key, url);
    return body.map((org) => org.ssh_url);
};

// Fetches the list of own repositories.

const ownReposRequest = async (key, page = 1) => {
    assert.equal(typeof key, 'string');
    assert.equal(typeof page, 'number');
    const url = `https://api.github.com/user/repos?page=${page}&per_page=50`;
    const body = await apiRequest(key, url);
    return body.map((org) => org.ssh_url);
};

// Fetches all pages of the given operation.

const allPages = async (fn, ...args) => {
    const results = [];
    let page = 1;
    while (true) {
        const actualArgs = [...args, page];
        const pageResults = await fn.apply(null, actualArgs);
        if (pageResults.length === 0) {
            return results;
        } else {
            for (const item of pageResults) {
                results.push(item);
            }
        }
        page += 1;
        await delay(2000);
    }
};

// Fetches list of all user repos under
// all organizations.

exports.repos = async (key) => {
    const orgs = await allPages(orgsRequest, key);
    const repos = await allPages(ownReposRequest, key);
    for (const org of orgs) {
        const orgRepos = await allPages(orgReposRequest, key, org);
        for (const repo of orgRepos) {
            repos.push(repo);
        }
    }
    return repos;
};
