function randomSeed(seed) {
    return function (min = 0, max = 1) {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        const randomValue = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        return Math.floor(min + randomValue * (max - min));
    };
}
export default randomSeed;
