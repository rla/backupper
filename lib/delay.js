const assert = require('assert');

// Helper to add delay between operations.

module.exports = (time) => {
    assert.equal(typeof time, 'number');
    return new Promise((resolve) => setTimeout(resolve, time));
};
