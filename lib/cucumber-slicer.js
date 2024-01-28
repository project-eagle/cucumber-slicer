const fs = require('fs');
const Gherkin = require('gherkin-parse');
const { writeFeatureFile } = require('./feature-files');
const { extractScenarios,
        getScenariosOfType,
        getFeatureTop } = require('./features');


function writeSingleScenarioFile(dir, parsed, scenario, i) {
  let output = getFeatureTop(parsed, i);
  output += extractScenarios(scenario);
  return writeFeatureFile(dir, parsed, output);
}

function writeWholeFeatureFile(dir, parsedFeature) {
  let output = getFeatureTop(parsedFeature);
  let scenarios = getScenariosOfType(parsedFeature, 'Scenario');
  scenarios = scenarios.concat(getScenariosOfType(parsedFeature, 'ScenarioOutline'));
  output += extractScenarios(scenarios);
  return writeFeatureFile(dir, parsedFeature, output);
}

function splitFeatureFile(parsed, dir) {
  let featureLevelTags = parsed.feature.tags;

  const containsNoSplitTag = (item) => (item.name.toLowerCase() === "@nosplit");
  if (featureLevelTags && featureLevelTags.some(containsNoSplitTag)) {
    // don't split this one into individual scenarios
    return [writeWholeFeatureFile(dir, parsed)];
  }

  return parsed.feature.children.filter((child) => {
    return child.type === "Scenario" || child.type === "ScenarioOutline";
  }).map((child, i) => {
    return writeSingleScenarioFile(dir, parsed, [child], i);
  });
}

function cucumberSlicer(featureFiles, splitDir) {
  const parser = Gherkin.convertFeatureFileToJSON;
  let generatedFiles = [];
  featureFiles.forEach((file) => {
    generatedFiles = generatedFiles.concat(
      splitFeatureFile(parser(file), splitDir)
    );
  });
  return generatedFiles;
}

module.exports = {
  cucumberSlicer,
};
