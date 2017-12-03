var gameObjects = [];
var player;
var ui;
var belt1;
var SPAWNRATE = ENV.SPAWNRATE || 5000; // once every 5 seconds or the ENV
/**
 * Default state
 **/
class GameState {
  preload() {
    game.load.image('belt', 'assets/sprites/belt.png');
    game.load.image('player', 'assets/sprites/player.png');
    game.load.spritesheet('letters', 'assets/sprites/letters.png', 32, 32, 24);
    game.load.spritesheet('sushi', 'assets/sprites/sushi_01.png', 75, 75, 4);
    game.load.spritesheet('effects', 'assets/sprites/effects.png', 16, 16, 4);
    game.load.image('noodle', 'assets/sprites/noodle.png');
  }
  create() {
    ui = new UIManager();
    player = new Player();
    player.x = game.camera.bounds.centerX;
    player.y = game.camera.bounds.bottom;
    gameObjects.push(player);

    belt1 = new Belt({
      direction: 1,
      tier: 0,
    });
    gameObjects.push(belt1);

    const belt2 = new Belt({
      direction: -1,
      tier: 1,
    });
    gameObjects.push(belt2);
    belt2.y = belt1.y + belt1.sprite.height;
    belt1.nextBelt = belt2;

    const belt3 = new Belt({
      direction: 1,
      tier: 2,
    });
    gameObjects.push(belt3);
    belt3.y = belt2.y + belt2.sprite.height;
    belt2.nextBelt = belt3;

    // Hook up the belts and the player's signals
    [belt1, belt2, belt3].forEach(belt => {
      belt.connectSignals(player.signals);
      player.connectSignals(belt.signals);
    });
    setTimeout(() => {
      this.spawn();
    }, 500);
  }
  spawn() {
    const sushi1 = new Sushi();
    gameObjects.push(sushi1);
    belt1.addItem(sushi1);
    this._lastSpawn = Date.now();
  }
  update() {
    for (var i = 0; i < gameObjects.length; i++) {
      gameObjects[i].update(game.time.physicsElapsed);
    }
    ui.update();
    if (this._lastSpawn + SPAWNRATE < Date.now()) {
      this.spawn();
    }
  }
  render() {
    for (var i = 0; i < gameObjects.length; i++) {
      gameObjects[i].render();
    }
    ui.render();
  }
}
