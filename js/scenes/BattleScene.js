export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data) {
    this.playerData = data.playerData;
    this.onBattleEnd = data.onBattleEnd;
  }

  preload() {
    this.load.audio("battle_music", "assets/audio/battle.mp3");
  }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x333333);
    
    this.add.text(400, 200, '¡BATTLE!', { 
      fontSize: '32px', 
      fill: '#fff' 
    }).setOrigin(0.5);
    
    const attackButton = this.add.rectangle(400, 350, 200, 50, 0xff0000)
      .setInteractive();
    
    this.add.text(400, 350, 'ATTACK', { 
      fontSize: '24px', 
      fill: '#fff' 
    }).setOrigin(0.5);
   
    attackButton.on('pointerdown', () => {
      const victory = Math.random() > 0.3; 
      
      this.sound.stopAll();
      this.scene.stop();
      
      // Callback with results
      if (this.onBattleEnd) {
        this.onBattleEnd({
          victory: victory,
          experience: victory ? 100 : 0,
          gold: victory ? 50 : 0
        });
      }
    });
    
    this.sound.play('battle_music', { loop: true });
  }
}
