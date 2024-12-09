const {writeFile} =require('fs')
const { dialog, Menu } = require('@electron/remote');
const remote = require('@electron/remote');
const { desktopCapturer } = remote;
let mediaRecorder; // MediaRecorder instance to capture footage
const recordedChunks = [];

// Buttons

// HTML Elements
const screenRecorderBtn = document.getElementById('screenRecorderBtn');
const videoPlayerBtn = document.getElementById('videoPlayerBtn');
const screenRecorderSection = document.getElementById('screenRecorderSection');
const videoPlayerSection = document.getElementById('videoPlayerSection');
const videoFileInput = document.getElementById('videoFileInput');
const videoPlayer = document.getElementById('videoPlayer');
const speedSelect = document.getElementById('speedSelect');
const volumeControl = document.getElementById('volumeControl');

// Mode Selection
screenRecorderBtn.onclick = () => {
  screenRecorderSection.style.display = 'block';
  videoPlayerSection.style.display = 'none';
};

videoPlayerBtn.onclick = () => {
  screenRecorderSection.style.display = 'none';
  videoPlayerSection.style.display = 'block';
};


const videoElement = document.querySelector('video');

const startBtn = document.getElementById('startBtn');
startBtn.onclick = e => {
  mediaRecorder.start();
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording';
};

const stopBtn = document.getElementById('stopBtn');

stopBtn.onclick = e => {
  mediaRecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};

const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = getVideoSources;

// Get the available video sources
async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map(source => {
      return {
        label: source.name,
        click: () => selectSource(source)
      };
    })
  );


  videoOptionsMenu.popup();
}

// Change the videoSource window to record
async function selectSource(source) {

  videoSelectBtn.innerText = source.name;

  const constraints = {
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    },
    audio: {
        mandatory: {
            chromeMediaSource: 'desktop',  // Capture system audio
        },
    }
  };

  // Create a Stream
  const stream = await navigator.mediaDevices
    .getUserMedia(constraints);

  // Preview the source in a video element
 
  videoElement.srcObject = stream;
  videoElement.muted = true;
  videoElement.play();

  // Create the Media Recorder
  const options = { mimeType: 'video/webm; codecs=vp9' };
  mediaRecorder = new MediaRecorder(stream, options);

  // Register Event Handlers
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;

  // Updates the UI
}

// Captures all recorded chunks
function handleDataAvailable(e) {
  console.log('video data available');
  recordedChunks.push(e.data);
}

// Saves the video file on stop
async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: 'video/webm; codecs=vp9'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save video',
    defaultPath: `vid-${Date.now()}.webm`
  });

  if (filePath) {
    writeFile(filePath, buffer, () => console.log('video saved successfully!'));
  }

}
// Video Player
videoFileInput.onchange = () => {
    const file = videoFileInput.files[0];
    const videoUrl = URL.createObjectURL(file);
    videoPlayer.src = videoUrl;
    videoPlayer.play();
  };
  
  document.getElementById('playBtn').onclick = () => {
    videoPlayer.play();
  };
  
  document.getElementById('pauseBtn').onclick = () => {
    videoPlayer.pause();
  };
  
  document.getElementById('stopBtnVideo').onclick = () => {
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
  };
  
  // Speed Control
  speedSelect.onchange = () => {
    videoPlayer.playbackRate = speedSelect.value;
  };
  
  // Volume Control
  volumeControl.oninput = () => {
    videoPlayer.volume = volumeControl.value;
  };