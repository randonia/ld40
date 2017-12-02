var gameObjects = [];
/**
 * Default state
 **/
class GameState {
  preload() {
    game.load.image('belt', 'assets/sprites/belt.png');
  }
  create() {
    const belt1 = new Belt();
    gameObjects.push(belt1);
  }
  update() {
    for (var i = 0; i < gameObjects.length; i++) {
      gameObjects[i].update(game.time.physicsElapsed);
    }
  }
}
