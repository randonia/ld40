var game;
window.onload = () => {
  game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-container', new GameState());
}
