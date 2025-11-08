import { Dialogs } from "../../utils/Dialogs.js";

export class NewGame extends Phaser.Scene {
  constructor() {
    super({ key: 'NewGame' });
  }

  preload() {
    // TODO: Need new image here for asking for name at game start
    this.load.image('new_game_image_background', 'assets/images/castleInteriorCinematic.png');
    this.load.spritesheet("orc", "assets/sprites/orcSpriteSheet.png", {
      frameWidth: 176 / 3,
      frameHeight: 126 / 2
    });

    this.load.spritesheet("warrior", "assets/sprites/warriorSpriteSheet.png", {
      frameWidth: 173 / 3,
      frameHeight: 123 / 2
    });

    this.load.audio("warrior_step_audio", "assets/audio/walkingStep.wav");
    //this.load.audio("game_audio_track_1", "assets/audio/map.mp3");
    

    // dialog images:
    this.load.image('dialog_background', 'assets/images/dialog_background.png');
    this.load.image('orc_portrait', 'assets/images/orc_portrait.png');
    this.load.image('warrior_portrait', 'assets/images/warrior_portrait.png');

    // dialog audio:
    this.load.audio('dialog_sound', 'assets/audio/dialog.wav');
    this.load.audio('dialog_typing', 'assets/audio/dialog_typing.wav');
  }

  create() {
    // TODO: Animated scene / movie
    // TODO: Replace prompt by a menu
    //const playerName = prompt('Name your character');

    const backgroundImage = this.add.image(400, 300, "new_game_image_background");
    backgroundImage.setDisplaySize(800, 600);

    let stepTimer = null;
    const playWarriorStepAudio = () => {
      this.sound.add("warrior_step_audio", { volume: 20, loop: false }).play(); 
    };

    this.anims.create({
      key: 'orc_front_idle',
      frames: [{ key: 'orc', frame: 0 }]
    });
    this.anims.create({
      key: 'orc_front_walk',
      frames: [{ key: 'orc', frame: 3 }]
    });
    this.anims.create({
      key: 'orc_back_idle',
      frames: [{ key: 'orc', frame: 1 }]
    });
    this.anims.create({
      key: 'orc_back_walk',
      frames: [{ key: 'orc', frame: 4 }]
    });
    this.anims.create({
      key: 'orc_side_idle',
      frames: [{ key: 'orc', frame: 2 }]
    });
    this.anims.create({
      key: 'orc_side_walk',
      frames: [{ key: 'orc', frame: 5 }]
    });

    this.anims.create({
      key: 'warrior_front_idle',
      frames: [{ key: 'warrior', frame: 0 }]
    });
    this.anims.create({
      key: 'warrior_front_walk',
      frames: [{ key: 'warrior', frame: 3 }]
    });
    this.anims.create({
      key: 'warrior_back_idle',
      frames: [{ key: 'warrior', frame: 1 }]
    });
    this.anims.create({
      key: 'warrior_back_walk',
      frames: [{ key: 'warrior', frame: 4 }]
    });
    this.anims.create({
      key: 'warrior_side_idle',
      frames: [{ key: 'warrior', frame: 2 }]
    });
    this.anims.create({
      key: 'warrior_side_walk',
      frames: [{ key: 'warrior', frame: 5 }]
    });

    const orc = this.add.sprite(405, 450, 'orc').setOrigin(0.5, 1).setScale(2);
    const warrior = this.add.sprite(400, 800, 'warrior').setOrigin(0.5, 1).setScale(3.5);
    
    orc.play('orc_front_idle');
    warrior.play('warrior_back_walk');

    const startWalkingSteps = () => {
      playWarriorStepAudio();
      
      stepTimer = this.time.addEvent({
        delay: 1000, // play 1 step each second
        callback: playWarriorStepAudio,
        callbackScope: this,
        loop: true
      });
    };

    const stopWalkingSteps = () => {
      if (stepTimer) {
        stepTimer.remove(); 
        stepTimer = null;
      }
    };

    // Stop the background music for dramatic effect
    const startScreen = this.scene.get('StartScreen');
    if (startScreen && startScreen.stopBackgroundMusic) {
      startScreen.stopBackgroundMusic();
    }

    const dialogs = new Dialogs(this, [
      { emisor: "orc", text: "¡Who is disturbing my sleep!" },
      { emisor: "warrior", text: "I speak in the name of the Warrior's King, Orc." },
      { emisor: "orc", text: "ORC? King ORC!."},
      { emisor: "warrior", text: "You are not my King, Orc" },
      { emisor: "orc", text: "Not yet." }
    ], {
      characterSettings: {
        orc: {
          width: 150,    
          height: 150,
          x: 100,        
          y: 545
        },
        warrior: {
          width: 150,    
          height: 150,
          x: 100,         
          y: 545
        }
      }
    });


    startWalkingSteps();

    this.tweens.add({
      targets: warrior,
      y: 600,
      duration: 7000,
      ease: "linear",
      onComplete: () => {
        warrior.play("warrior_back_idle");
        stopWalkingSteps();
        this.time.delayedCall(500, () => {
          dialogs.play();
        });
      }
    });

  }
}
