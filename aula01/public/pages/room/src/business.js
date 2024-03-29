class Buniness {
  constructor({ room, media, view, socketBuilder }) {
    this.room = room;
    this.media = media;
    this.view = view;
    this.socketBuilder = socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onUserDisconnected())
      .build();

    this.socketBuilder.emit('join-room', this.room, 'test01')
    this.currentStream = {};
  }

  static initialize(deps) {
    const instance = new Buniness(deps);
    return instance._init();
  }

  async _init() {
    this.currentStream = await this.media.getCamera();
    this.addVideoStream('test01');
  }

  addVideoStream(userId, stream = this.currentStream) {
    const isCurrentId = false;
    this.view.renderVideo({ userId, stream, isCurrentId })
  }

  onUserConnected = function() {
    return userId => {
      console.log('user connected', userId);
    }
  }

  onUserDisconnected = function() {
    return userId => {
      console.log('user disconnected', userId);
    }
  }
}