import { Dialogs } from "./../utils/Dialogs.js";

export class MageSanctuary extends Phaser.Scene {
  constructor() {
    super({ key: "MageSanctuary" });
  }

  preload() {
    this.load.image("sanctuary_background", "assets/images/sanctuary_background.png")
    this.load.image("magic_source", "assets/images/magic_source.png");
    this.load.image("magic_source_animated", "assets/images/magic_source_animated.png");

    this.load.image("dialog_background", "assets/images/dialog_background.png");
    
    this.load.image("lyra_portrait", "assets/images/archmage_lyra_portrait.png");
    this.load.image("faelan_portrait", "assets/images/mage_faelan_portrait.png");

    this.load.spritesheet("lyra", "assets/sprites/lyraSpriteSheet.png", {
      frameWidth: 736 / 3,
      frameHeight: 823 / 2
    });

    this.load.spritesheet("faelan", "assets/sprites/faelanSpriteSheet.png", {
      frameWidth: 937 / 3,
      frameHeight: 992 / 2
    });

    this.load.audio("dialog_sound", "assets/audio/dialog.wav");
    this.load.audio("dialog_typing", "assets/audio/dialog_typing.wav");
    
    this.load.audio("sanctuary_music", "assets/audio/sanctuary_music.mp3");
  }

  create() {
    const backgroundImage = this.add.image(400, 300, "sanctuary_background");
    backgroundImage.setDisplaySize(800, 600);

    // Give it a slight tween to make it feel alive
    // TODO: Add animation with "magic_source_animated" 
    const pool = this.add.image(400, 350, "magic_source").setScale(0.1);
    this.tweens.add({
      targets: pool,
      alpha: 0.8,
      yoyo: true,
      repeat: -1,
      duration: 2500,
      ease: "Sine.easeInOut"
    });

    // Stop all previous music (from NewGame scene) and play the new one
    // this.sound.stopAll(); // no need atm
    const music = this.sound.add("sanctuary_music", { 
      volume: 1, 
      loop: true 
    });
    music.play();


    this.anims.create({
      key: 'lyra_front_idle',
      frames: [{ key: 'lyra', frame: 0 }]
    });
    this.anims.create({
      key: 'lyra_front_walk',
      frames: [{ key: 'lyra', frame: 3 }]
    });
    this.anims.create({
      key: 'lyra_back_idle',
      frames: [{ key: 'lyra', frame: 1 }]
    });
    this.anims.create({
      key: 'lyra_back_walk',
      frames: [{ key: 'lyra', frame: 4 }]
    });
    this.anims.create({
      key: 'lyra_side_idle',
      frames: [{ key: 'lyra', frame: 2 }]
    });
    this.anims.create({
      key: 'lyra_side_walk',
      frames: [{ key: 'lyra', frame: 5 }]
    });

    this.anims.create({
      key: 'faelan_front_idle',
      frames: [{ key: 'faelan', frame: 0 }]
    });
    this.anims.create({
      key: 'faelan_front_walk',
      frames: [{ key: 'faelan', frame: 3 }]
    });
    this.anims.create({
      key: 'faelan_back_idle',
      frames: [{ key: 'faelan', frame: 1 }]
    });
    this.anims.create({
      key: 'faelan_back_walk',
      frames: [{ key: 'faelan', frame: 4 }]
    });
    this.anims.create({
      key: 'faelan_side_idle',
      frames: [{ key: 'faelan', frame: 2 }]
    });
    this.anims.create({
      key: 'faelan_side_walk',
      frames: [{ key: 'faelan', frame: 5 }]
    });

    const lyra = this.add.sprite(405, 450, 'lyra').setOrigin(0.5, 1).setScale(0.2);
    const faelan = this.add.sprite(210, 440, 'faelan').setOrigin(0.5, 1).setScale(0.13);

    lyra.play('lyra_side_idle');
    lyra.flipX = true;
    faelan.play('faelan_back_idle');

    /*
    const startWalkingSteps = () => {
      // TODO: playFaelanStepAudio(); // lower sound than Warrior
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
*/

    const dialogs = new Dialogs(this, [
      { emisor: "faelan", text: "Archmage Lyra, the rumors are getting worse. Now they say we're using 'forbidden magic' to control dragons!" },
      { emisor: "faelan", text: "Where do they even get these lies? We can barely maintain the sanctuary's barrier!" },
      { emisor: "lyra", text: "Patience, Faelan. These are not casual lies. They are seeds of war, planted by a dark hand." },
      { emisor: "faelan", text: "Grommash... The Orc King. You truly believe he is behind this?" },
      { emisor: "lyra", text: "I am certain of it. He has coveted the Source for decades. He sees magic as a weapon, not the balance of our world." },
      { emisor: "lyra", text: "He knows he cannot breach our wards alone. So, he spins a tale of terror to make the other kingdoms do his dirty work." },
      { emisor: "faelan", text: "It's working! The Humans and Dwarves are being manipulated... used as his personal army!" },
      { emisor: "lyra", text: "They just sent Commander Kaelen to the Orc King's throne. A man of honor, but fatally loyal to General Roric. His mind has been poisoned." },
      { emisor: "faelan", text: "Kaelen?! But he's... reasonable! Surely if we just explained..." },
      { emisor: "lyra", text: "He would not believe us. Our words are only wind against the thunder of his marching armies. We have been isolated for too long." },
      { emisor: "faelan", text: "So we do nothing? We just... wait here to be slaughtered while Grommash wins?" },
      { emisor: "lyra", text: "No. We cannot save ourselves, but we may yet save the world. Our only hope is Kaelen." },
      { emisor: "lyra", text: "He saw the truth in Grommash's eyes... even if he does not know it yet. His conscience is our only ally." },
      { emisor: "faelan", text: "What do you mean? What can we do?" },
      { emisor: "lyra", text: "We must guide him. He believes he is racing to warn the Dwarves of *us*. Let him. His path will take him close to the Whisperwind Pass. Prepare the messenger." }
    ], {
      characterSettings: {
        lyra: {
          width: 150,
          height: 150,
          x: 100,
          y: 545
        },
        faelan: {
          width: 150,
          height: 150,
          x: 100,
          y: 545
        }
      },
      onComplete: () => {
        // Ilumintate stone while closing scene
        this.time.delayedCall(1500, () => {
          const animatedStone = this.add.image(400, 340, 'magic_source_animated').setScale(
 0.1);
        });

        // Fade out the music with the scene
        this.tweens.add({
          targets: music,
          volume: 0,
          duration: 2000
        });
        
        this.cameras.main.fadeOut(2000, 0, 0, 0);
        
        this.time.delayedCall(2000, () => {
          alert("Starting the first playable map controlling Kaelen (e.g., 'WorldMap')");
          
          // this.scene.start('WorldMap'); 
        });
      }
    });

    this.cameras.main.fadeIn(1700, 0, 0, 0);
    
    this.time.delayedCall(2000, () => {
      faelan.play('faelan_side_walk');
      this.tweens.add({
        targets: faelan,
        x: 330,
        duration: 4000,
        ease: "linear",
        onComplete: () => {
          faelan.play('faelan_side_idle');
        }
      });
    });


    // Wait before starting dialogs 
    this.time.delayedCall(4600, () => {
      dialogs.play();
    });

  
    this.time.delayedCall(8600, () => {
      lyra.play("lyra_back_idle");
    });


  }
}
