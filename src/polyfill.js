let lastTime = 0;
const vendors = ['ms', 'moz', 'webkit', 'o'];

for (let x = 0; x < vendors.length && !window.requestAnimationFrame; x += 1) {
    window.requestAnimationFrame = window[`${vendors[x]}RequestAnimationFrame`];
    window.cancelAnimationFrame = window[`${vendors[x]}CancelAnimationFrame`] || window[`${vendors[x]}CancelRequestAnimationFrame`];
}

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function requestAnimationFrame(callback) {
        const currTime = new Date().getTime();
        const timeToCall = Math.max(0, 16 - (currTime - lastTime));
        const id = window.setTimeout(() => { callback(currTime + timeToCall); },
            timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
}

if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function cancelAnimationFrame(id) {
        clearTimeout(id);
    };
}
