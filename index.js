const { cucumberSlicer } = require('./lib/cucumber-slicer');

const glob = require('glob');
const { exec } = require('child_process');

module.exports = () => {
    const featureFiles = glob.sync('./src/test/resources/**/*.feature');
    cucumberSlicer(featureFiles, './generatedFeatures');


// Define source and destination directories
    const sourceDirectory = __dirname + '/generatedFeatures';
    const destinationDirectory = __dirname + '/src/test/resources';

// Bash command to delete *.feature files recursively from the destination directory
    const deleteCommand = `find ${destinationDirectory} -type f -name "*.feature" -delete`;

// Bash command to move files/folders from source to destination directory
    const moveCommand = `mv ${sourceDirectory}/* ${destinationDirectory}`;

// Execute the delete command
    exec(deleteCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error deleting .feature files: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`Deleted .feature files from ${destinationDirectory}`);

        // Execute the move command
        exec(moveCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error moving files: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`Moved files from ${sourceDirectory} to ${destinationDirectory}`);
        });
    });
};
