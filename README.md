# 👾🥕 Alien Food Invasion
[![Latest Version on NPM](https://img.shields.io/npm/v/%40pmochine%2Fvee-validate-laravel.svg?style=flat-square)](https://npmjs.com/package/%40pmochine%2Fvee-validate-laravel)
[![Total Downloads on NPM](https://img.shields.io/npm/dt/%40pmochine%2Fvee-validate-laravel.svg)](https://www.npmjs.com/package/%40pmochine%2Fvee-validate-laravel)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)

![Alien Food Invasion](https://baianat.github.io/vee-validate/logo.png)

**If you are looking for an easy game for example when the Browser is offline and the User needs to wait, this package is for you. 😜**

## Installation in 2 Steps*

### 1: Install the package 💻 on [NPM](https://www.npmjs.com/package/@avidofood/foodinvasion)
```bash
npm i @pmochine/foodinvasion
```
### 2: Add the package in your main.js

```javascript
import startPlaying from '/@avidofood/FoodInvasion';

...
startPlaying();
```


## 💪 How to use it

Somewhere you html/vue/react and so on you need this:

```html
<div id="game-container">
    <canvas
        id="game"
        width="320"
        height="480"
    />
</div>
```


Example in Vue:


```vue
<template>
    <div>
        <div id="game-container">
            <transition name="tvScale">
                <canvas
                    v-show="showGame"
                    id="game"
                    width="320"
                    height="480"
                    />
            </transition>
        </div>
        <div>
            <button class="btn" type="button" @click="playGame">Play</button>
        </div>
    </div>

</template>
<script>
import startPlaying from '@modules/@avidofood/FoodInvasion/src/index';

export default {
    data() {
        return {
            showGame: false,
        };
    },
    methods: {
        playGame() {
            this.setShowGame();

            // tv animation takes some time
            setTimeout(() => {
                startPlaying();
            }, 401);
        },
        setShowGame() {
            this.showGame = true;
        },
    },
};
</script>
```

## Security

If you discover any security related issues, please don't email me. I'm afraid 😱. avidofood@protonmail.com

## Credits

Now comes the best part! 😍

- Game based on https://github.com/cykod/AlienInvasion

Oh come on. You read everything?? If you liked it so far, hit the ⭐️ button to give me a 🤩 face. 