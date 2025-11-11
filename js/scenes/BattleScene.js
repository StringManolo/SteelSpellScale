export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }
  
  init(data) {
    this.playerData = data.playerData;
    this.onBattleEnd = data.onBattleEnd;
    this.terrain = data.terrain;
  }
  
  preload() {
    // Load battle backgrounds 
    this.load.image('battle_grass', 'assets/images/battles/battle_grass.png');
    this.load.image('battle_forest', 'assets/images/battles/battle_forest.png');
    this.load.image('battle_mountain', 'assets/images/battles/battle_mountain.png');
    this.load.image('battle_dirt', 'assets/images/battles/battle_dirt.png');
    
    // Load basic enemies
    // TODO: Create sprites for enemies animations
    this.load.image('goat', 'assets/images/enemies/goat.png');
    this.load.image('war_dwarf', 'assets/images/enemies/war_dwarf.png');
    this.load.image('snake', 'assets/images/enemies/snake.png');
    this.load.image('wolf', 'assets/images/enemies/wolf.png');
    this.load.image('fly', 'assets/images/enemies/fly.png');
    this.load.image('war_blob', 'assets/images/enemies/war_blob.png');
    this.load.image('war_orc', 'assets/images/enemies/war_orc.png');
    this.load.image('magic_demon', 'assets/images/enemies/magic_demon.png');
    
    // Load warrior as a sprite
    // TODO: Make spritesheets for the warrior attacks
    // Add the animation of the attack on the enemy on the spritesheet
    /* this.load.spritesheet('warrior', 'assets/sprites/warriorSpriteSheet.png', {
      frameWidth: 173 / 3,
      frameHeight: 123 / 2
    });
    */
    
    // High quality assets for warrior attack animation
    this.load.image("warrior_basic_attack", "assets/images/battleAnimations/warrior_basic_1.png");
    this.load.image("warrior_basic_attack_2", "assets/images/battleAnimations/warrior_basic_2.png");
    this.load.image("warrior_basic_attack_3", "assets/images/battleAnimations/warrior_basic_3.png");
    this.load.image("warrior_basic_attack_4", "assets/images/battleAnimations/warrior_basic_4.png");
   
    // Sound effect for attack
    this.load.audio("warrior_slash", "assets/audio/warrior_slash.wav");
    // Battle music
    this.load.audio("battle_music", "assets/audio/battle.mp3");
  }
  
  create() {
    let backgroundKey = "battle_grass"; // default, should not matter
    const terrainMap = {
      'grass': 'battle_grass',
      'forest': 'battle_forest',
      'mountain': 'battle_mountain',
      'path': 'battle_dirt',
      'water': 'battle_grass'
    };
    
    // Set terrain send by WorldMap.js
    if (this.terrain && terrainMap[this.terrain]) {
      backgroundKey = terrainMap[this.terrain];
    }
    
    // Use terrain to set background image for combat
    const background = this.add.image(400, 300, backgroundKey);
    background.setDisplaySize(800, 600);
    
    // Load enemies based on terrain
    this.enemyConfig = this.getEnemyForTerrain(this.terrain);
    this.enemy = this.add.image(400, 330, this.enemyConfig.key);
    this.enemy.setDisplaySize(175,175);
    
    // Add enemy name tag on top enemy
    this.add.text(400, 350, this.enemyConfig.name, {
      fontSize: '20px',
      fill: '#fff',
      backgroundColor: '#000000'
    }).setOrigin(0.5);
    
    // Load the warrior in the scene
    this.warrior = this.add.sprite(400, 650, 'warrior_basic_attack');
    this.warrior.setOrigin(0.5, 1);
    this.warrior.setDisplaySize(175, 175);
    this.warrior.setDepth(2);
    
    this.isAttacking = false;
    
    this.input.off('pointerdown');
    this.input.on('pointerdown', () => {
      if (!this.isAttacking) { // avoid multiple attacks at same time
        this.startAttack();
      }
    });
   
    // Play the battle music
    this.sound.play('battle_music', { loop: true });
  }
  
  startAttack() {
    this.isAttacking = true;
    
    // Save warrior position before moving to attack
    const originalX = this.warrior.x;
    const originalY = this.warrior.y;
    
    // Move to the enemy and reduce size of the warrior
    this.tweens.add({
      targets: this.warrior,
      x: 400,
      y: 400,
      displayWidth: 175 * 0.7,
      displayHeight: 175 * 0.7,
      duration: 200,
      onComplete: () => {
        // Attack animation
        this.warrior.setTexture('warrior_basic_attack_2');
        
        this.time.delayedCall(25, () => {
          this.warrior.setTexture('warrior_basic_attack_3');
          this.sound.play('warrior_slash', { volume: 0.8 });
          
          this.time.delayedCall(20, () => {
            this.warrior.setTexture('warrior_basic_attack_4');
            
            this.time.delayedCall(60, () => {
              // Go back go default animation after attack
              this.warrior.setTexture('warrior_basic_attack');
              // TODO: Make it more like a two steps animation 

              // Restaurate warrior to default animation
              this.tweens.add({
                targets: this.warrior,
                x: originalX,
                y: originalY,
                displayWidth: 175,
                displayHeight: 175,
                duration: 200,
                onComplete: () => {
                  // Wait a couple seconds before closing scene, (sñto see the warrioir animation
                  // and to let the scene breath
                  this.time.delayedCall(2000, () => {
                    // Placeholder for combat system
                    const victory = Math.random() > 0.3;
                    this.sound.stopAll();
                    this.scene.stop();
                    
                    if (this.onBattleEnd) {
                      // Return some info based on victory / defeat
                      // TODO: In hardcore load death scene into title screen if defeat
                      this.onBattleEnd({
                        victory: victory,
                        experience: victory ? 100 : 0,
                        gold: victory ? 50 : 0,
                        enemy: this.enemyConfig.name
                      });
                    }
                  });
                }
              });
            });
          });
        });
      }
    });
  }
  
  // select enemies based on terrain + chance of finding the enemy in that terrain
  getEnemyForTerrain(terrain) {
    const enemyPools = {
      'mountain': [
        { key: 'goat', name: 'Mountain Goat', weight: 35 },
        { key: 'war_dwarf', name: 'War Dwarf', weight: 30 },
        { key: 'war_blob', name: 'War Blob', weight: 20 },
        { key: 'magic_demon', name: 'Magic Demon', weight: 5 },
        { key: 'wolf', name: 'Wolf', weight: 10 }
      ],
      'forest': [
        { key: 'snake', name: 'Forest Snake', weight: 40 },
        { key: 'wolf', name: 'Wolf', weight: 35 },
        { key: 'fly', name: 'Giant Fly', weight: 15 },
        { key: 'magic_demon', name: 'Magic Demon', weight: 5 },
        { key: 'war_orc', name: 'Forest Orc', weight: 5 }
      ],
      'grass': [
        { key: 'fly', name: 'Giant Fly', weight: 40 },
        { key: 'wolf', name: 'Wolf', weight: 30 },
        { key: 'snake', name: 'Snake', weight: 15 },
        { key: 'magic_demon', name: 'Magic Demon', weight: 5 },
        { key: 'goat', name: 'Goat', weight: 10 }
      ],
      'path': [
        { key: 'war_orc', name: 'Orc Warrior', weight: 40 },
        { key: 'fly', name: 'Giant Fly', weight: 25 },
        { key: 'wolf', name: 'Wolf', weight: 20 },
        { key: 'magic_demon', name: 'Magic Demon', weight: 5 },
        { key: 'snake', name: 'Snake', weight: 10 }
      ],
      'water': [ // Not implemented yet, walking on water not unlocked
        { key: 'fly', name: 'Giant Fly', weight: 40 },
        { key: 'snake', name: 'Water Snake', weight: 30 },
        { key: 'magic_demon', name: 'Magic Demon', weight: 10 },
        { key: 'wolf', name: 'Wolf', weight: 20 }
      ]
    };
    
    // If there is any problem processing terrain, just use grass
    const pool = enemyPools[terrain] || enemyPools['grass'];
   
    return this.selectRandomEnemy(pool);
  }
  
  // Select the enemy based on %
  selectRandomEnemy(enemyPool) {
    // Calcular peso total
    const totalWeight = enemyPool.reduce((sum, enemy) => sum + enemy.weight, 0);
    let random = Math.random() * totalWeight;
    let weightSum = 0;
    
    for (const enemy of enemyPool) {
      weightSum += enemy.weight;
      if (random <= weightSum) {
        return enemy;
      }
    }
    
    // Fallback: first enemy available
    return enemyPool[0];
  }
}
