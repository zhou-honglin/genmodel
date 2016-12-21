#! /usr/bin/env node
var fs = require('fs');
var template = require('art-template');

var today = new Date();
var argv = require('yargs')
    .option('i', {
        alias: 'inPath',
        demand: true,
        describe: 'the json source file path',
        type: 'string'
    }).option('o', {
        alias: 'outPath',
        demand: false,
        describe: 'the model output file path',
        type: 'string'
    }).option('n', {
        alias: 'name',
        demand: true,
        describe: 'the name of the root model,will apply prefix or suffix for root model and all nest models if exists',
        type: 'string'
    }).option('p', {
        alias: 'class_prefix',
        demand: false,
        describe: 'the model className of prefix',
        type: 'string'
    }).option('s', {
        alias: 'class_suffix',
        demand: false,
        describe: 'the model className of suffix',
        type: 'string'
    }).option('k', {
        alias: 'key',
        demand: false,
        describe: 'the key for json object to generate model',
        type: 'string'
    }).option('m', {
        alias: 'class_map',
        demand: false,
        describe: 'the map className for the nest object or array; use -m ".products=product",also apply prefix or suffix',
        type: 'string'
    }).option('t', {
        alias: 'template',
        demand: false,
        describe: 'the template for modelClass,use "iPadModel" or "YYModel" or custom template path,default "iPadModel"',
        type: 'string'
    }).usage('Usage: genmodel [options]')
    .example('genmodel -n User -p JD -s Model -i xxx.json -o ~/Desktop', 'generate JDUserModel with the xxx.json to Desktop')
    .help('h')
    .alias('h', 'help')
    .epilog(`copyright ${today.getFullYear()}`)
    .argv;

function validString(str) {
    return str ? str : "";
}
var fistLetterUpper = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
function _modelName(name) {
    return modelPrefix + fistLetterUpper(name) + modelfSuffix;
}

var class2type = {};
"Boolean Number String Function Array Date RegExp Object Error".split(" ").forEach(function (e, i) { class2type["[object " + e + "]"] = e.toLowerCase(); });
function _typeof(obj) { if (obj == null) { return String(obj); } return typeof obj === "object" || typeof obj === "function" ? class2type[Object.prototype.toString.call(obj)] || "object" : typeof obj; }

function getTypeStr(key, value) {
    var type = _typeof(value);
    var name = _modelName(key) + '*';
    switch (type) {
        case 'string':
            return 'NSString*';
        case 'number':
            return Number.isInteger(value) ? 'NSInteger' : 'float';
        case 'boolean':
            return 'BOOL';
        case 'object':
            return name;
        case 'array':
            return `NSArray<${name}>*`;
        case 'null':
            return 'NSObject*';
        default:
            break;
    }
}

function getQualifierStr(value) {
    var type = _typeof(value);
    if (type == 'string') return 'copy';
    if (['number', 'boolean'].indexOf(type) != -1) return 'assign';
    return 'strong';
}
Object.prototype.renameProperty = function (oldName, newName) {
    // Do nothing if the names are the same
    if (oldName == newName) {
        return this;
    }
    // Check for the old property name to avoid a ReferenceError in strict mode.
    if (this.hasOwnProperty(oldName)) {
        this[newName] = this[oldName];
        delete this[oldName];
    }
    return this;
};

var modelPrefix = validString(argv.class_prefix);
var modelfSuffix = validString(argv.class_suffix);
var modelKey = argv.key;
var finalName = _modelName(argv.name);
var mapString = argv.class_map;
var re1 = /\s/;
var re2 = /,$/;
if (mapString&&re1.test(mapString)) {
    console.error('error: --class_map format error,no any space');
    process.exit(1);
}

if (mapString&&re2.test(mapString)) {
    console.error('error: --class_map format error,no "," in the end');
    process.exit(1);
}

var outPath = argv.outPath;
var realOutPath = outPath ? outPath + '/' + finalName : (process.cwd() + '/' + finalName);
if (fs.existsSync(realOutPath)) {
    console.error('error:%s already exists', finalName);
    process.exit(1);
}
fs.mkdirSync(realOutPath, 0777);

var inPath = argv.inPath;
var text = fs.readFileSync(inPath, 'utf8');
var obj;
try {
    obj = JSON.parse(text);
} catch (err) {
    console.error('error:json file format error');
    console.error(err);
    process.exit(1);
}
if (modelKey) {
    obj = obj[modelKey];
}
if (!(_typeof(obj) == 'object')) {
    console.error('error:json object root object not a Dictionary');
    process.exit(1);
}

if (mapString) {

    var strings = mapString.split(',');
    var jsonMaps = strings.map(function (entry) {
        let arr = entry.split('=');
        let oldKey = arr[0];
        let oldKeyArr = oldKey.replace(/^\./, '').split('.');
        let obj = { 'oldKeys': oldKeyArr, 'newKey': arr[1] };
        return obj;
    });

    jsonMaps.sort(function (a, b) {
        let adeep = a.oldKeys.length;
        let bdeep = b.oldKeys.length;
        return bdeep - adeep;
    });

    jsonMaps.forEach(function (entry) {
        let oldKeys = entry.oldKeys
        var _obj = obj;
        for (let i = 0; i < (oldKeys.length - 1); i++) {
            _obj = _obj[oldKeys[i]];
        }
        let oldKey = oldKeys[oldKeys.length - 1];
        let newKey = `${oldKey}__map__${entry.newKey}`;
        _obj.renameProperty(oldKey, newKey);
    });
}

// template.config('base', __dirname);
template.config('extname', '.tpl');

template.helper('_modelName', function (name) {
    return _modelName(name);
});

function genModel(name, obj) {
    var properties = [];
    var classNames = [];
    var existsArray = false;
    for (let key of Object.keys(obj)) {
        var value = obj[key];
        var tmpArr = key.split('__map__');
        var originalKey = tmpArr[0];
        var mapKey = tmpArr.length > 1 ? tmpArr[1] : tmpArr[0];
        var property = {
            'key': originalKey,
            'mapKey': mapKey,
            'value': value,
            'type': getTypeStr(mapKey, value),
            'jstype': _typeof(value),
            'qualifier': getQualifierStr(value)
        };
        if (_typeof(value) == 'object') {
            property.className = _modelName(mapKey);
            classNames.push(property.className);
            genModel(property.className, value);
        } else if (_typeof(value) == 'array') {
            existsArray = true;
            property.className = _modelName(mapKey);
            classNames.push(property.className);
            genModel(property.className, value[0]);
        }

        properties.push(property);
    }
    var data = {
        'name': name,
        'properties': properties,
        'classNames': classNames,
        'date': today.toLocaleDateString(),
        'year': today.getFullYear(),
        'existsArray':existsArray
    };

    var vtemplate = argv.template?argv.template:'iPadModel';
    var templatePath;
    if(["iPadModel","YYModel"].indexOf(vtemplate) != -1){
        templatePath = __dirname + `/tpl/${vtemplate}/${vtemplate}`;
    }else{
        templatePath = vtemplate;
    }
    var hContent = template(templatePath + 'H', data).replace(/^\s*[\r\n]/gm, "");
    var mContent = template(templatePath + 'M', data).replace(/^\s*[\r\n]/gm, "");
    var hFile = realOutPath + '/' + name + '.h';
    var mFile = realOutPath + '/' + name + '.m';
    fs.writeFileSync(hFile, hContent, { 'flag': 'w+' });
    fs.writeFileSync(mFile, mContent, { 'flag': 'w+' });
}

genModel(finalName, obj);


