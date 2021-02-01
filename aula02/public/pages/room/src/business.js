class Buniness {
  constructor({ room, media, view, socketBuilder, peerBuilder }) {
    this.room = room;
    this.media = media;
    this.view = view;
    this.socketBuilder = socketBuilder;
    this.peerBuilder = peerBuilder;

    this.socket = {};
    this.currentStream = {};
    this.currentPeer = {};
    
    this.peers = new Map();
  }

  static initialize(deps) {
    const instance = new Buniness(deps);
    return instance._init();
  }

  async _init() {
    this.currentStream = await this.media.getCamera(true);

    this.socket = this.socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onUserDisconnected())
      .build(); 
    
    this.currentPeer = await this.peerBuilder
      .setOnError(this.setOnError())
      .setOnConnectionOpened(this.setOnConnectionOpened())
      .setOnCallReceived(this.setOnCallReceived())
      .build()

    this.addVideoStream('test01');
  }

  addVideoStream(userId, stream = this.currentStream) {
    const isCurrentId = false;
    this.view.renderVideo({ 
      userId, 
      stream, 
      isCurrentId,
      muted: false
    })
  }

  onUserConnected = function() {
    return userId => {
      console.log('user connected', userId);
      this.currentPeer.call(userId, this.currentStream);
    }
  }

  onUserDisconnected = function() {
    return userId => {
      console.log('user disconnected', userId);
    }
  }

  setOnError = function() {
    return error => {
      console.error('error on peer', error);
    }
  }

  setOnConnectionOpened = function() {
    return peer => {
      const id = peer.id;
      console.log('peer!!', peer);
      this.socket.emit('join-room', this.room, id);

    }
  }

  setOnCallReceived = function() {
    return call => {
      console.log('answering call', call);
      call.answer(this.currentPeer);
    }
  }

  setOnPeerStreamReceived = function() {
    return (call, stream) => {
      const callerId = call.peer;
      this.addVideoStream(callerId, stream);

      this.peers.set(callerId, { call });

      this.view.setParticipants(this.peers.size);
    }
  }
}