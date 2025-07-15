const hourPlace = document.getElementById('hours'), minutePlace = document.getElementById('minutes'),
secondPlace = document.getElementById('seconds'), milSecPlace = document.getElementById('milliseconds');
const now = () => {
    return new Date();
}
const updateBigWatch = () => {
    hourPlace.textContent = now().getHours().toString().padStart(2, '0');
    minutePlace.textContent = now().getMinutes().toString().padStart(2, '0');
    secondPlace.textContent = now().getSeconds().toString().padStart(2, '0');
}
const updateMilSec = () => {
    milSecPlace.textContent = now().getMilliseconds().toString().padStart(3, '0');
}
setInterval(updateBigWatch, 500)
setInterval(updateMilSec, 10)