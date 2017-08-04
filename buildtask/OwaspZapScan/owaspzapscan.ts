import task = require('vsts-task-lib');
import path = require('path');
import ZapClient = require('zaproxy');

task.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    
}

run();