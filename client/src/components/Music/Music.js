import React, { Component } from "react";
import PropTypes from "prop-types";
import Playlist from "./Playlist";
import MusicPlayer from "./MusicPlayer";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import SwitchPlaylist from "./SwitchPlaylist";
import Divider from "@material-ui/core/Divider";
const styles = theme => ({
  root: {
    flexGrow: 1,
    marginLeft: "15px",
    marginRight: "15px",
    paddingTop: "20px"
  }
});

class Music extends Component {
  classes = this.props.classes;
  state = { currentTrack: null, audio: null, showGlobalTracks: false };

  togglePlaylist = () => {
    this.setState({ showGlobalTracks: !this.state.showGlobalTracks });
  };

  resumeTrack = () => {
    let src = this.state.audio.src;
    let ctx = this.state.audio.ctx;
    src.connect(ctx.destination);
  };

  pauseTrack = () => {
    let src = this.state.audio.src;
    src.disconnect();
  };

  playTrack = async currentTrack => {
    this.setState({ currentTrack }, async () => {
      if (this.state.audio !== null) {
        this.state.audio.src.disconnect();
      }
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        if (this.state.currentTrack === null) return;
        let res = await fetch(`api/tracks/${this.state.currentTrack.trackId}`, {
          method: "GET",
          headers: { "x-auth-key": localStorage.getItem("token") }
        });
        let buffer = await res.arrayBuffer();
        buffer = await ctx.decodeAudioData(buffer);

        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(ctx.destination);
        this.setState(
          {
            audio: { ctx, src }
          },
          src.start(0)
        );
      } catch (e) {
        console.log(e);
      }
    });
  };

  render() {
    return (
      <div className={this.classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={6}>
            <Paper elevation={5}>
              <SwitchPlaylist togglePlaylist={this.togglePlaylist} />
              <Divider />
              <Playlist
                tracks={
                  this.state.showGlobalTracks
                    ? this.props.globalTracks
                    : this.props.tracks
                }
                currentTrack={this.state.currentTrack}
                playTrack={this.playTrack}
              />
            </Paper>
          </Grid>
          <Grid item xs>
            <MusicPlayer
              currentTrack={this.state.currentTrack}
              playTrack={this.playTrack}
              tracks={
                this.state.showGlobalTracks
                  ? this.props.globalTracks
                  : this.props.tracks
              }
              resumeTrack={this.resumeTrack}
              pauseTrack={this.pauseTrack}
              logout={this.props.logout}
              page={this.props.page}
              changePage={this.props.changePage}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

Music.propTypes = {
  logout: PropTypes.func.isRequired,
  page: PropTypes.string.isRequired,
  changePage: PropTypes.func.isRequired,
  tracks: PropTypes.array,
  globalTracks: PropTypes.array
};

export default withStyles(styles)(Music);
