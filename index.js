import React, { Component } from 'react';

import { render, Window, App, Box, Button, Checkbox, Tab, Text, TextInput } from 'proton-native';

import os from 'os';
import * as api from './src/utils/api';
import * as config from './src/utils/config';

class StremioPlay extends Component {
  state = { 
    rokuServer: '',
    appSubtitles: true,
    videoSrt: '',
    videoStream: '',
    videoImage: '',
  };

  componentDidMount() {
    config.get('server')
      .then((value) => this.setState({rokuServer: value}))
      .catch(() => this.setState({rokuServer: ''}));

    config.get('custom')
      .then((value) => this.setState({appSubtitles: value}))
      .catch(() => this.setState({appSubtitles: true}));

    this.loadData();
  }

  render() {
    return (
      <App>
        <Window title="StremioPlay" size={{w: 400, h: 300}} menuBar={true}>
          <Tab>
            <Box label="Movie" stretchy={true}>
              <Text>Video Title:</Text>
              <TextInput 
                onChange={videoTitle => this.setState({ videoTitle })}
                multiline={false}>
                {this.state.videoTitle}
              </TextInput>
              <Text>Video Url:</Text>
              <TextInput 
                onChange={videoStream => this.setState({ videoStream })}
                multiline={false}>
                {this.state.videoStream}
              </TextInput>
              <Text>Video Image:</Text>
              <TextInput 
                onChange={videoImage => this.setState({ videoImage })}
                multiline={false}>
                {this.state.videoImage}
              </TextInput>
              <Text>Subtitles Url:</Text>
              <TextInput 
                onChange={videoSrt => this.setState({ videoSrt })}
                multiline={false}>
                {this.state.videoSrt}
              </TextInput>
              <Button onClick={this.runServer.bind(this)}>
                Start
              </Button>
              <Button onClick={this.loadData.bind(this)}>
                Reload
              </Button>
            </Box>
            <Box label="Configuration" stretchy={true}>
              <Text>Roku Server:</Text>
              <TextInput 
                onChange={rokuServer => this.setState({ rokuServer })}
                multiline={false}>
                {this.state.rokuServer}
              </TextInput>
              <Checkbox
                checked={this.state.appSubtitles}
                onToggle={appSubtitles => this.setState({ appSubtitles })}>Use app style subtitles.</Checkbox>
              <Button onClick={this.updateServer.bind(this)}>
                Save
              </Button>
            </Box>
          </Tab>
        </Window>
      </App>
    );
  }

  // Get current IP Address
  // From: https://stackoverflow.com/a/15075395
  // By: jhurliman - https://stackoverflow.com/users/248412/jhurliman
  getIPAddress() {
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
    var iface = interfaces[devName];

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.address;
      }
    }

    return '0.0.0.0';
  }

  loadData() {
    const server = api.server.replace('127.0.0.1', this.getIPAddress());

    this.setState({
      videoTitle: '',
      videoImage: '',
      videoSrt: '',
      videoStream: ''
    });

    api.get().then((data) => {
      const videoUrl = data && data.source && data.source.replace('127.0.0.1', this.getIPAddress()),
        url = videoUrl && videoUrl.split('/'),
        hash = url && url[url.length-2];

      if (data) {
        api.stats().then((stats) => {
          const videoTitle = stats[hash] && stats[hash].name;
    
          this.setState({ 
            videoTitle: videoTitle || '',
          });

          api.test(videoUrl).then((quality) => {
            this.setState({ 
              videoSrt: server + '/subtitles.srt?offset=' + data.subtitlesDelay + '&from=' + encodeURI(data.subtitlesSrc),
              videoStream: quality === '0' ? '' : videoUrl + '/stream-q-' + quality + '.m3u8',
              videoImage: videoUrl + '/thumb.jpg',
            }) }
          )
        });
      }
    });
  }

  runServer() {
    const {rokuServer, appSubtitles, videoTitle, videoStream, videoImage, videoSrt} = this.state,
      url = 'http://' + rokuServer + ':8060/launch/287269?version=1' + '&url=' + encodeURIComponent(videoStream) + '&title=' + encodeURIComponent(videoTitle) + '&image=' + encodeURIComponent(videoImage) + '&srt=' + encodeURIComponent(videoSrt) + '&custom=' + appSubtitles;

    api.start(url)
      .catch((err ) => console.log(err));
  }

  updateServer() {
    config.set('server', this.state.rokuServer)
      .catch((err ) => console.log(err));
    config.set('custom', this.state.appSubtitles)
      .catch((err ) => console.log(err));
  }
}

render(<StremioPlay />);