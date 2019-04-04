import spritesPng from './images/sprites.png';

/**
 * We need to cache the image of the sprites right at the beginning!
 * Without that the game would not be loaded
 */
const spritesImages = new Image();
spritesImages.src = spritesPng;

export default spritesImages;
