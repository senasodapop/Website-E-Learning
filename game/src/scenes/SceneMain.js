import GameManager from '../data/GameManager';
import SimpleButton from '../class/SimpleButton';
import CONST from '../data/const';
import Player from '../class/Player';

export default class SceneMain extends Phaser.Scene {
  constructor() {
    super('SceneMain');
  }

  create(){
    // Define our objects
    console.log(`Ready SceneMain! ${GameManager.signature}`);

    this.canOpenQuest;

    // add camera
    const cam = this.cameras.main;
    // make map from key 'map'
    const map = this.make.tilemap({ key: "map" });
    
    this.add.image(0, 0, 'bg_sky').setOrigin(0)
      .setScrollFactor(0, 1);
    // make image a tile that looping: width 400px and height 128px
    this.add.tileSprite(0, 0, 400, 128, 'bg_far').setOrigin(0)
      .setScrollFactor(0.85, 1);

    // Parameters are the name you gave the 'tileset' in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    // Mind the difference between [tileset] and [tilemap]
    const tilesetProps = map.addTilesetImage('OverWorldPropsTowns-extruded', 'tilesTown');
    const tilesetWorld = map.addTilesetImage('OverWorldTiles-extruded', 'tilesWorld');
    const tilesetOpen = map.addTilesetImage('OverWorldPropsTowns_open-ext', 'tilesTownOpen');

    const groundLayer = map.createStaticLayer("GroundLayer", tilesetWorld);
    const houseLayer = map.createStaticLayer("HouseLayer", tilesetProps);
    map.createStaticLayer("PropsLayer", tilesetProps).setDepth(.5);

    this.doorOpenLayer = map.createDynamicLayer("DoorOpenLayer", tilesetOpen);
    this.doorOpenLayer.forEachTile(tile => {
      console.log(tile.index);
      tile.alpha = 0;
    });

    // Physics map: setCollision, setCollisionBetween, setCollisionByProperty,
    // and setCollisionByExclusion.
    // The 13th tile through and including the 45th tile will be marked as colliding
    // worldLayer.setCollisionBetween(12, 44);
    groundLayer.setCollisionByProperty({collides: true});
    houseLayer.setCollisionByProperty({doors: true});

    GameManager.emitter.on('event:openTheDoor', this.openTheDoor.bind(this));
    GameManager.emitter.on('event:openQuest', this.openQuest.bind(this));

    // Define control keyboard
    let keyCodes = Phaser.Input.Keyboard.KeyCodes;
    this.keys = this.input.keyboard.addKeys({
      left: keyCodes.LEFT,
      right: keyCodes.RIGHT,
      up: keyCodes.UP,
      space: keyCodes.SPACE,
      w: keyCodes.W,
      a: keyCodes.A,
      d: keyCodes.D
    });

    // Find Objects that named 'SpawnPlayer' on map
    const spawnPlayer = map.findObject(
      "Objects", obj => obj.name === "SpawnPlayer"
    );

    this.createDoors(map);
    
    this.player = new Player(this, spawnPlayer.x, spawnPlayer.y);

    this.createWallsBound();

    // camera follow game object
    cam.startFollow(this.player);
    cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    // set collider
    this.physics.add.collider(this.player, groundLayer);

    this.renderAlphabet(map);
    this.placeSign(map);

    this.dialogPlugin.init(null, this);
    this.openingMessage();

  } // End of create()

  openingMessage(){
    this.dialogPlugin.setDialogText("Welcome to e-learning! Ahmad Arsyel Abdul H. Choose the house!", true);
    this.dialogPlugin.setNext('Actually, accepted answer is not fully correct.');
    this.dialogPlugin.setNext('I tested again on Chrome v53 and concatenation now.');
  }

  openQuest(){
    this.dialogPlugin.toggleWindow();
    this.dialogPlugin.setDialogText("Welcome to e-learning!", true);
    this.dialogPlugin.setNext('I tested again on Chrome v53 and concatenation now.');
  }

  openTheDoor(doorNum){
    // Called on: Player.js
    console.log(`Holla Door${doorNum}`);
    // Dilation index of tile as id = 799 + id
    let doorsIdx = [0, 0];
    switch (doorNum) {
      case 1:
        doorsIdx = [864, 865];
        break;
      case 2:
        doorsIdx = [868, 869];
        break;
      case 3:
        doorsIdx = [860, 861];
        break;
      case 4:
        doorsIdx = [872, 873];
        break;
    }
    this.doorOpenLayer.forEachTile(tile => {
      for (let i = 0; i < doorsIdx.length; i++) {
        if (tile.index == doorsIdx[i]){
          tile.alpha = 1; // Make the door visible, see line 40
        }
      }
    });
  }

  createWallsBound(){
    const walls = this.physics.add.group();

    let configWall = [
      {x: -5, y: 32}, // wallLeft
      {x: 390, y: 32} // wallRight
    ];

    for (let i = 0; i < configWall.length; i++) {
      const wall = this.physics.add.sprite(configWall[i].x, configWall[i].y, null)
        .setSize(4, 128);
      walls.add(wall);
      wall.body.setImmovable(); // will move with any collider
      wall.body.setAllowGravity(false); // not affected with gravity
      wall.setVisible(false);
    }
    
    // Set collider
    this.physics.add.collider(this.player, walls);
  }

  placeSign(map){
    const questPos = map.findObject(
      "Objects", obj => obj.name === "Quest"
    );
    this.questSign = this.physics.add.sprite(questPos.x, questPos.y + 1, 'quest');
    this.questSign.setOrigin(0);
    this.questSign.body.setAllowGravity(false);
    let tempY = this.questSign.y;
    this.tweens.add({
      targets : this.questSign,
      y : tempY - 4,
      duration : 1000,
      ease: 'Linear',
      yoyo: true,
      repeat: -1
    });
    this.physics.add.overlap(this.questSign, this.player,
      () => { this.canOpenQuest = true; });
  }

  renderAlphabet(map){
    let i = 1;
    let alphabet = ['A', 'B', 'C', 'D'];
    map.getObjectLayer('Objects')['objects']
      .forEach(obj => {
        if (obj.name == `Ans${i}`){
          this.make.text({
            x: obj.x,
            y: obj.y,
            text: alphabet[i-1],
            style: {
              font: 'bold 12px Arial',
              fill: '#fafafa'
            }
          });
          i++;
        }
      });
  }

  createDoors(map){
    let i = 1;
    this.doorsGroup = this.physics.add.staticGroup();
    // 'Objects' is referring to layer on Tiled, 'objects' is return an array
    map.getObjectLayer('Objects')['objects']
      .forEach(obj => {
        if (obj.name == `Door${i}`){
          let object = this.doorsGroup.create(obj.x + 4, obj.y, null)
            .setSize(4, 16)
            .setOrigin(0)
            .setVisible(false);
          object.id = i++;
        }
      });
    this.doorsGroup.refresh();
  }

  update(){
    // Running loop
    this.player.update(this.keys);

    this.canOpenQuest = false;

  } // End of update()
} // End of class
