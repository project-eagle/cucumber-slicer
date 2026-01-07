const {cucumberSlicer} = require('./lib/cucumber-slicer');

const glob = require('glob');
const {exec} = require('child_process');

module.exports = ({srcDirectory, path, modulo = 3}) => {
    // Define source and destination directories
    const generatedFFDirectory = srcDirectory + '/generatedFeatures';
    const destinationDirectory = path;

    // Ensure generated dir exists
    exec(`mkdir ${generatedFFDirectory}`, () => {
        console.log('Attempted to generate feature dir');

        // Do the sliceage
        const featureFiles = glob.sync(`.${path}/**/*.feature`);
        cucumberSlicer(featureFiles, generatedFFDirectory, modulo);

        // Bash command to delete *.feature files recursively from the destination directory
        const deleteCommand = `find ${destinationDirectory} -type f -name "*.feature" -delete`;

        // Bash command to move files/folders from source to destination directory
        const moveCommand = `mv ${generatedFFDirectory}/* ${destinationDirectory}`;

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
                console.log(`Moved files from ${generatedFFDirectory} to ${destinationDirectory}`);
            });
        });
    });
};
