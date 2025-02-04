/////////// Start server.js and use alternative server method to serve frontend

const { createServer } = require('http');

const methods = Object.create(null);

createServer((request, response) => {
  let handler = methods[request.method] || notAllowed;
  console.log(`method= ${request.method} url=${request.url}`);
  handler(request)
    .catch(error => {
      if (error.status != null) return error;
      return { body: String(error), status: 500 };
    })
    .then(({ body, status = 200, type = 'text/plain' }) => {
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader('Access-Control-Allow-Methods', 'PUT, GET, OPTIONS, DELETE, MKCOL');
      response.writeHead(status, { 'Content-Type': type });
      if (body && body.pipe) body.pipe(response);
      else response.end(body);
    });
}).listen(8000);

async function notAllowed(request) {
  return {
    status: 405,
    body: `Method ${request.method} not allowed.`
  };
}

const { parse } = require('url');
const { resolve, sep } = require('path');

const baseDirectory = process.cwd();

function urlPath(url) {
  let { pathname } = parse(url);
  let path = resolve(decodeURIComponent(pathname).slice(1));
  if (path != baseDirectory && !path.startsWith(baseDirectory + sep)) {
    throw { status: 403, body: 'Forbidden' };
  }
  return path;
}

const { createReadStream } = require('fs');
const { stat, readdir, mkdir } = require('fs').promises;
const mime = require('mime');

methods.GET = async function(request) {
  let path = urlPath(request.url);
  let stats;
  try {
    stats = await stat(path);
  } catch (error) {
    if (error.code != 'ENOENT') throw error;
    else return { status: 404, body: 'File not found' };
  }
  if (stats.isDirectory()) {
    return { body: (await readdir(path)).join('\n') };
  } else {
    return { body: createReadStream(path), type: mime.getType(path) };
  }
};

const { rmdir, unlink } = require('fs').promises;

methods.DELETE = async function(request) {
  let path = urlPath(request.url);
  let stats;
  try {
    stats = await stat(path);
  } catch (error) {
    if (error.code != 'ENOENT') throw error;
    else return { status: 204 };
  }
  if (stats.isDirectory()) await rmdir(path);
  else await unlink(path);
  return { status: 204 };
};

const { createWriteStream } = require('fs');

function pipeStream(from, to) {
  return new Promise((resolve, reject) => {
    from.on('error', reject);
    to.on('error', reject);
    to.on('finish', resolve);
    from.pipe(to);
  });
}

methods.PUT = async function(request) {
  let path = urlPath(request.url);
  await pipeStream(request, createWriteStream(path));
  return { status: 200, body: path };
};

/*

methods.MKCOL = function(path, respond) {
  fs.stat(path, function(error, stats) {
    if (error && error.code == "ENOENT")
      fs.mkdir(path, respondErrorOrNothing(respond));
    else if (error)
      respond(500, error.toString());
    else if (stats.isDirectory())
      respond(204);
    else
      respond(400, "File exists");
  });
};

const { mkdir } = require('fs').promises;
const { existsSync } = require('fs');

methods.MKCOL = async function(request) {
  let path = urlPath(request.url);
  if (existsSync(path)) return { status: 409, body: `${path} already exists.` };

  try {
    await mkdir(path);
    return { status: 204 };
  } catch (error) {
    throw error;
  }
};

*/

methods.MKCOL = async function(request) {
  let path = urlPath(request.url);
  let stats;
  try {
    stats = await stat(path);
  } catch (error) {
    if (error.code != "ENOENT") throw error;
    await mkdir(path);
    return {status: 204};
  }
  if (stats.isDirectory()) return {status: 204};
  else return {status: 400, body: "Not a directory"};
};

methods.OPTIONS = async function(request) {
  return { status: 204 };
};
