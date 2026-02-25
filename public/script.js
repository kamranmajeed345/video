const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const startCallBtn = document.getElementById('start-call')
const endCallBtn = document.getElementById('end-call')
const muteBtn = document.getElementById('mute-btn')
const volumeUpBtn = document.getElementById('volume-up')
const volumeDownBtn = document.getElementById('volume-down')

const myPeer = new Peer(undefined, {
  host: '0.peerjs.com',
  port: 443,
  secure: true
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
let myStream = null
let isMuted = false
let currentVolume = 1.0

// Handle incoming calls - set up BEFORE start button
myPeer.on('call', call => {
  if (myStream) {
    call.answer(myStream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
      video.remove()
    })
  }
})

// Handle user connections - set up BEFORE start button
socket.on('user-connected', userId => {
  if (myStream) {
    // Add delay to ensure both peers are ready
    setTimeout(() => {
      connectToNewUser(userId, myStream)
    }, 1000)
  }
})

// Handle user disconnections
socket.on('user-disconnected', userId => {
  if (peers[userId]) {
    peers[userId].close()
  }
})

// Join room when peer connection is ready
myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

// Start call button handler
startCallBtn.addEventListener('click', () => {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    myStream = stream
    addVideoStream(myVideo, stream)
    startCallBtn.disabled = true
    endCallBtn.disabled = false
    muteBtn.disabled = false
    volumeUpBtn.disabled = false
    volumeDownBtn.disabled = false
  }).catch(err => {
    console.error('Failed to get media stream:', err)
    alert('Could not access camera/microphone. Please check permissions.')
  })
})

// End call button handler
endCallBtn.addEventListener('click', () => {
  if (myStream) {
    myStream.getTracks().forEach(track => track.stop())
  }
  
  Object.values(peers).forEach(peer => peer.close())
  videoGrid.innerHTML = ''
  
  startCallBtn.disabled = false
  endCallBtn.disabled = true
  muteBtn.disabled = true
  volumeUpBtn.disabled = true
  volumeDownBtn.disabled = true
  isMuted = false
  muteBtn.innerHTML = '<span>🔇</span> Mute'
  muteBtn.classList.remove('muted')
})

// Mute button handler
muteBtn.addEventListener('click', () => {
  if (myStream) {
    const audioTrack = myStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      isMuted = !audioTrack.enabled
      
      if (isMuted) {
        muteBtn.innerHTML = '<span>🔊</span> Unmute'
        muteBtn.classList.add('muted')
      } else {
        muteBtn.innerHTML = '<span>🔇</span> Mute'
        muteBtn.classList.remove('muted')
      }
    }
  }
})

// Volume up button handler
volumeUpBtn.addEventListener('click', () => {
  const videos = document.querySelectorAll('video:not(:first-child)')
  currentVolume = Math.min(currentVolume + 0.1, 1.0)
  videos.forEach(video => {
    video.volume = currentVolume
  })
})

// Volume down button handler
volumeDownBtn.addEventListener('click', () => {
  const videos = document.querySelectorAll('video:not(:first-child)')
  currentVolume = Math.max(currentVolume - 0.1, 0)
  videos.forEach(video => {
    video.volume = currentVolume
  })
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  video.volume = currentVolume
  videoGrid.append(video)
}
