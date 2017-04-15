const assert = require('assert');

// Helper to sanitize file paths.

module.exports = (path) => {
    assert.equal(typeof path, 'string');
    assert.ok(path.length > 0);
    return path.replace(/[^A-Za-z0-9\.]/g, '_');
};
