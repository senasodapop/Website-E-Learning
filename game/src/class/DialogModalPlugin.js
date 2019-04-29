export default class DialogModalPlugin extends Phaser.Plugins.BasePlugin {

  constructor (pluginManager){
    super('DialogModalPlugin', pluginManager);
  }

  init (opts, scene){
    if (!opts) opts = {}; // check to see if any optional parameters were passed
    this.scene = scene;
    console.log(`Plugin DialogModalPlugin is alive: ${this.scene}`);

    // set properties default
    this.borderThickness = opts.borderThickness || 2;
    this.borderColor = opts.borderColor || 0x907748;
    this.borderAlpha = opts.borderAlpha || 1;
    this.windowAlpha = opts.windowAlpha || 0.8;
    this.windowColor = opts.windowColor || 0x303030;
    this.windowHeight = opts.windowHeight || 36;
    this.padding = opts.padding || 5;
    this.closeBtnColor = opts.closeBtnColor || 'darkgoldenrod';
    this.dialogSpeed = opts.dialogSpeed || 3;

    // for checking text event is done
    this.isDoneTexting = false;
    // use for animating the text
    this.eventCounter = 0;
    // if dialog window is shown
    this.visible = true;
    // current text
    this.dialogText;
    // the text that will be displayed in the window
    this.dialog;
    this.graphics;
    this.closeBtn;

    this.currState = 0;
    this.nextState = [];

    // create the dialog
    this._createWindow();
  }

  _getGameWidth(){
    return this.scene.sys.game.config.width;
  }

  _getGameHeight(){
    return this.scene.sys.game.config.height;
  }

  _calculateWindowDimensions(width, height){
    let x = this.padding;
    let y = height - this.windowHeight - (this.padding * 11.6);
    let rectWidth = width - (this.padding * 1.7);
    let rectHeight = this.windowHeight;
    return {
      x, y, rectWidth, rectHeight
    };
  }

  // creates the inner dialog window (where the text is displayed)
  _createInnerWindow(x, y, rectWidth, rectHeight){~
    this.scene.add.graphics({ fillStyle: {color: 0xf0000ff} });
    this.graphics.fillStyle(this.windowColor, this.windowAlpha);
    this.graphics.fillRect(x + 1, y + 1, rectWidth - 1, rectHeight - 1);
    // make it can interactive
    this.graphics
      .setInteractive(new Phaser.Geom.Rectangle(x + 1, y + 1, rectWidth - 1, rectHeight - 1), Phaser.Geom.Rectangle.Contains)
      .on('pointerdown', this._skipAnimateTyping.bind(this));
  }

  _createOuterWindow(x, y, rectWidth, rectHeight){
    this.graphics.lineStyle(this.borderThickness, this.borderColor, this.borderAlpha);
    this.graphics.strokeRect(x, y, rectWidth, rectHeight);
  }

  _createWindow(){
    let gameWidth = this._getGameWidth();
    let gameHeight = this._getGameHeight();
    let dimensions = this._calculateWindowDimensions(gameWidth, gameHeight);

    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(10);

    this._createInnerWindow(dimensions.x, dimensions.y, dimensions.rectWidth, dimensions.rectHeight);
    this._createOuterWindow(dimensions.x, dimensions.y, dimensions.rectWidth, dimensions.rectHeight);
    this._createCloseModalButton();
    this._createCloseModalButtonBorder();
  }

  _createCloseModalButton(){   
    this.closeBtn = this.scene.make.text({
      x: this._getGameWidth() - this.padding * 2.2,
      y: this._getGameHeight() - (this.windowHeight * 2) - (this.padding * 4.2),
      text: 'X',
      style: {
        font: 'bold 8px Arial',
        fill: this.closeBtnColor
      }
    });
    this.closeBtn.setInteractive()
      .on('pointerover', () => { this.closeBtn.setTint(0xff0000); })
      .on('pointerout', () => { this.closeBtn.clearTint(); })
      .on('pointerdown', () => { this.toggleWindow(); });
    this.closeBtn.setDepth(10);
    this.closeBtn.setScrollFactor(0, 0);
  }

  _createCloseModalButtonBorder(){
    let x = this._getGameWidth() - this.padding - 8;
    let y = this._getGameHeight() - (this.windowHeight * 2) - (this.padding * 4.4);
    this.graphics.strokeRect(x, y, 9, 10);
    this.graphics.setScrollFactor(0, 0);
  }

  setNext(data){ // Not stack, but queue! FIX IT!
    this.nextState.push(data);
    this.currState = this.nextState.length - 1;
  }

  _skipAnimateTyping(){
    if (!this.isDoneTexting){
      let text = this._mergeText(this.dialog);
      this._setText(text);
      this.timedEvent.remove();
      this.isDoneTexting = true;
    }
    else{
      this._checkState();
      this.isDoneTexting = false;
    }
  }

  _mergeText(){
    let mergedTxet = "";
    for (let i = 0; i < this.dialog.length; i++) {
      mergedTxet += this.dialog[i];
    }
    return mergedTxet;
  }

  toggleWindow(){ 
    this.visible = !this.visible;
    if (this.dialogText) this.dialogText.visible = this.visible;
    if (this.graphics) this.graphics.visible = this.visible;
    if (this.closeBtn) this.closeBtn.visible = this.visible;
    if (this.timedEvent) this.timedEvent.remove();
    if (this.dialogText) this.dialogText.destroy();
    this.nextState = []; // cleaning state
    // tangled with player.update() for movement
    this.scene.player.freeze = false;
  }

  setDialogText(text, isAnimate){
    // reset text
    this.eventCounter = 0;
    this.dialog = text.split('');
    if (this.timedEvent) this.timedEvent.remove();
    if (this.dialogText) this.dialogText.destroy();

    // tangled with player.update() for movement
    this.scene.player.freeze = true;
    
    let tempText = isAnimate ? '' : text;
    this._setText(tempText);

    if (isAnimate){
      this.timedEvent = this.scene.time.addEvent({
        delay: 150 - (this.dialogSpeed * 30),
        callback: this._animateText.bind(this),
        loop: true
      });
    }
  }

  _animateText(){
    this.eventCounter++;
    this.dialogText.setText(this.dialogText.text + this.dialog[this.eventCounter - 1]);
    if (this.eventCounter == this.dialog.length){
      this.isDoneTexting = true;
      this.timedEvent.remove();
    }
  }

  _checkState(){
    if (this.currState >= 0){
      if (typeof this.nextState[this.currState] == "string"){
        console.log('Param is string');
        this.setDialogText(this.nextState[this.currState], true);
      }
      else if (typeof this.nextState[this.currState] == "function"){
        console.log('Param is function');
        this.nextState[this.currState].call;
      }
      this.currState--;
    }
    else {
      console.log('no next param. dialog end');
      this.toggleWindow();
    }
  }

  _setText(text){
    // reset dialog
    if (this.dialogText) this.dialogText.destroy();

    let x = this.padding + 2;
    let y = this._getGameHeight() - this.windowHeight - this.padding * 11.4;
    this.dialogText = this.scene.make.text({
      x,
      y,
      text,
      style: {
        font: 'bold 9px Arial',
        wordWrap: {width: this._getGameWidth() - (this.padding * 2.9)}
      }
    });
    this.dialogText.setDepth(10);
    this.dialogText.setScrollFactor(0, 0);

  }

}