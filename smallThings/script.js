// Slider album on flexbox
const album = document.querySelectorAll('.slider .img');
let currentIndex = 0;
album.forEach((item, i) => {
    item.addEventListener('click', () => {
        setIndex(i);
        currentIndex = i;
    })
});
const setIndex = (currentIndex) => {
    album.forEach((index, i) => {
        if (i == currentIndex) {
            index.classList.add('active');
        } else {
            index.classList.remove('active');
        }
    })
}
setInterval(() => {
    setIndex(currentIndex)
    currentIndex = (currentIndex + 1) % 5;
}, 1500);
// LED board
const board = document.querySelector('.board');
const doc = new DocumentFragment;
for (let i = 0; i < 1000; i++) {
    const item = document.createElement('div');
    const getByte = () => Math.round(Math.random() * 255);
    item.addEventListener('mouseover', () => {
        const color = {
            r: getByte(),
            g: getByte(),
            b: getByte(),
        }
        item.style.background = `rgb(${color.r}, ${color.g}, ${color.b})`;
        item.style.boxShadow = `0 2px 3px 2px rgba(${color.r}, ${color.g}, ${color.b}, ${120})`;
    })
    doc.append(item);
}
board.append(doc);