export class WorldMap extends Phaser.Scene { 
  constructor() {
    super({ key: 'WorldMap' }); 
  }

  preload() {
    this.load.image('grass', 'assets/tiles/terrain/grass.png'); 
    this.load.image('forest', 'assets/tiles/terrain/forest.png');
    this.load.image('mountain', 'assets/tiles/terrain/mountain.png'); 
    this.load.image('path', 'assets/tiles/terrain/path.png');
    this.load.image('water', 'assets/tiles/terrain/water.png'); 
    this.load.image('tree', 'assets/tiles/objects/tree.png'); 
    this.load.image('rock', 'assets/tiles/objects/rock.png');
    this.load.image('house', 'assets/tiles/objects/house.png'); 
    this.load.spritesheet('warrior', 'assets/sprites/warriorSpriteSheet.png', {
      frameWidth: 173 / 3,
      frameHeight: 123 / 2 
    }); 
    this.load.audio("map_music", "assets/audio/map.mp3"); 
    this.load.audio("warrior_step_audio", "assets/audio/walkingStep.wav"); 
    this.load.audio("menu_option_hover_sound", "assets/audio/optionHover.wav");
    this.load.audio("menu_button_sound", "assets/audio/buttonClick.wav"); 
    this.load.image('move_cursor', 'assets/images/cursor.png');
  } 

  create() {
    // alert = (arg) => console.log(arg); // I use this for Debug 
    this.sound.stopAll(); 
    const music = this.sound.add("map_music", {
      volume: 1, 
      loop: true
    }); 
    music.play();

    // map size to generate
    this.tileSize = 64;
    this.mapWidth = 50; 
    this.mapHeight = 100;

    // properties to find battles 
    this.lastPlayerTile = { x: 0, y: 0 };
    this.encounterChance = 0.3; // 30% when moving 
    this.encounterCooldown = 3; // Cooldown between battles 

    // logic
    this.createTileMap(); 
    this.createPlayer(); 
    this.setupPhysics(); // map objects 
    this.setupControls();
    this.setupCamera(); // centers camera on the character
    this.createMenuButton();
    this.createDropdownMenu(); 
    this.setupClickMovement(); 
    this.stepSound = this.sound.add("warrior_step_audio", { volume: 0.7 }); 
    this.isWalking = false;
    this.isMovingByClick = false; 
    this.setupCollisions(); // collisions with map objects
    this.updatePlayerTile(); 
  }

  // The right corner Menu button to check Stats, Save, Exit, etc. 
  createMenuButton() { 
    this.menuButton = this.add.text(
      this.cameras.main.width - 120, 
      75,
      'MENU', 
      { 
        fontSize: '30px',
        fill: '#ffffff', 
        backgroundColor: '#333333', 
        padding: { x: 15, y: 10 }
      } 
    )
      .setOrigin(0.5) 
      .setInteractive({ useHandCursor: true }) 
      .setDepth(1000)
      .setScrollFactor(0); 
    // Toggle Menu visibility
    this.menuButton.on('pointerdown', (pointer) => { 
      pointer.event.stopPropagation(); // Prevent the click from propagate to the ties behind the menu
      this.toggleDropdownMenu();
    }); 
  }

  // I hardcoded coordinates both in Menu button and dropdown list. 
  // This is hardcoded for 800 * 600 resolution. Can be made dinamic or hardcoded for other resolutions
  // I was having problems using methods to get object sizes (specially when calculating font size + padding + height / width + resolution + camera in movement + map size. 
  // Hardcoding fixed coordenates is easier to implement and has better performance.
  createDropdownMenu() { 
    // position of submenu based on Menu button position (using it as reference)
    const menuX = this.menuButton.x - 120; 
    const menuY = this.menuButton.y + this.menuButton.height + 10;

    this.dropdownMenu = this.add.container(menuX, menuY) 
      .setDepth(1001)
      .setVisible(false)
      .setScrollFactor(0) // this is similar to position: fixed; in CSS
      .setSize(150, 160) // Size for interaction
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, 150, 160), Phaser.Geom.Rectangle.Contains); // Add a Rectangle for "colisions"

    const menuBackground = this.add.rectangle(0, 0, 150, 160, 0x333333, 0.9)
      .setOrigin(0.5, 0)
      .setStrokeStyle(2, 0xffffff);

    this.dropdownMenu.add(menuBackground);

    // Menu options
    const menuOptions = [
      { text: 'Characters', action: () => this.showCharacters() },
      { text: 'Stats', action: () => this.showStats() },
      { text: 'Save', action: () => this.saveGame() },
      { text: 'Exit', action: () => this.exitGame() }
    ];

    const menuItemStyle = {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    };

    const menuItemHoverStyle = {
      fontSize: '18px', 
      fill: '#ffff00',
      fontFamily: 'Arial, sans-serif' 
    };

    // Hardcoded dropwown coordinates (used at isPointerOnMenu)
    this.dropdownMenuCoords = {
      left: 575, // x is (right - left) / 2
      right: 730,
      top: 70, // y is (bottom - top) / 2
      bottom: 245
    };

    // Set dimensions of each option (text) in the dropdown menu.
    const menuHeight = this.dropdownMenuCoords.bottom - this.dropdownMenuCoords.top; // 175
    const menuWidth = this.dropdownMenuCoords.right - this.dropdownMenuCoords.left; // 155
    const optionHeight = menuHeight / menuOptions.length; // 43.75 (4 options)

    // Set areas of detection for hover and click
    this.optionAreas = menuOptions.map((option, index) => {
      const optionTop = this.dropdownMenuCoords.top + (index * optionHeight);
      const optionBottom = optionTop + optionHeight;

      return {
        left: this.dropdownMenuCoords.left,
        right: this.dropdownMenuCoords.right,
        top: optionTop,
        bottom: optionBottom,
        action: option.action,
        text: option.text
      };
    });

    this.optionElements = [];
    menuOptions.forEach((option, index) => {
      const yPos = 10 + (index * 35);

      // Set a rectangle for each option
      const optionBackground = this.add.rectangle(0, yPos, 140, 30, 0x444444, 0)
        .setOrigin(0.5, 0);

      const optionButton = this.add.text(0, yPos, option.text, menuItemStyle)
        .setOrigin(0.5, 0);

      // Save them in the references
      this.optionElements.push({
        background: optionBackground,
        text: optionButton,
        index: index
      });

      this.dropdownMenu.add(optionBackground);
      this.dropdownMenu.add(optionButton);
    });

    // Track option being hovered
    this.currentHoveredOption = -1;

    // Handle over
    this.input.on('pointermove', (pointer) => {
      if (!this.dropdownMenu.visible) return;

      let hoveredIndex = -1;

      // Track where mouse is
      for (let i = 0; i < this.optionAreas.length; i++) {
        if (this.isPointerOnOption(pointer, i)) {
          hoveredIndex = i;
          break;
        }
      }

      // Update styles on hover
      if (hoveredIndex !== this.currentHoveredOption) {
        // Reset style for the previous option (option not hovered anymore)
        if (this.currentHoveredOption !== -1) {
          const prevElement = this.optionElements[this.currentHoveredOption];
          prevElement.text.setStyle(menuItemStyle);
          prevElement.background.setFillStyle(0x444444, 0);
        }

        // Update styles for the current hovered option
        if (hoveredIndex !== -1) {
          const newElement = this.optionElements[hoveredIndex];
          this.sound.add("menu_option_hover_sound", { volume: 0.2, loop: false }).play();
          newElement.text.setStyle(menuItemHoverStyle);
          newElement.background.setFillStyle(0x555555, 0.8);
        }

        this.currentHoveredOption = hoveredIndex;
      }
    });

    // Click for options
    this.input.on('pointerdown', (pointer) => {
      if (!this.dropdownMenu.visible) return;

      for (let i = 0; i < this.optionAreas.length; i++) {
        if (this.isPointerOnOption(pointer, i)) {
          this.sound.add("menu_button_sound", { volume: 0.2, loop: false }).play();
          this.optionElements[i].text.setScale(0.95);
          pointer.event.stopPropagation();
          break;
        }
      }
    });

    this.input.on('pointerup', (pointer) => {
      if (!this.dropdownMenu.visible) return;

      for (let i = 0; i < this.optionAreas.length; i++) {
        if (this.isPointerOnOption(pointer, i)) {
          this.optionElements[i].text.setScale(1);
          this.optionAreas[i].action();
          this.hideDropdownMenu();
          pointer.event.stopPropagation();
          break;
        }
      }
    });

    // Close menu when clicking outside of it
    this.input.on('pointerdown', (pointer) => {
      if (this.dropdownMenu.visible && !this.isPointerOnMenu(pointer) && !this.isPointerOnAnyOption(pointer)) {
        this.hideDropdownMenu();
      }
    });

    // Update position when moving camera
    this.cameras.main.on('camerafollow', () => { 
      if (this.dropdownMenu.visible) {
        this.updateMenuPosition(); 
      } 
    });
  } 

  // Update menu position when camera moving 
  updateMenuPosition() { 
    const menuX = this.cameras.main.width - 190;
    const menuY = 40 + this.menuButton.height + 10; 
    this.dropdownMenu.setPosition(menuX, menuY);
    this.dropdownMenuCoords = {
      left: menuX - 75, // 150/2 = 75
      right: menuX + 75,
      top: menuY,
      bottom: menuY + 160
    };

    const menuOptions = [
      { text: 'Characters', action: () => this.showCharacters() },
      { text: 'Stats', action: () => this.showStats() },
      { text: 'Save', action: () => this.saveGame() },
      { text: 'Exit', action: () => this.exitGame() }
    ];

    // Recalculate area of options
    const menuHeight = this.dropdownMenuCoords.bottom - this.dropdownMenuCoords.top;
    const optionHeight = menuHeight / menuOptions.length;

    this.optionAreas = menuOptions.map((option, index) => {
      const optionTop = this.dropdownMenuCoords.top + (index * optionHeight);
      const optionBottom = optionTop + optionHeight;

      return {
        left: this.dropdownMenuCoords.left,
        right: this.dropdownMenuCoords.right,
        top: optionTop,
        bottom: optionBottom,
        action: option.action,
        text: option.text
      };
    });
  } 

  // Toggle menu visibility
  toggleDropdownMenu() { 
    if (this.dropdownMenu.visible) {
      this.hideDropdownMenu(); 
    } else {
      this.showDropdownMenu(); 
    }
  } 

  showDropdownMenu() {
    this.updateMenuPosition(); 
    this.dropdownMenu.setVisible(true);
  } 

  hideDropdownMenu() {
    this.dropdownMenu.setVisible(false);
    // Reset hover state when hidden menu
    if (this.currentHoveredOption !== -1) {
      const element = this.optionElements[this.currentHoveredOption];
      element.text.setStyle({
        fontSize: '18px',
        fill: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      });
      element.background.setFillStyle(0x444444, 0);
      this.currentHoveredOption = -1;
    }
  }

  // Check if mouse is on top of menu button or dropdown menu
  isPointerOnMenu(pointer) {
    const x = pointer.x; 
    const y = pointer.y; 

    // Haedcoded menu coordinates
    const menuButtonLeft = 662;
    const menuButtonRight = 800;
    const menuButtonTop = 0;
    const menuButtonBottom = 65;

    if (x >= menuButtonLeft && x <= menuButtonRight && y >= menuButtonTop && y <= menuButtonBottom) {
      return true;
    }

    if (this.dropdownMenu.visible) {
      if (x >= this.dropdownMenuCoords.left && x <= this.dropdownMenuCoords.right && 
        y >= this.dropdownMenuCoords.top && y <= this.dropdownMenuCoords.bottom) {
        return true;
      }
    }
    return false; 
  }

  // Test if mouse is on top of a specific option
  isPointerOnOption(pointer, optionIndex) {
    if (!this.optionAreas[optionIndex]) return false;

    const area = this.optionAreas[optionIndex];
    const x = pointer.x;
    const y = pointer.y;

    return x >= area.left && x <= area.right && y >= area.top && y <= area.bottom;
  }

  // Test if mouse is on top of any of the options
  isPointerOnAnyOption(pointer) {
    if (!this.dropdownMenu.visible) return false;

    for (let i = 0; i < this.optionAreas.length; i++) {
      if (this.isPointerOnOption(pointer, i)) {
        return true;
      }
    }
    return false;
  }

  // Options menu logic
  showCharacters() { 
    console.log('Characters menu opened');
    alert('Characters menu opened'); 
    // TODO: Show characters menu
    // this.scene.pause(); 
    // this.scene.launch('CharacterScene');
  } 

  showStats() { 
    console.log('Stats menu opened');
    alert('Stats menu opened'); 
    // TODO: Show stats menu
    // this.scene.pause(); 
    // this.scene.launch('StatsScene'); 
  }

  saveGame() {
    console.log('Game saved'); 
    alert('Game saved');
    this.saveWorldState(); 
    // TODO: Implement Continue option of TitleMenu (load this scene with savedWorldState
    // TODO: Add stats logic, pass it to TitleMenu, handle it at TitleMenu
    // TODO: Option to export game state 
  } 

  exitGame() { 
    console.log('Exiting game...');
    // TODO: Show confirmation (About to exit game without saving)
    this.sound.stopByKey("map_music");
    this.scene.stop('WorldMap'); 
    this.scene.start("StartScreen");
  }

  updatePlayerTile() { 
    const currentTileX = Math.floor(this.player.x / this.tileSize);
    const currentTileY = Math.floor(this.player.y / this.tileSize); 
    // Detect if player swaped tile
    if (currentTileX !== this.lastPlayerTile.x || currentTileY !== this.lastPlayerTile.y) { 
      this.lastPlayerTile = { x: currentTileX, y: currentTileY };

      // get currentTile
      const currentGroundIndex = currentTileX * this.mapHeight + currentTileY; 
      if (currentGroundIndex >= 0 && currentGroundIndex < this.tileLayers.ground.length) { 
        const currentGround = this.tileLayers.ground[currentGroundIndex];

        // Test if battle is on cooldown
        if (this.encounterCooldown <= 0) { 
          this.checkRandomEncounter(currentGround);
        } else { 
          this.encounterCooldown--;
        } 
      } 
    }
  } 

  // Check if tile has enemy encounters
  checkRandomEncounter(currentGround) { 
    // Adapt probability based on terrain 
    let encounterRate = this.encounterChance;
    if (currentGround.texture.key === 'forest') { 
      encounterRate *= 1.5; // 15% more 
    } else if (currentGround.texture.key === 'path') {
      encounterRate *= 0.5; // 5% more 
    } else if (currentGround.texture.key === 'mountain') { 
      encounterRate = 0.5; // 5% more
    } 
    // Random encounter
    if (Math.random() < encounterRate) { 
      this.triggerBattle(currentGround);
    } 
  }

  triggerBattle(currentGround) {
    console.log("¡Enemy found!, starting battle..."); 
    console.log(`Sending ${currentGround.texture.key} terrain to BattleScene`);

    // Stop WorldMap.js scene
    this.scene.pause(); 
    this.saveWorldState(); 
    this.sound.stopByKey("map_music");

    // Stop steps 
    if (this.stepTimer) {
      this.stepTimer.remove(); 
      this.isWalking = false;
    } 
    // Stop movement
    if (this.isMovingByClick) { 
      this.isMovingByClick = false; 
      this.tweens.killTweensOf(this.player);
    } 
    // Start battle scene
    this.scene.launch('BattleScene', { 
      playerData: this.getPlayerData(), // send player stats to the scene
      terrain: currentGround.texture.key, // send actual terrain (tile) 
      onBattleEnd: (result) => this.onBattleEnd(result)
    }); 
    this.encounterCooldown = 5; // cooldown for battles per tiles
  } 

  // Data to send to the new scene 
  getPlayerData() {
    return {
      level: 1, // TODO: Save stats globally
      health: 100,
      maxHealth: 100,
      // TODO: Add more stats
      // TODO: Detect current terrain to load different battle backgrounda
    };
  }

  // Battle end callback
  onBattleEnd(result) {
    console.log("Battle ended: ", result);

    const music = this.sound.add("map_music", {
      volume: 1,
      loop: true
    });
    music.play();

    this.scene.resume();

    // Battle result logic
    if (result.victory) {
      // Player won
      console.log("¡Victory!");
    } else {
      // Player lost
      console.log("Defeat...");
      // TODO: kill player in hardcore 
    }
  } 

  // Save world state
  saveWorldState() { 
    const worldState = {
      playerPosition: { 
        x: this.player.x,
        y: this.player.y 
      },
      playerTile: this.lastPlayerTile, 
      encounterCooldown: this.encounterCooldown
    }; 
    this.registry.set('worldState', worldState); 
    console.log('World state saved');
  } 

  // Load world state 
  loadWorldState() {
    const worldState = this.registry.get('worldState'); 
    if (worldState) { 
      console.log('Loading saved world state');

      // Recover player possition before battle
      this.player.setPosition(worldState.playerPosition.x, worldState.playerPosition.y);      
      this.lastPlayerTile = worldState.playerTile;
      this.encounterCooldown = worldState.encounterCooldown || 0; 
      return true; 
    }
    return false; 
  }

  createTileMap() {
    this.tileLayers = { 
      ground: [],
      objects: [], 
      collisions: []
    }; 
    // Generate map randomly using available tiles
    // Map generation is very simple TODO: Make a better map generation (or use image as a map)
    for (let x = 0; x < this.mapWidth; x++) { 
      for (let y = 0; y < this.mapHeight; y++) {
        let tileType = 'grass'; 
        const noise = Math.random();
        if (noise < 0.2) tileType = 'forest'; 
        else if (noise < 0.25) tileType = 'path';
        else if (noise < 0.28) tileType = 'water'; 
        else if (noise < 0.31) tileType = "mountain"; 
        const tile = this.add.image(x * this.tileSize, y * this.tileSize, tileType) 
          .setOrigin(0) 
          .setDisplaySize(this.tileSize, this.tileSize);

        this.tileLayers.ground.push(tile); 

        // Water is also an obstacle 
        if (tileType === 'water') { 
          this.tileLayers.collisions.push(tile);
        } 
        if (Math.random() < 0.1 && tileType === 'grass') { 
          const objectType = Math.random() < 0.7 ? 'tree' : 'rock';
          const object = this.add.image(x * this.tileSize, y * this.tileSize, objectType)
            .setOrigin(0) 
            .setDisplaySize(this.tileSize, this.tileSize);

          this.tileLayers.objects.push(object); 
          this.tileLayers.collisions.push(object);
        } 
      }
    } 
    // Add points of interest (load new scenes when reached / tp to other maps) 
    this.addPOI(5, 5, 'house', 'Shop'); 
    this.addPOI(15, 15, 'rock', 'Mountains');
    // TODO: Add more POI based on story 
    // TODO: Spawn at orc castle 
    // Set map limits 
    this.mapBounds = { 
      width: this.mapWidth * this.tileSize,
      height: this.mapHeight * this.tileSize 
    }; 
  }

  // Custom tiles for POI
  addPOI(x, y, sprite, name) { 
    const poi = this.add.image(x * this.tileSize, y * this.tileSize, sprite) 
      .setOrigin(0)
      .setDisplaySize(this.tileSize, this.tileSize) 
      .setTint(0x88ff88);

    this.tileLayers.objects.push(poi);
    // this.tileLayers.collisions.push(poi); // Allow to step into POI 
    // Add Text on POI to indicate the player where he is going
    this.add.text(x * this.tileSize + this.tileSize/2, y * this.tileSize - 10, name, {
    fontSize: '12px',
      fill: '#ffffff', 
      backgroundColor: '#000000' 
    }).setOrigin(0.5);
  } 

  // Create the character on the map 
  createPlayer() { 
    this.player = this.physics.add.sprite(300, 300, 'warrior').setScale(1.5);
    this.player.setCollideWorldBounds(true); 
    this.player.body.setSize(20, 30);
    this.player.body.setOffset(5, 15); 
    this.createAnimations();
    this.player.play('warrior_front_idle'); 
    this.player.flipX = true; // fix spear side
  } 

  // Setup character animations
  createAnimations() { 
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
  }

  // Make character coliison with map limits
  setupPhysics() {
    this.physics.world.setBounds(0, 0, this.mapBounds.width, this.mapBounds.height);
  }

  // Setup Arrows and WASD controls for keyboard
  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.playerSpeed = 180; 
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W); 
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); 
  }

  // Setup camera following player
  setupCamera() { 
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, this.mapBounds.width, this.mapBounds.height);  
    this.cameras.main.setZoom(1.2);
  } 

  // Setup click/tap control for PC / Smartphone 
  setupClickMovement() {
    this.moveCursor = this.add.image(0, 0, 'move_cursor') 
      .setDisplaySize(this.tileSize/2, this.tileSize/2)
      .setAlpha(0) 
      .setDepth(1000);

    this.input.on('pointerdown', (pointer) => {
      // Verificar si se hizo clic en el menú o en sus opciones
      if (this.isPointerOnMenu(pointer) || this.isPointerOnAnyOption(pointer)) {
        return; // No mover al jugador si se hizo clic en el menú
      }

      if (this.isMovingByClick) return;

      const worldPoint = pointer.positionToCamera(this.cameras.main); 
      this.moveToTile(worldPoint.x, worldPoint.y);

      // Ocultar menú si está abierto
      if (this.dropdownMenu.visible) { 
        this.hideDropdownMenu();
      } 
    });

    this.input.on('pointermove', (pointer) => {
      const worldPoint = pointer.positionToCamera(this.cameras.main); 
      this.showMoveCursor(worldPoint.x, worldPoint.y);
    }); 
  }

  // Setup collisions with objects
  setupCollisions() { 
    // Create the objects for the collision engine
    this.collisionObjects = this.physics.add.staticGroup(); 
    // Add the existing objects to the collision collection
    this.tileLayers.collisions.forEach(obj => { 
      // Add the physics to the object 
      this.physics.add.existing(obj, true); // true == static body
      this.collisionObjects.add(obj); 
    }); 

    // Make character collide with objects 
    this.physics.add.collider(this.player, this.collisionObjects); 
  }

  showMoveCursor(x, y) {
    // Calculate closer tile 
    const tileX = Math.floor(x / this.tileSize) * this.tileSize + this.tileSize/2;
    const tileY = Math.floor(y / this.tileSize) * this.tileSize + this.tileSize/2;
    this.moveCursor.setPosition(tileX, tileY).setAlpha(0.7); 
  }

  // Check for collision at indicated possition
  checkCollisionAt(x, y) { 
    // Setup aux rectangle for dest possition
    const tempBounds = new Phaser.Geom.Rectangle( 
      x - this.player.body.width / 2, 
      y - this.player.body.height / 2,
      this.player.body.width, 
      this.player.body.height 
    );

    // Test aux rectangle against objects for collisions 
    for (const obj of this.tileLayers.collisions) {
      const objBounds = obj.getBounds(); 
      if (Phaser.Geom.Rectangle.Overlaps(tempBounds, objBounds)) { 
        return true; // Collision detected
      } 
    } 
    return false; // No collision
  } 

  // Test if there is collision on the way to dest 
  checkPathCollision(startX, startY, endX, endY) { 
    const steps = 10; // Const to setup steps (1 step per tile)
    const dx = (endX - startX) / steps; 
    const dy = (endY - startY) / steps;

    for (let i = 1; i <= steps; i++) {
      const checkX = startX + dx * i; 
      const checkY = startY + dy * i;

      if (this.checkCollisionAt(checkX, checkY)) { 
        return true; // Collision detected
      } 
    }

    return false; // No collision 
  }

  // Find shortest path before collision (aka, stop moving before collision)
  findNearestValidPosition(targetX, targetY) {
    const startTileX = Math.floor(this.player.x / this.tileSize); 
    const startTileY = Math.floor(this.player.y / this.tileSize);
    const targetTileX = Math.floor(targetX / this.tileSize); 
    const targetTileY = Math.floor(targetY / this.tileSize); 
    // Test around the object for available paths 
    for (let radius = 0; radius < 5; radius++) {
      for (let x = targetTileX - radius; x <= targetTileX + radius; x++) { 
        for (let y = targetTileY - radius; y <= targetTileY + radius; y++) { 
          // Test only around the object
          if (Math.abs(x - targetTileX) === radius || Math.abs(y - targetTileY) === radius) {
            const checkX = x * this.tileSize + this.tileSize/2; 
            const checkY = y * this.tileSize + this.tileSize/2; 
            // Make sure not going out of map boundaries 
            if (checkX >= 0 && checkX < this.mapBounds.width &&
              checkY >= 0 && checkY < this.mapBounds.height) { 
              // Assert there is no collision now before moving
              if (!this.checkCollisionAt(checkX, checkY) &&
                !this.checkPathCollision(this.player.x, this.player.y, checkX, checkY)) {
                return { x: checkX, y: checkY };
              }
            }
          }
        }
      }
    }

    // If there is no available path, do not even move
    return null;
  }

  moveToTile(targetX, targetY) {
    // Calculate destination tile
    const targetTileX = Math.floor(targetX / this.tileSize);
    const targetTileY = Math.floor(targetY / this.tileSize);

    const destination = {
      x: targetTileX * this.tileSize + this.tileSize/2,
      y: targetTileY * this.tileSize + this.tileSize/2
    };

    // Check if destination is between bounds
    if (destination.x < 0 || destination.x >= this.mapBounds.width ||
      destination.y < 0 || destination.y >= this.mapBounds.height) {
      return; 
    }

    // Chech for collisions before moving
    if (this.checkCollisionAt(destination.x, destination.y) ||
      this.checkPathCollision(this.player.x, this.player.y, destination.x, destination.y)) {
      // If there is collision, try to find an availbale path 
      const validPosition = this.findNearestValidPosition(targetX, targetY);
      if (!validPosition) { 
        return;
      } 
      // Update possition
      destination.x = validPosition.x; 
      destination.y = validPosition.y;
    } 
    // Calculate animation direction 
    const dx = destination.x - this.player.x;
    const dy = destination.y - this.player.y; 
    this.movePlayerTo(destination.x, destination.y, dx, dy); 
  }

  movePlayerTo(x, y, dx, dy) {
    this.isMovingByClick = true; 
    // Calculate player sprite movement direction 
    if (Math.abs(dx) > Math.abs(dy)) {
      // Side movement 
      if (dx > 0) {
        this.player.play('warrior_side_walk', true); 
        this.player.flipX = false; 
      } else {
        this.player.play('warrior_side_walk', true); 
        this.player.flipX = true;
      } 
    } else {
      // Vertical Movement 
      if (dy > 0) {
        this.player.play('warrior_front_walk', true); 
        this.player.flipX = true;
      } else { 
        this.player.play('warrior_back_walk', true);
      } 
    }

    // Play steps while moving
    this.stepSound.play(); 
    // Move the sprite 
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
    const duration = (distance / this.tileSize) * 300; // 300ms per tile 
    this.tweens.add({
      targets: this.player, 
      x: x, 
      y: y,
      duration: duration, 
      ease: 'Power2', 
      onComplete: () => {
        this.isMovingByClick = false; 
        this.player.play(this.getCurrentIdleAnimation(), true); 
        this.moveCursor.setAlpha(0);
        // Update tile and check for battles 
        this.updatePlayerTile();
      } 
    });

    // Hidde cursor while moving
    this.moveCursor.setAlpha(0); 
  }

  getCurrentIdleAnimation() {
    const currentAnim = this.player.anims.currentAnim; 
    if (!currentAnim) return 'warrior_front_idle';

    if (currentAnim.key.includes('side')) { 
      return 'warrior_side_idle';
    } else if (currentAnim.key.includes('back')) { 
      return 'warrior_back_idle'; 
    } else {
      return 'warrior_front_idle'; 
    } 
  }

  handleWalkingSound() { 
    const isMoving = this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0; 
    if (isMoving && !this.isWalking && !this.isMovingByClick) {
      this.isWalking = true; 
      this.stepSound.play();
      this.stepTimer = this.time.addEvent({ 
        delay: 500, 
        callback: () => {
          if (this.isWalking && !this.isMovingByClick) { 
            this.stepSound.play(); 
          }
        }, 
        loop: true
      }); 
    } else if (!isMoving && this.isWalking) {
      this.isWalking = false; 
      if (this.stepTimer) {
        this.stepTimer.remove(); 
      }
    } 
  }

  update(time, delta) { 
    // Ignore keyboard inputs if already being moved by click/tap
    if (this.isMovingByClick) { 
      this.player.body.setVelocity(0); 
      return;
    } 
    this.player.body.setVelocity(0); 
    // Arrows / WASD
    let moving = false; 
    if (this.cursors.left.isDown || this.keyA.isDown) { 
      this.player.body.setVelocityX(-this.playerSpeed);
      this.player.play('warrior_side_walk', true); 
      this.player.flipX = true; 
      moving = true;
    } else if (this.cursors.right.isDown || this.keyD.isDown) { 
      this.player.body.setVelocityX(this.playerSpeed);
      this.player.play('warrior_side_walk', true); 
      this.player.flipX = false;
      moving = true; 
    }

    if (this.cursors.up.isDown || this.keyW.isDown) {
      this.player.body.setVelocityY(-this.playerSpeed); 
      this.player.play('warrior_back_walk', true);
      moving = true; 
    } else if (this.cursors.down.isDown || this.keyS.isDown) {
      this.player.body.setVelocityY(this.playerSpeed); 
      this.player.play('warrior_front_walk', true);
      this.player.flipX = true; 
      moving = true;
    } 
    // Updatd tile, check for battles 
    if (moving) { 
      this.updatePlayerTile();
    } 
    // Idle sprite cuando no se mueve
    if (!moving && !this.isMovingByClick) { 
      const currentAnim = this.player.anims.currentAnim; 
      if (currentAnim) {
        if (currentAnim.key.includes('side')) { 
          this.player.play('warrior_side_idle', true); 
        } else if (currentAnim.key.includes('back')) {
          this.player.play('warrior_back_idle', true); 
        } else { 
          this.player.play('warrior_front_idle', true);
          //this.player.flipX = true; 
        } 
      }
    } 
    // Steps sound when using keyboard 
    this.handleWalkingSound();
  } 
}
