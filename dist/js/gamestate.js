var gameObjects = [];
/**
 * Default state
 **/
class GameState {
  preload() {
    game.load.image('belt', 'assets/sprites/belt.png');
    game.load.spritesheet('sushi', 'assets/sprites/sushi_01.png', 75, 75, 3);
  }
  create() {
    const belt1 = new Belt();
    gameObjects.push(belt1);
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
