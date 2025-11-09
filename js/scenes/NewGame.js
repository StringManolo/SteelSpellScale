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
      { emisor: "orc", text: "(Growling) What wretched mortal dares disturb Grommash, King of the Iron Claws?" },
      { emisor: "warrior", text: "King Grommash. I am no mere mortal. I am Commander Kaelen, and I speak in the name of High General Roric." },
      { emisor: "orc", text: "Roric... 'The Stonewall' General. He still lives? I thought his pride would have gotten him killed by now. Why does he send a whelp to my throne?" },
      { emisor: "warrior", text: "He sends me with an offer of alliance, not insults. An offer that concerns the Mages' Kingdom." },
      { emisor: "orc", text: "The Mages? (He scoffs) Those cowards who hide behind their glowing walls and forbidden magic. What of them?" },
      { emisor: "warrior", text: "Our scouts report the Mages have vanished from their towers. They are hiding in the Dragon's Teeth mountains." },
      { emisor: "orc", text: "The Dragon's Teeth? Only fools and dragon-fire go there. Why would they... (He pauses, as if realizing) ...the Dwarves." },
      { emisor: "warrior", text: "Exactly. We believe they intend to use their magic to guide the Dragons, to unleash them upon the Dwarven cities in the heart of the earth." },
      { emisor: "orc", text: "Hmph. The Mountain Folk and their glittering trinkets. Let them burn. Why should the Iron Claws bleed for them?" },
      { emisor: "warrior", text: "You won't be bleeding FOR them. You'll be taking advantage. The General proposes a united front... against the MAGES." },
      { emisor: "warrior", text: "While the Dragons and Dwarves tear the mountains apart, the Mages will be exposed. Our allied armies will strike them from the surface, ending their threat for good." },
      { emisor: "orc", text: "(A low, rumbling laugh) Roric... that old fox. He sees a mutual enemy and a perfect distraction. Using the Dwarves as an anvil while we act as the hammer..." },
      { emisor: "orc", text: "Very well. Tell your 'Stonewall' General he has his pact. The Iron Claws hunger for a real fight. This will be... glorious." },
      { emisor: "orc", text: "Now get out of my sight. And Kaelen... tell Roric that if this is a trick, my armies will march on his lands *after* we've feasted on the Mages." },
      { emisor: "warrior", text: "(Muttering to self as he leaves) He agreed too easily. The Mages are a threat, but... sacrificing the Dwarves feels wrong. The General is blind. I have to warn them." }
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
      },
      onComplete: () => {
        warrior.play("warrior_side_idle"); // rotate the warrior to turn around
        warrior.x -= 50;
        this.time.delayedCall(100, () => {
          warrior.flipX = true; // Make the spear match the hand
          warrior.play("warrior_front_walk");
          warrior.x += 50;
          startWalkingSteps();

          this.tweens.add({
            targets: warrior,
            y: 900,
            duration: 5000,
            ease: "linear",
            onComplete: () => {
              stopWalkingSteps();
              this.cameras.main.fadeOut(2000, 0, 0, 0);
              this.time.delayedCall(2000, () => {
                this.scene.start('MageSanctuary');
              });
            }
          });
        });
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
          // warrior turns arround and leaves
          // scene slowly goes black and music starts playing
          // swap to new scene (maybe other characters and their point of view)
        });
      }
    });

  }
}
