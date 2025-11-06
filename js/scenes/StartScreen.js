export class StartScreen extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScreen' });
  }

  preload() {
    // Cargar assets
    this.load.image('start_screen_image_background', 'assets/images/startScreenBackground.png');
    this.load.image('start_screen_image_button', 'assets/images/startScreenButton.png');
    this.load.audio('start_screen_music', ['assets/audio/startScreen.mp3']);
  }

  playBackgroundMusic() {
    this.StartScreenMusic = this.sound.add('start_screen_music', {
      volume: 0.3,
      loop: true
    });
     
    this.StartScreenMusic.play();
  }

  create() {
    // alert('StartScreen created.');
    this.playBackgroundMusic(); 
    const backgroundImage = this.add.image(400, 300, "start_screen_image_background");
    const buttonImage = this.add.image(400, 300, "start_screen_image_button");

    backgroundImage.setDisplaySize(800, 600);
    buttonImage.setDisplaySize(200, 200 / 2.48); // 2.48 is the original .png ratio

    const buttonImageScaleX = buttonImage.scaleX;
    const buttonImageScaleY = buttonImage.scaleY;

    buttonImage.setInteractive()
      .on("pointerover", () => buttonImage.setScale(buttonImageScaleX * 1.1, buttonImageScaleY * 1.1))
      .on("pointerout", () => buttonImage.setScale(buttonImageScaleX, buttonImageScaleY))
      .on("pointerdown", () => {
        this.scene.start('TitleMenu');
      });

  }
}
