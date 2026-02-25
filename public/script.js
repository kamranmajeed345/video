const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const startCallBtn = document.getElementById('start-call')
const endCallBtn = document.getElementById('end-call')
const statusDiv = document.getElementById('status')
const inviteLinkSpan = document.getElementById('invite-link')
const copyLinkBtn = document.getElementById('copy-link-btn')
const countText = document.getElementById('count-text')

const myPeer = new Peer(undefined, {
  host: '0.peerjs.com',
  port: 443,
  secure: true
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
let myStream = null
let callActive = false
let userCount = 1 // Start with 1 (current user)

// Set the invitation link
const inviteLink = window.location.href
inviteLinkSpan.textContent = inviteLink

// Update user count display
function updateUserCount() {
  countText.textContent = `${userCount} user${userCount !== 1 ? 's' : ''} online`
}

// Initialize user count
updateUserCount()

// Copy link button handler
copyLinkBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(inviteLink).then(() => {
    copyLinkBtn.textContent = '✓ Copied!'
    copyLinkBtn.classList.add('copied')
    
    setTimeout(() => {
      copyLinkBtn.textContent = '📋 Copy Link'
      copyLinkBtn.classList.remove('copied')
    }, 2000)
  }).catch(err => {
    console.error('Failed to copy link:', err)
    alert('Failed to copy link. Please copy manually: ' + inviteLink)
  })
})

// Update status display
function updateStatus(active) {
  callActive = active
  if (active) {
    statusDiv.textContent = 'Call Active'
    statusDiv.className = 'status-active'
    startCallBtn.disabled = true
    endCallBtn.disabled = false
  } else {
    statusDiv.textContent = 'Call Inactive'
    statusDiv.className = 'status-inactive'
    startCallBtn.disabled = false
    endCallBtn.disabled = true
  }
}

// Start call button handler
startCallBtn.addEventListener('click', () => {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    myStream = stream
    addVideoStream(myVideo, stream)
    updateStatus(true)

    myPeer.on('call', call => {
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream)
      userCount++
      updateUserCount()
    })
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
  
  // Close all peer connections
  Object.values(peers).forEach(peer => peer.close())
  
  // Clear video grid
  videoGrid.innerHTML = ''
  
  updateStatus(false)
  
  // Notify server
  socket.emit('end-call', ROOM_ID)
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) {
    peers[userId].close()
    userCount--
    updateUserCount()
  }
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
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

// Initialize with call inactive
updateStatus(false)