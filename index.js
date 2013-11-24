var sys = require('util'),
	gox = require('goxstream'),
	Prowl = require('node-prowl'),
	result,
	last,
	min,
	remain,
	timeout;

process.on('uncaughtException', function(err) {
	sendPush('ERROR');
});

result = gox.createStream();

var json = '';

result.on('data', output);

function output (data) {
	var ticker;

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
			sendPush(min);
		} else {
			min = min;
		}
	}
}

var prowl = new Prowl('apikey');

function sendPush (value) {
	var text = '1 btc = $';

	if (timeout) {
		clearTimeout(timeout);
		timeout = null;
	}

	if (!value) {
		value = min;
		text = 'Last = $';
	}

	value = value || min;
	text += value;
	text += '\n remain ' + (remain-1);

	//console.log('push', text);

	prowl.push(text, 'mtgox', function (err, remaining) {
		remain = remaining;
	});

	timeout = setTimeout(sendPush, 3600000);
}