import GameManager from '../data/GameManager';

export default class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y){
    super(scene, x, y, 'char_idle');
    scene.add.existing(this);
    // Creates an Arcade Physics Body on a single Game Object.
    scene.physics.world.enableBody(this, 0);

    // Private attribute
    this._scene = scene;
    this._isUp = false;
    this._isJump = false;
    this._isFreeze = false;
    this._speed = 100;
    this._isFacingDoor = null;

    this.setDepth(1);
    this.setupAnimations();
    // this.body.setCollideWorldBounds(true);
  }

  update(keys){
    let onGround = this.body.blocked.down;
    if (onGround){
      this.isJump = false;
      if (this.body.velocity.x !== 0){
        this.play('player_run', true);
      }
      else if (this.isUp){
        this.play('player_back_idle', true);
      }
      else {
        this.play('player_idle', true);
      }
    }
    else {
      this.anims.stop();
      this.setTexture('char_run', 2);
    }
    if (this.freeze) return;
    // movement
    if ((keys.d.isDown || keys.right.isDown) && !this.isUp){
      this.flipX = false;
      this.body.setVelocityX(this._speed);
    }
    else if ((keys.a.isDown || keys.left.isDown) && !this.isUp){
      this.flipX = true;
      this.body.setVelocityX(-this._speed);
    }
    else if (keys.w.isDown || keys.up.isDown){
      this.body.setVelocityX(0);
      this.isUp = true;
    }
    else { // if do nothing
      this.body.setVelocityX(0);
      this.isUp = false;
    }

    if (keys.space.isDown && !this.isJump && !this.isUp){
      this.body.setVelocityY(-this._speed * 1.5);
      this.isJump = true;
    }

    if (Phaser.Input.Keyboard.JustDown(keys.space) && this.isUp){
      const isOverlap = this._scene.physics.world.overlap(
        this,
        this._scene.doorsGroup,
        (player, door) => {
          this._isFacingDoor = door.id;
        }
      );
      this.isJump = true;
      if (isOverlap){ // Action of choosen door
        GameManager.emitter.emit('event:openTheDoor', this._isFacingDoor);
      }
      if (this.scene.canOpenQuest){ // Action of read quest
        GameManager.emitter.emit('event:openQuest');
        this.canOpenQuest = false;
      }
    }

  }

  setupAnimations(){
    let anims = this._scene.anims;
    anims.create({
      key: 'player_idle',
      frames: anims.generateFrameNumbers('char_idle', {start: 0, end: 3}),
      frameRate: 4,
      repeat: -1
    });
    anims.create({
      key: 'player_back_idle',
      frames: anims.generateFrameNumbers('char_back_idle', {start: 0, end: 3}),
      frameRate: 4,
      repeat: -1
    });
    anims.create({
      key: 'player_run',
      frames: anims.generateFrameNumbers('char_run', {start: 0, end: 7}),
      frameRate: 12,
      repeat: -1
    });
  }

  set isJump(val){
    this._isJump = val;
  }

  get isJump(){
    return this._isJump;
  }

  set isUp(val){
    this._isUp = val;
  }

  get isUp(){
    return this._isUp;
  }

  set freeze(val){
    this._isFreeze = val;
  }

  get freeze(){
    return this._isFreeze;
  }
}