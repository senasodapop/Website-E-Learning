import GameManager from '../data/GameManager';
import CONST from '../data/const';

export default class SceneBoot extends Phaser.Scene {
  constructor() {
    super('SceneBoot');
  }

  preload(){
    // Load images and sounds
    this.load.image('bg_sky', 'assets/bg_sky.png');
    this.load.image('bg_far', 'assets/bg_far.png');
    this.load.image('quest', 'assets/crystal.png');
    this.load.spritesheet('char_idle', 'assets/char_idle.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('char_back_idle', 'assets/char_back_idle.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('char_run', 'assets/char_run.png', {
      frameWidth: 16,
      frameHeight: 16
    });

    // for static tile
    this.load.image('tilesTown', 'assets/maps/OverWorldPropsTowns-extruded.png');
    this.load.image('tilesTownOpen', 'assets/maps/OverWorldPropsTowns_open-ext.png');
    this.load.image('tilesWorld', 'assets/maps/OverWorldTiles-extruded.png');
    this.load.tilemapTiledJSON('map', 'assets/maps/e_learningMap.json');

    // Preload loading bar
    let styleText = {
      font: '8px monospace',
      fill: CONST.colors.black
    };
    let waitText = this.make.text({x: 0, y: 0, text: 'PLEASE WAIT', style: styleText});
    let assetText = this.make.text({
      x: waitText.x,
      y: waitText.y + 8,
      text: '',
      style: styleText
    });
    let loadingText = this.make.text({
      x: assetText.x,
      y: assetText.y + 8,
      text: '',
      style: styleText
    });
    this.load.on('progress', value => {
      // console.log(`Loading: ${parseInt(value * 100)} %`);
      loadingText.setText(`${parseInt(value * 100)} %`);
    });
    this.load.on('fileprogress', file => {
      assetText.setText('Loading asset: ' + file.key);
    });
    this.load.on('complete', () => {
      assetText.destroy();
      loadingText.destroy();
    });
    // End of loading
  }

  create(){
    // Define our objects
    console.log("Ready SceneBoot!");
    this.scene.start('SceneMain');
  }
}
