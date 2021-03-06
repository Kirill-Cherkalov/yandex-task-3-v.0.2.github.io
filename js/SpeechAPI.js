var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
var startButton = document.getElementById('start_button');
if (!('webkitSpeechRecognition' in window)) {
	upgrade();
} else {
	start_button.style.display = 'inline-block';
	var recognition = new webkitSpeechRecognition();
	recognition.continuous = false;
	recognition.interimResults = true;
	recognition.onstart = function() {
		recognizing = true;
	};
	recognition.onerror = function(event) {
		if (event.error == 'no-speech') {
			showInfo('info_no_speech');
			ignore_onend = true;
		}
		if (event.error == 'audio-capture') {
			showInfo('info_no_microphone');
			ignore_onend = true;
		}
		if (event.error == 'not-allowed') {
			if (event.timeStamp - start_timestamp < 100) {
				showInfo('info_blocked');
			} else {
				showInfo('info_denied');
			}
			ignore_onend = true;
		}
	};
	recognition.onend = function() {
		recognizing = false;
		if (ignore_onend) {
			return;
		}
		if (!final_transcript) {
			showInfo('info_start');
			return;
		}
		showInfo('');
	};
	recognition.onresult = function() {
		var interim_transcript = '';
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				final_transcript += event.results[i][0].transcript;
			} else {
				interim_transcript += event.results[i][0].transcript;
			}
		}
		final_transcript = capitalize(final_transcript);
		document.getElementById('humanCity').value = linebreak(final_transcript);
		document.getElementById('humanCity').value += linebreak(interim_transcript);
	};
}

function upgrade() {
	start_button.style.visibility = 'hidden';
	showInfo('info_upgrade');
}
var two_line = /\n\n/g;
var one_line = /\n/g;

function linebreak(s) {
	return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
var first_char = /\S/;

function capitalize(s) {
	return s.replace(first_char, function(m) {
		return m.toUpperCase();
	});
}
startButton.onclick = function(event) {
	console.log(event);
	if (recognizing) {
		recognition.stop();

		return;
	}
	final_transcript = '';
	recognition.lang = select_dialect.value;
	recognition.start();
	ignore_onend = false;
	document.getElementById('humanCity').value = '';
	document.getElementById('humanCity').value += '';
	showInfo('info_allow');
	start_timestamp = event.timeStamp;
};

function showInfo(s) {
	if (s) {
		for (var child = info.firstChild; child; child = child.nextSibling) {
			if (child.style) {
				child.style.display = child.id == s ? 'inline' : 'none';
			}
		}
		info.style.visibility = 'visible';
	} else {
		info.style.visibility = 'hidden';
	}
}