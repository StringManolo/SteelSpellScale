export class TitleMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleMenu' });
  }

  preload() {
    this.load.image('title_menu_image_background', 'assets/images/titleMenuBackground.png');
  }

  create() {
    // alert('Title Menu created.');
    const backgroundImage = this.add.image(400, 300, "title_menu_image_background");
    backgroundImage.setDisplaySize(800, 600);

    const titleStyle = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    };

    const menuItemStyle = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#cccccc',
      stroke: '#000000',
      strokeThickness: 2,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 2,
        fill: true
      }
    };

    const menuItemHoverStyle = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 2,
        fill: true
      }
    };

    const titleText = this.add.text(400, 300, 'STEEL SPEEL SCALE', titleStyle);
    titleText.setOrigin(0.5);

    const newGameText = this.add.text(180, 390  , 'NEW GAME', menuItemStyle);
    newGameText.setOrigin(0.5);

    const continueText = this.add.text(180, 440, 'CONTINUE', menuItemStyle);
    continueText.setOrigin(0.5);

    const optionsText = this.add.text(180, 490, 'OPTIONS', menuItemStyle);
    optionsText.setOrigin(0.5);

    const loadNewScene = sceneName => this.scene.start(sceneName); // use TitleMemu as this

    function makeMenuItemInteractive(text, scene) {
      text.setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          text.setStyle(menuItemHoverStyle);
          text.setScale(1.05);
        })
        .on('pointerout', () => {
          text.setStyle(menuItemStyle);
          text.setScale(1);
        })
        .on('pointerdown', () => {
          text.setScale(0.95);
          switch(text.text) {
            case 'NEW GAME':
              alert('Starting new game...');
              loadNewScene('NewGame');
              break;
            case 'CONTINUE':
              alert('Loading game...');
              break;
            case 'OPTIONS':
              alert('Opening options...');
              break;
          }
        })
        .on('pointerup', () => {
          text.setScale(1.05);
        });
    }

    makeMenuItemInteractive(newGameText, this);
    makeMenuItemInteractive(continueText, this);
    makeMenuItemInteractive(optionsText, this);
  }
}
