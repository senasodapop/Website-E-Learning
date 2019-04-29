import Phaser from 'phaser';
import GameManager from './data/GameManager';
import SceneMain from './scenes/SceneMain';
import SceneBoot from './scenes/SceneBoot';
import DialogModalPlugin from './class/DialogModalPlugin';

let game;
let scenes = [];

window.onload = () => {
	scenes.push(SceneBoot);
	scenes.push(SceneMain);

	let config = {
		type: Phaser.WEBGL,
		parent: 'phaser-game',
		width: 128,
    height: 96,
    plugins: {
      scene: [
        { 
          key: 'DialogModalPlugin', 
          plugin: DialogModalPlugin, 
          mapping: 'dialogPlugin'
        }
      ]
    },
		backgroundColor: '#1b2632',
    pixelArt: true,
    zoom: 5,
    seed: [(Date.now() * Math.random()).toString()],
		physics: {
			default: 'arcade',
			arcade: {
				gravity: {y: 500},
				debug: false
			}
		},
		scene: scenes
	};
	game = new Phaser.Game(config);
	window.focus();
  // resize();
  // window.addEventListener("resize", resize, false);

	GameManager.height = config.height;
	GameManager.width = config.width;
	GameManager.heightCenter = config.height * .5;
	GameManager.widthCenter = config.width * .5;
	GameManager.emitter = new Phaser.Events.EventEmitter();
};

function resize() {
  let canvas = document.querySelector("canvas");
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;
  let windowRatio = windowWidth / windowHeight;
  let gameRatio = game.config.width / game.config.height;
  if(windowRatio < gameRatio){
    canvas.style.width = windowWidth + "px";
    canvas.style.height = (windowWidth / gameRatio) + "px";
  }
  else{
    canvas.style.width = (windowHeight * gameRatio) + "px";
    canvas.style.height = windowHeight + "px";
  }
}
