
const width = window.innerWidth;
const height = window.innerHeight;
const sizeDevice = {width, height}
const mobile =  width < 768
const laptop = width >= 992 && width < 1200
const desktop = width >= 1200
export { mobile, laptop, desktop, sizeDevice }