export class Dialogs {
  constructor(scene, dialogs, options = {}) {
    this.scene = scene;
    this.dialogs = dialogs;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isTyping = false;
    this.currentText = '';
    this.typeTimer = null;
    this.typingSpeed = 80; // ms between writes

    this.config = {
      background: {
        x: 400,
        y: 530,
        width: 760,
        height: 160,
        ...options.background
      },
      portrait: {
        x: 100,
        y: 530,
        width: 120,
        height: 120,
        ...options.portrait
      },
      text: {
        x: 200,
        y: 530,
        width: 500,
        ...options.text
      },
      name: {
        x: 200,
        y: 490,
        ...options.name
      },
      characterSettings: {
        orc: {
          width: 120,
          height: 120,
          x: 100,
          y: 530,
          ...options.characterSettings?.orc
        },
        warrior: {
          width: 120,
          height: 120,
          x: 100,
          y: 530,
          ...options.characterSettings?.warrior
        },
        ...options.characterSettings
      }
    };

    this.background = null;
    this.portrait = null;
    this.textObject = null;
    this.nameTag = null;

    this.createDialogBox();
  }

  createDialogBox() {
    this.background = this.scene.add.image(
      this.config.background.x,
      this.config.background.y,
      'dialog_background'
    )
      .setDisplaySize(this.config.background.width, this.config.background.height)
      .setAlpha(0);

    this.portrait = this.scene.add.image(
      this.config.portrait.x,
      this.config.portrait.y,
      'default_portrait'
    )
      .setDisplaySize(this.config.portrait.width, this.config.portrait.height)
      .setAlpha(0);

    this.nameTag = this.scene.add.text(
      this.config.name.x,
      this.config.name.y,
      '', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#FFFF00'
      }).setAlpha(0);

    this.textObject = this.scene.add.text(
      this.config.text.x,
      this.config.text.y,
      '', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#FFFFFF',
        wordWrap: { width: this.config.text.width }
      }).setAlpha(0);

    this.scene.input.keyboard.on('keydown-SPACE', () => this.handleInput());
    this.scene.input.on('pointerdown', () => this.handleInput());
  }

  playSound() {
    this.scene.sound.play('dialog_sound', { volume: 1 });
  }

  play() {
    if (this.dialogs.length === 0) return;
    this.isPlaying = true;
    this.currentIndex = 0;
    this.showCurrentDialog();
  }

  showCurrentDialog() {
    const dialog = this.dialogs[this.currentIndex];
    const character = dialog.emisor;
    const charConfig = this.config.characterSettings[character] || this.config.portrait;

    this.background.setAlpha(1);
    this.textObject.setAlpha(1);
    this.nameTag.setAlpha(1);
    this.portrait.setAlpha(1);

    this.nameTag.setText(character.toUpperCase());
    this.portrait.setTexture(character + '_portrait');
    this.portrait.setDisplaySize(charConfig.width, charConfig.height);
    this.portrait.setPosition(charConfig.x, charConfig.y);
    
    this.currentText = dialog.text;
    this.textObject.setText('');
    this.isTyping = true;
    
    this.startTyping();
  }

  startTyping() {
    if (this.typeTimer) {
      this.typeTimer.remove();
    }

    let currentChar = 0;
    this.typeTimer = this.scene.time.addEvent({
      delay: this.typingSpeed,
      callback: () => {
        if (currentChar < this.currentText.length) {
          this.textObject.setText(this.currentText.substring(0, currentChar + 1));
          this.scene.sound.play('dialog_typing', { volume: 1 });
          currentChar++;
        } else {
          this.finishTyping();
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  finishTyping() {
    if (this.typeTimer) {
      this.typeTimer.remove();
      this.typeTimer = null;
    }
    this.isTyping = false;
    this.textObject.setText(this.currentText);
  }

  handleInput() {
    if (!this.isPlaying) return;

    if (this.isTyping) {
      this.finishTyping();
    } else {
      this.next();
    }
  }

  next() {
    this.currentIndex++;

    this.playSound();

    if (this.currentIndex < this.dialogs.length) {
      this.showCurrentDialog();
    } else {
      this.hide();
    }
  }

  hide() {
    this.isPlaying = false;
    this.isTyping = false;
    this.background.setAlpha(0);
    this.textObject.setAlpha(0);
    this.nameTag.setAlpha(0);
    this.portrait.setAlpha(0);
    
    if (this.typeTimer) {
      this.typeTimer.remove();
      this.typeTimer = null;
    }
  }

  destroy() {
    this.hide();
    this.background.destroy();
    this.portrait.destroy();
    this.textObject.destroy();
    this.nameTag.destroy();
  }
}
