export class NewGame extends Phaser.Scene {
  constructor() {
    super({ key: 'NewGame' });
  }

  preload() {
    // TODO: Need new image here for asking for name at game start
    this.load.image('start_screen_image_background', 'assets/images/startScreenBackground.png');
  
  }

  create() {
    // TODO: Replace prompt by a menu
    const playerName = prompt('Name your charcater');
    const backgroundImage = this.add.image(400, 300, "start_screen_image_background");

    backgroundImage.setDisplaySize(800, 600);

  }
}
