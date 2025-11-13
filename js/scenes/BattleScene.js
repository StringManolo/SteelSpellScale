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

    //TODO: Art for battle menus UI
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
    
    // Initialize combat system
    this.initializeCombatSystem();
    
    this.enemy = this.add.image(400, 330, this.enemyConfig.key);
    this.enemy.setDisplaySize(175,175);
    
    // Add enemy name tag on top enemy
    this.enemyNameText = this.add.text(400, 190, this.enemyConfig.name, {
      fontSize: '20px',
      fill: '#fff',
      backgroundColor: '#000000'
    }).setPadding(5, 5, 5, 5)
      .setOrigin(0.5)
      .setAlpha(0.8);

    // Enemy HP bar
    this.createEnemyHPBar();

    // Load the warrior in the scene
    this.warrior = this.add.sprite(400, 650, 'warrior_basic_attack');
    this.warrior.setOrigin(0.5, 1);
    this.warrior.setDisplaySize(175, 175);
    this.warrior.setDepth(2);

    // Player HP bar
    this.createPlayerHPBar();

    // Battle UI
    this.createBattleUI();

    this.isAttacking = false;
    this.isPlayerTurn = true;
    this.battleEnded = false;

    // Play the battle music
    this.sound.play('battle_music', { loop: true });
  }

  initializeCombatSystem() {
    // Warrior stats
    this.warriorStats = {
      level: this.playerData?.level || 1,
      maxHp: this.playerData?.maxHp || 100,
      currentHp: this.playerData?.currentHp || 100,
      attack: this.playerData?.attack || 15,
      defense: this.playerData?.defense || 8,
      speed: this.playerData?.speed || 10,
      experience: this.playerData?.experience || 0
    };

    // Enemy stats based on enemy type
    const enemyStats = {
      'goat': { maxHp: 40, currentHp: 40, attack: 8, defense: 5, speed: 12, experience: 30, gold: 15 },
      'war_dwarf': { maxHp: 60, currentHp: 60, attack: 14, defense: 12, speed: 6, experience: 50, gold: 25 },
      'snake': { maxHp: 35, currentHp: 35, attack: 10, defense: 4, speed: 14, experience: 25, gold: 10 },
      'wolf': { maxHp: 45, currentHp: 45, attack: 12, defense: 6, speed: 16, experience: 35, gold: 18 },
      'fly': { maxHp: 30, currentHp: 30, attack: 7, defense: 3, speed: 18, experience: 20, gold: 8 },
      'war_blob': { maxHp: 50, currentHp: 50, attack: 9, defense: 10, speed: 4, experience: 40, gold: 20 },
      'war_orc': { maxHp: 70, currentHp: 70, attack: 16, defense: 10, speed: 8, experience: 60, gold: 30 },
      'magic_demon': { maxHp: 80, currentHp: 80, attack: 18, defense: 8, speed: 10, experience: 80, gold: 40 }
    };

    this.enemyStats = enemyStats[this.enemyConfig.key] || enemyStats['goat']; //fallback
  }

  createEnemyHPBar() {
    // HP bar background
    this.enemyHpBarBg = this.add.rectangle(400, 220, 200, 20, 0x000000);
    this.enemyHpBarBg.setStrokeStyle(2, 0xffffff);
    
    // HP bar
    this.enemyHpBar = this.add.rectangle(302, 220, 196, 16, 0x00ff00);
    this.enemyHpBar.setOrigin(0, 0.5);
    
    // HP text
    this.enemyHpText = this.add.text(400, 220, `${this.enemyStats.currentHp}/${this.enemyStats.maxHp}`, {
      fontSize: '14px',
      fill: '#fff'
    }).setOrigin(0.5);
  }

  createPlayerHPBar() {
    // HP bar background
    this.playerHpBarBg = this.add.rectangle(400, 480, 200, 20, 0x000000);
    this.playerHpBarBg.setStrokeStyle(2, 0xffffff);
    
    // HP bar
    this.playerHpBar = this.add.rectangle(302, 480, 196, 16, 0x00ff00);
    this.playerHpBar.setOrigin(0, 0.5);
    
    // HP text
    this.playerHpText = this.add.text(400, 480, `${this.warriorStats.currentHp}/${this.warriorStats.maxHp}`, {
      fontSize: '14px',
      fill: '#fff'
    }).setOrigin(0.5);

    // Player name and level
    this.playerInfoText = this.add.text(400, 445, `Warrior Lv.${this.warriorStats.level}`, {
      fontSize: '16px',
      fill: '#fff',
      backgroundColor: '#000000'
    }).setPadding(5, 5, 5, 5)
      .setOrigin(0.5)
      .setAlpha(0.8);
}

  createBattleUI() {
    // Battle menu background
    this.menuBg = this.add.rectangle(140, 527, 275, 140, 0x000000);
    this.menuBg.setAlpha(0.7);
    this.menuBg.setStrokeStyle(2, 0xffffff);

    // Battle options
    this.battleOptions = [
      { text: 'Attack', action: () => this.playerAttack() },
      { text: 'Magic', action: () => this.playerMagic() },
      { text: 'Item', action: () => this.playerItem() },
      { text: 'Flee', action: () => this.playerFlee() }
    ];

    this.optionTexts = [];
  
    const buttonWidth = 140;
    const buttonHeight = 40;
    const horizontalSpacing = 10;
    const verticalSpacing = 15;
    const startY = 490;

    this.battleOptions.forEach((option, index) => {
      // Calculate rows and colums for buttons
      const row = Math.floor(index / 2); // 2 buttons per row
      const col = index % 2; 

      // Calculate buttons positions
      const x = 30 + col * (buttonWidth + horizontalSpacing);
      const y = startY + row * (buttonHeight + verticalSpacing);
      const optionText = this.add.text(x, y, option.text, {
        fontSize: '18px',
        fill: '#fff',
        backgroundColor: '#333333'
      })
        .setOrigin(0, 0) 
        .setPadding(10, 5, 10, 5)
        .setInteractive({ useHandCursor: true });

      optionText.on('pointerdown', () => {
        if (this.isPlayerTurn && !this.battleEnded) {
          option.action();
        }
      });

      this.optionTexts.push(optionText);
    });

    // Battle log
    this.battleLog = this.add.text(140, /*470*/ 30, 'A wild ' + this.enemyConfig.name + ' appears!', {
      fontSize: '16px',
      fill: '#fff',
      backgroundColor: '#000000',
      wordWrap: { width: 500 } // TODO: need to increasse UI background size to allow big texts. Will need to debug this in the future for big numbers/enemy names.
    }).setOrigin(0.5);
  }

  updateHPBars() {
    // Update enemy HP bar
    const enemyHpPercent = this.enemyStats.currentHp / this.enemyStats.maxHp;
    this.enemyHpBar.width = 180 * enemyHpPercent;
    this.enemyHpBar.fillColor = enemyHpPercent > 0.5 ? 0x00ff00 : enemyHpPercent > 0.2 ? 0xffff00 : 0xff0000; // Set HP bar from green to red when half hp
    this.enemyHpText.setText(`${this.enemyStats.currentHp}/${this.enemyStats.maxHp}`);

    // Update player HP bar
    const playerHpPercent = this.warriorStats.currentHp / this.warriorStats.maxHp;
    this.playerHpBar.width = 180 * playerHpPercent;
    this.playerHpBar.fillColor = playerHpPercent > 0.5 ? 0x00ff00 : playerHpPercent > 0.2 ? 0xffff00 : 0xff0000;
    this.playerHpText.setText(`${this.warriorStats.currentHp}/${this.warriorStats.maxHp}`);
  }

  playerAttack() {
    if (!this.isPlayerTurn || this.battleEnded) return;

    this.isPlayerTurn = false;
    this.addToBattleLog('Warrior attacks!');
    
    this.startAttack();
  }

  playerMagic() {
    if (!this.isPlayerTurn || this.battleEnded) return;

    this.isPlayerTurn = false;
    this.addToBattleLog('No magic learned yet!');
    
    // Enemy turn after failed magic attempt
    this.time.delayedCall(1500, () => {
      this.enemyTurn();
    });
  }

  playerItem() {
    if (!this.isPlayerTurn || this.battleEnded) return;

    this.isPlayerTurn = false;
    this.addToBattleLog('No items available!');
    
    // Enemy turn after failed item attempt
    this.time.delayedCall(1500, () => {
      this.enemyTurn();
    });
  }

  playerFlee() {
    if (!this.isPlayerTurn || this.battleEnded) return;

    this.isPlayerTurn = false;
    const fleeChance = 0.7; // 70% chance to flee
    
    if (Math.random() < fleeChance) {
      this.addToBattleLog('Successfully fled from battle!');
      this.time.delayedCall(1500, () => {
        this.endBattle(false, true);
      });
    } else {
      this.addToBattleLog('Failed to flee!');
      this.time.delayedCall(1500, () => {
        this.enemyTurn();
      });
    }
  }

  calculateDamage(attacker, defender) {
    const baseDamage = attacker.attack - defender.defense / 2;
    const variance = baseDamage * 0.2; // 20% variance
    const damage = Math.max(1, Math.floor(baseDamage + (Math.random() * variance * 2 - variance)));
    
    // Critical hit chance (10%)
    const isCritical = Math.random() < 0.1;
    return {
      damage: isCritical ? damage * 2 : damage,
      isCritical: isCritical
    };
  }

  enemyTurn() {
    if (this.battleEnded) return;

    this.addToBattleLog(this.enemyConfig.name + ' attacks!');
    
    const damageResult = this.calculateDamage(this.enemyStats, this.warriorStats);
    this.warriorStats.currentHp = Math.max(0, this.warriorStats.currentHp - damageResult.damage);
    
    if (damageResult.isCritical) {
      this.addToBattleLog('Critical hit! ' + damageResult.damage + ' damage!');
    } else {
      this.addToBattleLog(this.enemyConfig.name + ' deals ' + damageResult.damage + ' damage!');
    }

    this.updateHPBars();

    // Check if player is defeated
    if (this.warriorStats.currentHp <= 0) {
      this.time.delayedCall(1500, () => {
        this.addToBattleLog('Warrior has been defeated!');
        this.time.delayedCall(1500, () => {
          this.endBattle(false, false);
        });
      });
    } else {
      this.time.delayedCall(1500, () => {
        this.isPlayerTurn = true;
        this.addToBattleLog('Your turn!');
      });
    }
  }

  addToBattleLog(message) {
    this.battleLog.setText(message);
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
          
          // Calculate and apply damage during the attack animation
          const damageResult = this.calculateDamage(this.warriorStats, this.enemyStats);
          this.enemyStats.currentHp = Math.max(0, this.enemyStats.currentHp - damageResult.damage);
          
          if (damageResult.isCritical) {
            this.addToBattleLog('Critical hit! ' + damageResult.damage + ' damage!');
          } else {
            this.addToBattleLog('Warrior deals ' + damageResult.damage + ' damage!');
          }
          
          this.updateHPBars();
          
          this.time.delayedCall(20, () => {
            this.warrior.setTexture('warrior_basic_attack_4');
            this.time.delayedCall(60, () => {
              // Go back to default animation after attack
              this.warrior.setTexture('warrior_basic_attack');

              // Restore warrior to default position and size
              this.tweens.add({
                targets: this.warrior,
                x: originalX,
                y: originalY,
                displayWidth: 175,
                displayHeight: 175,
                duration: 200,
                onComplete: () => {
                  this.isAttacking = false;
                  
                  // Check if enemy is defeated
                  if (this.enemyStats.currentHp <= 0) {
                    this.addToBattleLog(this.enemyConfig.name + ' defeated!');
                    this.time.delayedCall(1500, () => {
                      this.endBattle(true, false);
                    });
                  } else {
                    // Enemy's turn
                    this.time.delayedCall(1000, () => {
                      this.enemyTurn();
                    });
                  }
                }
              });
            });
          });
        });
      }
    });
  }

  endBattle(victory, fled) {
    this.battleEnded = true;
    this.isPlayerTurn = false;
    
    this.sound.stopAll();
    this.scene.stop();
    
    if (this.onBattleEnd) {
      let experience = 0;
      let gold = 0;
      
      if (victory && !fled) {
        experience = this.enemyStats.experience;
        gold = this.enemyStats.gold;
        
        // Update player stats
        const updatedPlayerData = {
          ...this.warriorStats,
          currentHp: this.warriorStats.currentHp, // Keep current HP after battle
          experience: this.warriorStats.experience + experience
        };
        
        this.onBattleEnd({
          victory: victory,
          fled: fled,
          experience: experience,
          gold: gold,
          enemy: this.enemyConfig.name,
          playerData: updatedPlayerData
        });
      } else {
        this.onBattleEnd({
          victory: victory,
          fled: fled,
          experience: 0,
          gold: 0,
          enemy: this.enemyConfig.name,
          playerData: this.warriorStats
        });
      }
    }
  }

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

  selectRandomEnemy(enemyPool) {
    // Calculate total weight
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
