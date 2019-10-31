const gulp = require("gulp");
const { exec } = require('child_process');
const util = require('util');
const pexec = util.promisify(require('child_process').exec);

gulp.task('server', (cb) => {
  try {
    let s = exec('nodemon server.js');
    s.stdout.pipe(process.stdout);
    s.stderr.pipe(process.stderr);
  } catch(e) {
    console.error("Hubieron errores:\n"+e);
  }
});

async function cget() {
  try {
    const {stdout, stderr} = await pexec("curl -v http://localhost:8000/package.json");
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);
  } catch(e) {
    console.error("Hubieron errores:\n"+e);
  }
}

exports.cget = cget;
