/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable no-alert */
/* eslint-disable func-names */

import { startPlaying } from './game';

window.addEventListener('load', () => {
    window.events.$on('start-game', () => {
        startPlaying();
    });
});
