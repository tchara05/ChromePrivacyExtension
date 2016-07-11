var fs = require('fs'), esprima = require('esprima');

if (process.argv.length < 3) {
    console.log('Usage: analyze.js file.js');
    process.exit(1);
}

var filename = process.argv[2];
console.log('Reading ' + filename);
var code = fs.readFileSync(filename);

function analyzeCode(code) {

    var ast = esprima.parse(code);
    var functionsStats = {};
    var addStatsEntry = function (funcName) { //2
        if (!functionsStats[funcName]) {
            functionsStats[funcName] = {calls: 0, declarations: 0};
        }
    };

    traverse(ast, function (node) { //3
        if (node.type === 'FunctionDeclaration') {
            addStatsEntry(node.id.name); //4
            functionsStats[node.id.name].declarations++;
        } else if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
            addStatsEntry(node.callee.name);
            functionsStats[node.callee.name].calls++; //5
        }
    });

    processResults(functionsStats);
}


function traverse(node, func) {
    func(node);//1
    for (var key in node) { //2
        if (node.hasOwnProperty(key)) { //3
            var child = node[key];
            if (typeof child === 'object' && child !== null) { //
                if (Array.isArray(child)) {
                    child.forEach(function (node) { //5
                        traverse(node, func);
                    });
                } else {
                    traverse(child, func); //6
                }
            }
        }
    }
}

function processResults(results) {
    for (var name in results) {
        if (results.hasOwnProperty(name)) {
            var stats = results[name];
            if (stats.declarations === 0) {
                console.log('Function', name, 'undeclared');
            } else if (stats.declarations > 1) {
                console.log('Function', name, 'decalred multiple times');
            } else if (stats.calls === 0) {
                console.log('Function', name, 'declared but not called');
            }
        }
    }
}

analyzeCode(code);
console.log('Done');