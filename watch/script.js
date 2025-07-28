// vars
const hourPlace = document.getElementById('hours'), minutePlace = document.getElementById('minutes'),
secondPlace = document.getElementById('seconds'), milSecPlace = document.getElementById('milliseconds');
let intervals = {}, buffer = 0, cache = 0;
// functions
const now = () => {
    return new Date();
}
const watchMode = () => {
    resetIntervals();
    intervals.updateBigWatch = setInterval(() => {
        updateBigWatch(now);
    }, 500);
    intervals.updateMilSec = setInterval(() => {
        updateMilSec(now);
    }, 10);
}
const stopwatchMode = () => {
    resetIntervals();
    resetUI();
    intervals.sw = setInterval(() => {
        buffer += 10;
        cache = buffer;
        const h = computeCache(3600 * 1000);
        const m = computeCache(60 * 1000);
        const s = computeCache(1000);
        let date = new Date(2025, 1, 1, h, m, s, cache);
        updateBigWatch(() => {return date});
        updateMilSec(() => {return date});
    }, 10);
}
const resetIntervals = () => {
    Object.values(intervals).forEach(i => {
        clearInterval(i);
    });
    intervals = {};
    buffer = 0;
}
const computeCache = (limit) => {
    if (cache >= limit) {
        const target = parseInt(cache / limit);
        cache -= target * limit;
        return target;
    } else {
        return 0;
    }
}
// render
const updateBigWatch = (call) => {
    hourPlace.textContent = call().getHours().toString().padStart(2, '0');
    minutePlace.textContent = call().getMinutes().toString().padStart(2, '0');
    secondPlace.textContent = call().getSeconds().toString().padStart(2, '0');
}
const updateMilSec = (call) => {
    milSecPlace.textContent = call().getMilliseconds().toString().padStart(3, '0');
}
const resetUI = () => {
    hourPlace.textContent = '00';
    minutePlace.textContent = '00';
    secondPlace.textContent = '00';
    milSecPlace.textContent = '000';
}
// listeners
document.getElementById('watchMode').addEventListener('click', watchMode);
document.getElementById('stopwatchMode').addEventListener('click', stopwatchMode);
// main
watchMode();