const fs = require('fs');
const Gherkin = require('gherkin-parse');
const { writeFeatureFile } = require('./feature-files');
const { extractScenarios,
        getScenariosOfType,
        getFeatureTop } = require('./features');

let mapOfGeneratedFeatureTags = {};

function writeSingleScenarioFile(dir, parsed, scenario, i) {
  let output = getFeatureTop(parsed, i, mapOfGeneratedFeatureTags);
  output += extractScenarios(scenario);
  return writeFeatureFile(dir, parsed, output);
}

function writeWholeFeatureFile(dir, parsedFeature, i) {
  let output = getFeatureTop(parsedFeature, 0, mapOfGeneratedFeatureTags);
  let scenarios = getScenariosOfType(parsedFeature, 'Scenario');
  scenarios = scenarios.concat(getScenariosOfType(parsedFeature, 'ScenarioOutline'));
  output += extractScenarios(scenarios);
  return writeFeatureFile(dir, parsedFeature, output);
}

function splitFeatureFile(parsed, dir, i) {
  let featureLevelTags = parsed.feature.tags;

  const containsNoSplitTag = (item) => (item.name.toLowerCase() === "@nosplit");
  if (featureLevelTags && featureLevelTags.some(containsNoSplitTag)) {
    // don't split this one into individual scenarios
    return [writeWholeFeatureFile(dir, parsed, i)];
  }

  return parsed.feature.children.filter((child) => {
    return child.type === "Scenario" || child.type === "ScenarioOutline";
  }).map((child) => {
    return writeSingleScenarioFile(dir, parsed, [child], i);
  });
}

function cucumberSlicer(featureFiles, splitDir) {
  const parser = Gherkin.convertFeatureFileToJSON;
  let generatedFiles = [];
  featureFiles.sort().forEach((file, i) => {
    generatedFiles = generatedFiles.concat(
      splitFeatureFile(parser(file), splitDir, i)
    );
  });
  fs.writeFileSync(splitDir+"/"+'generatedFeatureTagNames.json', JSON.stringify(mapOfGeneratedFeatureTags, null, 2) ,'utf8');
  return generatedFiles;
}

module.exports = {
  cucumberSlicer,
};
