const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const startCallBtn = document.getElementById('start-call')

const myPeer = new Peer(undefined, {
  host: '0.peerjs.com',
  port: 443,
  secure: true
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
let myStream = null

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
  }).catch(err => {
    console.error('Failed to get media stream:', err)
    alert('Could not access camera/microphone. Please check permissions.')
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
  videoGrid.append(video)
}
