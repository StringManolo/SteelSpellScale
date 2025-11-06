import { StartScreen } from './scenes/StartScreen.js';
import { TitleMenu } from "./scenes/TitleMenu.js";
import { NewGame } from "./scenes//NewGame.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  zoom: 1,
  pixelArt: true,
  backgroundColor: '#0f380f',
  parent: 'game-container',
  scene: [StartScreen, TitleMenu, NewGame],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  audio: {
    disableWebAudio: false
  }
};

const game = new Phaser.Game(config);
