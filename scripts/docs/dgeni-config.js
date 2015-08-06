var Package = require('dgeni').Package;
var jsdocPackage = require('dgeni-packages/jsdoc');
var nunjucksPackage = require('dgeni-packages/nunjucks');
var typescriptPackage = require('./typescript-package');
var linksPackage = require('./links-package');
var gitPackage = require('dgeni-packages/git');
var path = require('path');

// Define the dgeni package for generating the docs
module.exports = new Package('ionic-v2-docs', [jsdocPackage, nunjucksPackage, typescriptPackage, linksPackage, gitPackage])

.config(function(log) {
  log.level = 'silly' //'warn';
})

.config(function(renderDocsProcessor, versionInfo) {
  renderDocsProcessor.extraData.versionInfo = versionInfo;
})

//configure file reading
.config(function(readFilesProcessor, inlineTagProcessor, readTypeScriptModules) {

  // Don't run unwanted processors
  readFilesProcessor.$enabled = false; // We are not using the normal file reading processor
  // inlineTagProcessor.$enabled = false; // We are not actually processing the inline link tags

  // jsdocFileReader.defaultPattern = /\.(j|t)s$/;
  // readFilesProcessor.fileReaders = [jsdocFileReader];
  readFilesProcessor.basePath = path.resolve(__dirname, '../..');
  readTypeScriptModules.basePath = path.resolve(path.resolve(__dirname, '../..'));
  // readFilesProcessor.sourceFiles = [
  //   { include: 'ionic/**/*.ts', basePath: 'ionic' }
  // ]
  readTypeScriptModules.sourceFiles = [
    'ionic/ionic.ts'
  ];
  readTypeScriptModules.hidePrivateMembers = true;
})

.config(function(parseTagsProcessor) {
  // We actually don't want to parse param docs in this package as we are getting the data out using TS
  parseTagsProcessor.tagDefinitions.forEach(function(tagDef) {
    if (tagDef.name === 'param') {
      tagDef.docProperty = 'paramData';
      tagDef.transforms = [];
    }
  });
})

// Configure links
.config(function(getLinkInfo) {
  getLinkInfo.useFirstAmbiguousLink = false;
})

// Configure file writing
.config(function(writeFilesProcessor) {
  writeFilesProcessor.outputFolder  = 'dist/docs';
})

// Configure rendering
.config(function(templateFinder, templateEngine) {

  // Nunjucks and Angular conflict in their template bindings so change the Nunjucks
  templateEngine.config.tags = {
    variableStart: '{$',
    variableEnd: '$}'
  };

  templateFinder.templateFolders.unshift(path.resolve(__dirname, 'templates'));

  // Specify how to match docs to templates.
  // In this case we just use the same static template for all docs
  templateFinder.templatePatterns.unshift('common.template.html');

  // templateFinder.templatePatterns = [
  //   '${ doc.template }',
  //   '${ doc.id }.${ doc.docType }.template.html',
  //   '${ doc.id }.template.html',
  //   '${ doc.docType }.template.html',
  //   'common.template.html'
  // ];
})

// Configure ids and paths
// .config(function(computeIdsProcessor, computePathsProcessor) {
//   computeIdsProcessor.idTemplates.push({
//     docTypes: ['guide'],
//     getId: function(doc) {
//       return doc.fileInfo.relativePath
//                     // path should be relative to `modules` folder
//                     .replace(/.*\/?modules\//, '')
//                     // path should not include `/docs/`
//                     .replace(/\/docs\//, '/')
//                     // path should not have a suffix
//                     .replace(/\.\w*$/, '');
//     },
//     getAliases: function(doc) { return [doc.id]; }
//   });
//
//   computePathsProcessor.pathTemplates.push({
//     docTypes: ['guide'],
//     pathTemplate: '/${id}',
//     outputPathTemplate: 'partials/guides/${id}.html'
//   });
// });