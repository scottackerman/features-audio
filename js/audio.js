var mouse_x;
var mouse_y;

// Keep track of all loaded buffers.
var BUFFERS = {};
// Page-wide audio context.
var context = null;

var interation = 0;

// An object to track the buffers to load {name: path}
var BUFFERS_TO_LOAD = {
  convenience: '/sounds/convenience.wav',
  security: '/sounds/security.wav',
  privacy: '/sounds/privacy.wav'
};

// Loads all sound samples into the buffers object.
function loadBuffers() {
  // Array-ify
  var names = [];
  var paths = [];
  for (var name in BUFFERS_TO_LOAD) {
    var path = BUFFERS_TO_LOAD[name];
    names.push(name);
    paths.push(path);
  }
  bufferLoader = new BufferLoader(context, paths, function(bufferList) {
    for (var i = 0; i < bufferList.length; i++) {
      var buffer = bufferList[i];
      var name = names[i];
      BUFFERS[name] = buffer;
    }
  });
  bufferLoader.load();
}

function startUserMedia() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
//     context = new AudioContext();
	if(!context){
		context = new AudioContext;
	}
}

document.addEventListener('DOMContentLoaded', function() {
  // try {
  //   // Fix up prefixing
  //   window.AudioContext = window.AudioContext || window.webkitAudioContext;
  //   context = new AudioContext();
  // }
  // catch(e) {
  //   alert("Web Audio API is not supported in this browser");
  // }
  loadBuffers();
  startUserMedia();
});

//====================
// buffer loader

function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}

// Crossfader

this.playing = false;

function play() {
  // Create three sources.
  this.ctl1 = createSource(BUFFERS.convenience);
  this.ctl2 = createSource(BUFFERS.security);
  this.ctl3 = createSource(BUFFERS.privacy);
  // Mute the second source.
  this.ctl1.gainNode.gain.value = 0;
  this.ctl2.gainNode.gain.value = 0;
  this.ctl3.gainNode.gain.value = 0;
  // Start playback in a loop
  if (!this.ctl1.source.start) {
    this.ctl1.source.noteOn(0);
    this.ctl2.source.noteOn(0);
    this.ctl3.source.noteOn(0);
  } else {
    this.ctl1.source.start(0);
    this.ctl2.source.start(0);
    this.ctl3.source.start(0);
  }

  function createSource(buffer) {
    var source = context.createBufferSource();
    var gainNode = context.createGain ? context.createGain() : context.createGainNode();
    source.buffer = buffer;
    // Turn on looping
    source.loop = true;
    // Connect source to gain.
    source.connect(gainNode);
    // Connect gain to destination.
    gainNode.connect(context.destination);

    return {
      source: source,
      gainNode: gainNode
    };
  }
};

function stop() {
  if (!this.ctl1.source.stop) {
    this.ctl1.source.noteOff(0);
    this.ctl2.source.noteOff(0);
    this.ctl3.source.noteOff(0);
  } else {
    this.ctl1.source.stop(0);
    this.ctl2.source.stop(0);
    this.ctl3.source.stop(0);
  }
};

function muteAudio() {
  this.ctl1.gainNode.gain.value = 0;
  this.ctl2.gainNode.gain.value = 0;
  this.ctl3.gainNode.gain.value = 0;
}

function getDifference(a, b) { 
  return Math.abs(a - b);
}

function crossfade(x, y) {
  if(interation < 100) {
    interation ++;
  }
  // REVISIT...
  // var triangleVolumeReduction = triangleVolumeCenter difference of x
  var triangleVolumeCenter = stageWidth/2;
  var centerOffset = (getDifference(triangleVolumeCenter, x))/triangleVolumeCenter;

  var valx = parseInt(x) / parseInt(stageWidth);
  var valy = 1 - (parseInt(y) / parseInt(stageHeight));
  var inverseY = (parseInt(y) / parseInt(stageHeight));

  var gain1 = Math.cos(valx * 0.5*Math.PI);
  var gain2 = Math.cos((1.0 - valx) * 0.5*Math.PI);
  var gain3 = (Math.cos((1.0 - valy) * 0.5*Math.PI)) - centerOffset;
  if (gain3 < 0) {
    gain3 = 0;
  }

  // Adjust gain of bottom left and right against top center gain
  gain1 = gain1 * inverseY;
  gain2 = gain2 * inverseY;

  this.ctl1.gainNode.gain.value = gain1 * (interation/100);
  this.ctl2.gainNode.gain.value = gain2 * (interation/100);
  this.ctl3.gainNode.gain.value = gain3 * (interation/100);
};

function toggle() {
  this.playing ? this.stop() : this.play();
  this.playing = !this.playing;
};

$('body').mousemove(function(event) {
  mouse_x = event.pageX;
  mouse_y = event.pageY;

  if(mouse_x >= stageWidth) {
    mouse_x = stageWidth;
  }

  if(mouse_y >= stageHeight) {
    mouse_y = stageHeight;
  }

  if(useMouse == true && mouse_x > 0 && mouse_x < stageWidth && mouse_y > 0 && mouse_y < stageHeight) {
    crossfade(mouse_x, mouse_y);
  }

});