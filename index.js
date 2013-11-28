var sys = require('util'),
	gox = require('goxstream'),
	Prowl = require('node-prowl'),
	result,
	last,
	min,
	max,
	remain,
	timeout;

process.on('uncaughtException', function(err) {
	sendPush('ERROR');
});

result = gox.createStream();

var json = '';

result.on('data', output);

function output (data) {
	var ticker,
		needSend = false;

	json += data;

	try {
		ticker = JSON.parse(json);
	} catch (e) {
		ticker = false;
	}

	if (ticker) {
		json = '';
		last = parseFloat(ticker.ticker.last.value);

		//console.log(last);

		if (!min || last < min) {
			min = last;
			needSend = true;
		} else {
			min = min;
		}

		if (!max || last > max) {
			max = last;
			needSend = true;
		} else {
			max = max;
		}
	}

	if (needSend) {
		sendPush(min, max);
	}
}

var prowl = new Prowl('apiKey');

function sendPush (valMin, valMax) {
	var text = 'min $%min%\nmax $%max%';

	if (timeout) {
		clearTimeout(timeout);
		timeout = null;
	}

	if (!valMin || !valMax) {
		valMin = valMin || min;
		valMax = valMax || max;
		text = 'Last min $%min%\nmax $%max%';
	}

	text = text.replace('%min%', valMin);
	text = text.replace('%max%', valMax);
	text += '\n remain ' + (remain||999);

	//console.log('push', text);

	prowl.push(text, 'mtgox', function (err, remaining) {
		/*if (err) {
			console.log(err);
		}*/
		remain = remaining;
	});

	timeout = setTimeout(sendPush, 3600000);
}