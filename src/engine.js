/* eslint-disable guard-for-in */
/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-cond-assign */
/* eslint-disable no-param-reassign */


import sprites from './images/sprites.png';
import './base.css';

const Game = new function () {
    const boards = [];

    // Game Initialization
    this.initialize = function (canvasElementId, spriteData, callback) {
        this.canvas = document.getElementById(canvasElementId);

        this.playerOffset = 10;
        this.canvasMultiplier = 1;
        this.setupMobile();

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.ctx = this.canvas.getContext && this.canvas.getContext('2d');
        if (!this.ctx) {
            return;
        }

        this.setupInput();

        this.loop();

        if (this.mobile) {
            this.setBoard(4, new TouchControls());
        }

        SpriteSheet.load(spriteData, callback);
    };


    // Handle Input
    const KEY_CODES = { 37: 'left', 39: 'right', 32: 'fire' };
    this.keys = {};

    this.setupInput = function () {
        window.addEventListener('keydown', (e) => {
            if (KEY_CODES[e.keyCode]) {
                Game.keys[KEY_CODES[e.keyCode]] = true;
                e.preventDefault();
            }
        }, false);

        window.addEventListener('keyup', (e) => {
            if (KEY_CODES[e.keyCode]) {
                Game.keys[KEY_CODES[e.keyCode]] = false;
                e.preventDefault();
            }
        }, false);
    };


    let lastTime = new Date().getTime();
    const maxTime = 1 / 30;
    // Game Loop
    this.loop = function () {
        const curTime = new Date().getTime();
        requestAnimationFrame(Game.loop);
        let dt = (curTime - lastTime) / 1000;
        if (dt > maxTime) { dt = maxTime; }

        for (let i = 0, len = boards.length; i < len; i++) {
            if (boards[i]) {
                boards[i].step(dt);
                boards[i].draw(Game.ctx);
            }
        }
        lastTime = curTime;
    };

    // Change an active game board
    this.setBoard = function (num, board) { boards[num] = board; };


    this.setupMobile = function () {
        const container = document.getElementById('container');
        const hasTouch = !!('ontouchstart' in window);
        let w = window.innerWidth; let
            h = window.innerHeight;

        if (hasTouch) { this.mobile = true; }

        if (window.screen.width >= 1280 || !hasTouch) { return false; }

        if (w > h) {
            // eslint-disable-next-line no-alert
            alert('Please rotate the device and then click OK');
            w = window.innerWidth; h = window.innerHeight;
        }

        container.style.height = `${h * 2}px`;
        window.scrollTo(0, 1);

        h = window.innerHeight + 2;
        container.style.height = `${h}px`;
        container.style.width = `${w}px`;
        container.style.padding = 0;

        if (h >= this.canvas.height * 1.75 || w >= this.canvas.height * 1.75) {
            this.canvasMultiplier = 2;
            this.canvas.width = w / 2;
            this.canvas.height = h / 2;
            this.canvas.style.width = `${w}px`;
            this.canvas.style.height = `${h}px`;
        } else {
            this.canvas.width = w;
            this.canvas.height = h;
        }

        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '0px';
        this.canvas.style.top = '0px';
    };
}();


let SpriteSheet = new function () {
    this.map = { };

    this.load = function (spriteData, callback) {
        this.map = spriteData;
        this.image = new Image();
        this.image.onload = callback;
        this.image.src = sprites;
    };

    this.draw = function (ctx, sprite, x, y, frame) {
        const s = this.map[sprite];
        if (!frame) frame = 0;
        ctx.drawImage(this.image,
            s.sx + frame * s.w,
            s.sy,
            s.w, s.h,
            Math.floor(x), Math.floor(y),
            s.w, s.h);
    };

    return this;
}();

const TitleScreen = function TitleScreen(title, subtitle, callback) {
    let up = false;
    this.step = function (dt) {
        if (!Game.keys.fire) up = true;
        if (up && Game.keys.fire && callback) callback();
    };

    this.draw = function (ctx) {
        ctx.fillStyle = '#FFFFFF';

        ctx.font = 'bold 40px bangers';
        const measure = ctx.measureText(title);
        ctx.fillText(title, Game.width / 2 - measure.width / 2, Game.height / 2);

        ctx.font = 'bold 20px bangers';
        const measure2 = ctx.measureText(subtitle);
        ctx.fillText(subtitle, Game.width / 2 - measure2.width / 2, Game.height / 2 + 40);
    };
};


const GameBoard = function () {
    const board = this;

    // The current list of objects
    this.objects = [];
    this.cnt = {};

    // Add a new object to the object list
    this.add = function (obj) {
        obj.board = this;
        this.objects.push(obj);
        this.cnt[obj.type] = (this.cnt[obj.type] || 0) + 1;
        return obj;
    };

    // Mark an object for removal
    this.remove = function (obj) {
        const idx = this.removed.indexOf(obj);
        if (idx === -1) {
            this.removed.push(obj);
            return true;
        }
        return false;
    };

    // Reset the list of removed objects
    this.resetRemoved = function () { this.removed = []; };

    // Removed an objects marked for removal from the list
    this.finalizeRemoved = function () {
        for (let i = 0, len = this.removed.length; i < len; i++) {
            const idx = this.objects.indexOf(this.removed[i]);
            if (idx !== -1) {
                this.cnt[this.removed[i].type] -= 1;
                this.objects.splice(idx, 1);
            }
        }
    };

    // Call the same method on all current objects
    this.iterate = function (funcName, ...args) {
        // const args = Array.prototype.slice.call(arguments, 1);
        for (let i = 0, len = this.objects.length; i < len; i++) {
            const obj = this.objects[i];
            obj[funcName](obj, ...args);
        }
    };

    // Find the first object for which func is true
    this.detect = function (func) {
        for (let i = 0, val = null, len = this.objects.length; i < len; i++) {
            if (func.call(this.objects[i])) return this.objects[i];
        }
        return false;
    };

    // Call step on all objects and them delete
    // any object that have been marked for removal
    this.step = function (dt) {
        this.resetRemoved();
        this.iterate('step', dt);
        this.finalizeRemoved();
    };

    // Draw all the objects
    this.draw = function (ctx) {
        this.iterate('draw', ctx);
    };

    // Check for a collision between the
    // bounding rects of two objects
    this.overlap = function (o1, o2) {
        return !((o1.y + o1.h - 1 < o2.y) || (o1.y > o2.y + o2.h - 1)
             || (o1.x + o1.w - 1 < o2.x) || (o1.x > o2.x + o2.w - 1));
    };

    // Find the first object that collides with obj
    // match against an optional type
    this.collide = function (obj, type) {
        return this.detect(function () {
            if (obj !== this) {
                // eslint-disable-next-line no-bitwise
                const col = (!type || this.type & type) && board.overlap(obj, this);
                return col ? this : false;
            }
        });
    };
};

const Sprite = function () { };

Sprite.prototype.setup = function (sprite, props) {
    this.sprite = sprite;
    this.merge(props);
    this.frame = this.frame || 0;
    this.w = SpriteSheet.map[sprite].w;
    this.h = SpriteSheet.map[sprite].h;
};

Sprite.prototype.merge = function (props) {
    if (props) {
        // eslint-disable-next-line no-restricted-syntax
        for (const prop in props) {
            this[prop] = props[prop];
        }
    }
};

Sprite.prototype.draw = function (ctx) {
    SpriteSheet.draw(ctx, this.sprite, this.x, this.y, this.frame);
};

Sprite.prototype.hit = function (damage) {
    this.board.remove(this);
};


const Level = function (levelData, callback) {
    this.levelData = [];
    for (let i = 0; i < levelData.length; i++) {
        this.levelData.push(Object.create(levelData[i]));
    }
    this.t = 0;
    this.callback = callback;
};

Level.prototype.step = function (dt) {
    let idx = 0; const remove = []; let
        curShip = null;

    // Update the current time offset
    this.t += dt * 1000;

    //   Start, End,  Gap, Type,   Override
    // [ 0,     4000, 500, 'step', { x: 100 } ]
    while ((curShip = this.levelData[idx])
        && (curShip[0] < this.t + 2000)) {
    // Check if we've passed the end time
        if (this.t > curShip[1]) {
            remove.push(curShip);
        } else if (curShip[0] < this.t) {
            // Get the enemy definition blueprint
            const enemy = enemies[curShip[3]];
            const override = curShip[4];

            // Add a new enemy with the blueprint and override
            this.board.add(new Enemy(enemy, override));

            // Increment the start time by the gap
            curShip[0] += curShip[2];
        }
        idx += 1;
    }

    // Remove any objects from the levelData that have passed
    for (let i = 0, len = remove.length; i < len; i++) {
        const remIdx = this.levelData.indexOf(remove[i]);
        if (remIdx !== -1) this.levelData.splice(remIdx, 1);
    }

    // If there are no more enemies on the board or in
    // levelData, this level is done
    if (this.levelData.length === 0 && this.board.cnt[OBJECT_ENEMY] === 0) {
        if (this.callback) this.callback();
    }
};

Level.prototype.draw = function () { };


let TouchControls = function () {
    const gutterWidth = 10;
    const unitWidth = Game.width / 5;
    const blockWidth = unitWidth - gutterWidth;

    this.drawSquare = function (ctx, x, y, txt, on) {
        ctx.globalAlpha = on ? 0.9 : 0.6;
        ctx.fillStyle = '#CCC';
        ctx.fillRect(x, y, blockWidth, blockWidth);

        ctx.fillStyle = '#FFF';
        ctx.globalAlpha = 1.0;
        ctx.font = `bold ${3 * unitWidth / 4}px arial`;

        const txtSize = ctx.measureText(txt);

        ctx.fillText(txt,
            x + blockWidth / 2 - txtSize.width / 2,
            y + 3 * blockWidth / 4 + 5);
    };

    this.draw = function (ctx) {
        ctx.save();

        const yLoc = Game.height - unitWidth;
        this.drawSquare(ctx, gutterWidth, yLoc, '\u25C0', Game.keys.left);
        this.drawSquare(ctx, unitWidth + gutterWidth, yLoc, '\u25B6', Game.keys.right);
        this.drawSquare(ctx, 4 * unitWidth, yLoc, 'A', Game.keys.fire);

        ctx.restore();
    };

    this.step = function () { };

    this.trackTouch = function (e) {
        let touch;
        let x;

        e.preventDefault();
        Game.keys.left = false;
        Game.keys.right = false;
        for (let i = 0; i < e.targetTouches.length; i++) {
            touch = e.targetTouches[i];
            x = touch.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
            if (x < unitWidth) {
                Game.keys.left = true;
            }
            if (x > unitWidth && x < 2 * unitWidth) {
                Game.keys.right = true;
            }
        }

        if (e.type === 'touchstart' || e.type === 'touchend') {
            for (i = 0; i < e.changedTouches.length; i++) {
                touch = e.changedTouches[i];
                x = touch.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
                if (x > 4 * unitWidth) {
                    Game.keys.fire = (e.type === 'touchstart');
                }
            }
        }
    };

    Game.canvas.addEventListener('touchstart', this.trackTouch, true);
    Game.canvas.addEventListener('touchmove', this.trackTouch, true);
    Game.canvas.addEventListener('touchend', this.trackTouch, true);

    // For Android
    Game.canvas.addEventListener('dblclick', (e) => { e.preventDefault(); }, true);
    Game.canvas.addEventListener('click', (e) => { e.preventDefault(); }, true);

    Game.playerOffset = unitWidth + 20;
};


const GamePoints = function () {
    Game.points = 0;

    const pointsLength = 8;

    this.draw = function (ctx) {
        ctx.save();
        ctx.font = 'bold 18px arial';
        ctx.fillStyle = '#FFFFFF';

        const txt = `${Game.points}`;
        let i = pointsLength - txt.length; let
            zeros = '';
        while (i-- > 0) { zeros += '0'; }

        ctx.fillText(zeros + txt, 10, 20);
        ctx.restore();
    };

    this.step = function () { };
};
