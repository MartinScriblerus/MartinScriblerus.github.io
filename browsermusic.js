// connect all modules together and to the master gain, our speaker

// Step 1: Patch from the VCO output into the VCA signal input
vco.connect(vca); // connect oscillator to gain

// Step A (added): Patch from the VCA putput to the master VCA input
vca.connect(master); // connect gain to master gain

// Step 3: Patch from the master VCA output into a speaker
master.connect(audioContext.destination); // connect master gain to speakers

// start the vco
vco.start(0);

// set initial gain values
vca.gain.value = 0; // set gain to 0, a keypress will set it to 1
master.gain.value = 1; // master gain at full volume

// Controls
waveType.onchange = function () {
    changeWaveType(waveType.value);
}

portamento.onchange = function () {
    enablePortamento = portamento.checked;
}

masterGain.oninput = function () {
    changeMaster(masterGain.value);
}

function changeWaveType(type) {
    vco.type = type;
}

function changeMaster(vol) {
    master.gain.value = vol;
    masterGainDisplay.innerHTML = vol;
}

// helper functions
function frequencyFromNote(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
}
// check obj to see if it's empty
function isEmptyObj(obj) {
    return Object.keys(obj).length === 0;
}

// create our oscilloscope
var analyser = audioContext.createAnalyser();
var contentWidth = document.getElementById('content').offsetWidth;
var oscilloscope = new Oscilloscope(audioContext, analyser, contentWidth, 150);
master.connect(oscilloscope.analyser);

// Everything below here is related to setting up Web MIDI

// MIDI
var midi, data, cmd, channel, type, note, velocity;
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
        sysex: false
    }).then(MIDISuccess, MIDIFailure);
}

function MIDISuccess(midi) {
    var inputs = midi.inputs,
        device = {};
    inputs.forEach(function (port) {
        port.onmidimessage = onMIDIMessage;
    });
}

function MIDIFailure() {
    console.log('Your browser does not support Web MIDI');
}

function onMIDIMessage(message) {
    console.log('MIDI Message', message.data);
    data = message.data,
    cmd = data[0] >> 4,
    channel = data[0] & 0xf,
    type = data[0] & 0xf0,
    note = data[1],
    velocity = data[2];

    // Step: Patch from the Keyboard note output into the VCO CV input
    if (velocity == 0) {
        noteOff();
    } else {
        switch (type) {
            case 144:
                noteOn(note, velocity, type);
                break;
            case 128:
                noteOff();
                break;
            case 176:
                pressure(note, velocity);
                break;
            case 224:
                bend(note, velocity);
                break;
        }
    }
}

function noteOn(note, velocity, type) {
    var now = audioContext.currentTime;
    svgnote(type, note, velocity);
    activeKeys[note] = true;
    if (enablePortamento) {
        vco.frequency.cancelScheduledValues(0);
        vco.frequency.value = frequencyFromNote(note);
    } else {
        vco.frequency.cancelScheduledValues(0);
        vco.frequency.setValueAtTime(frequencyFromNote(note), now);
    }

    vca.gain.value = velocity / 127;
}

function noteOff() {
    var now = audioContext.currentTime;
    svgnote(type, note, velocity);
    delete activeKeys[note];
    
    vco.frequency.cancelScheduledValues(0);
    vco.frequency.setValueAtTime(frequencyFromNote(note), now);
    
    if (isEmptyObj(activeKeys)) {
        vca.gain.value = 0;
    }
}

function bend(note, velocity) {
    console.log('bend', note, velocity);
}

function pressure(note, velocity) {
    console.log('pressure', note, velocity);
}

// qwerty keyboard functions
var keyboard = document.getElementById('controller');
var k = document.getElementsByClassName('key');
keyboard.addEventListener('mousedown', keynote);
keyboard.addEventListener('mouseup', keynote);

function keynote(e) {
    if (e.target.classList[0] != 'key') return;

    var keyClasses = e.target.classList,
        midiNote = keyClasses[searchIndex(keyClasses, "key[0-9]+")].replace('key', '');

    switch (e.type) {
        case 'mousedown':
            vco.frequency.setValueAtTime(frequencyFromNote(midiNote), 0);
            vca.gain.value = 0.9;
            keyClasses.add('active');
            break;
        case 'mouseup':
            vca.gain.value = 0;
            keyClasses.remove('active');
            break;
    }
}
// svg
function svgnote(type, midiNote, velocity) {
    // ignore notes outside of our svg keyboard range
    if (midiNote >= 48 && midiNote <= 72) {
        var keyClass = "key" + midiNote,
            key = document.querySelector('.' + keyClass),
            keyClassList = key.classList;
        (type == 128 || type == 144 && velocity == 0) ? keyClassList.remove('active') : keyClassList.add('active');
    }
}
//
function searchIndex(list, value) {
    value = new RegExp(value);
    for (var i in list) {
        if (list[i].match(value)) {
            return i;
        }
    }
    return 0;
}