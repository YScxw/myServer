var https = require('https');
var fs = require('fs');

var options = {
	hostname: '127.0.0.1',
	port: 8000,
	path: '/',
	method: 'POST',
	agent: false,
	rejectUnauthorized: false
};

var req = https.request(options, function (res) {
	console.log("statusCode: ", res.statusCode);
	console.log("headers: ", res.headers);

	res.on('data', function (d) {
		process.stdout.write(d);
	});
});
req.write("12131231232132");

req.on('error', function (e) {
	console.error(e);
});
req.end();