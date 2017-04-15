const git = require('./git');
const ssh = require('./ssh');
const rsync = require('./rsync');
const log = require('../log');

const tools = { git, ssh, rsync };

// Reports the versions of the tools.
// Fails when a tool is not installed
// or cannot be executed.

exports.report = async () => {
    for (const tool in tools) {
        const version = await tools[tool].version();
        log.info(`${tool.toUpperCase()} version: ${version}.`);
    }
    log.info('Preparing ssh.sh wrapper script.');
    return ssh.prepare();
};
