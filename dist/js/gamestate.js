var gameObjects = [];
var player;
/**
 * Default state
 **/
class GameState {
  preload() {
    game.load.image('belt', 'assets/sprites/belt.png');
    game.load.image('player', 'assets/sprites/player.png');
    game.load.spritesheet('sushi', 'assets/sprites/sushi_01.png', 75, 75, 3);
  }
  create() {

    const player = new Player();
    player.x = game.camera.bounds.centerX;
    player.y = game.camera.bounds.bottom;
    gameObjects.push(player);

    const belt1 = new Belt();
    gameObjects.push(belt1);

    const belt2 = new Belt();
    gameObjects.push(belt2);
    belt2.direction = -1;
    belt2.y = belt1.y + belt1.sprite.height;
    belt1.nextBelt = belt2;

    const belt3 = new Belt();
    gameObjects.push(belt3);
    belt3.y = belt2.y + belt2.sprite.height;
    belt2.nextBelt = belt3;

    const sushi1 = new Sushi();
    gameObjects.push(sushi1);
    belt1.addItem(sushi1);
  }
  update() {
    for (var i = 0; i < gameObjects.length; i++) {
      gameObjects[i].update(game.time.physicsElapsed);
    }
  }
}
