const math = require('mathjs');

const g = 7;
const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
];

const g_ln = 607 / 128;
const p_ln = [
    0.99999999999999709182,
    57.156235665862923517,
    -59.597960355475491248,
    14.136097974741747174,
    -0.49191381609762019978,
    0.33994649984811888699e-4,
    0.46523628927048575665e-4,
    -0.98374475304879564677e-4,
    0.15808870322491248884e-3,
    -0.21026444172410488319e-3,
    0.2174396181152126432e-3,
    -0.16431810653676389022e-3,
    0.84418223983852743293e-4,
    -0.2619083840158140867e-4,
    0.36899182659531622704e-5,
];

// Spouge approximation (suitable for large arguments)
const lnGamma = z => {
    if (z < 0) return Number('0/0');
    let x = p_ln[0];
    for (let i = p_ln.length - 1; i > 0; --i) x += p_ln[i] / (z + i);
    const t = z + g_ln + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x) - Math.log(z);
};

const gamma = z => {
    if (z < 0.5) {
        return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    }
    if (z > 100) return Math.exp(lnGamma(z));

    let x = p[0];
    for (let i = 1; i < g + 2; i++) {
        x += p[i] / (z + i - 1);
    }
    const t = z + g - 0.5;

    return Math.sqrt(2 * Math.PI) * t ** (z - 0.5) * Math.exp(-t) * x;
};

const OPS = 10 ** 3;

const n = 25;
const x = 5;
const y = 4;

const nb = math.bignumber(n);
const xb = math.bignumber(x);
const yb = math.bignumber(y);

let now = Date.now();
let k = null;
for (let i = 0; i < OPS; ++i) {
    k = (95 / 100 / math.combinations(n - x, y)) * math.combinations(n, y);
}
console.info('Math.js Combinations:');
console.info('Time:', Date.now() - now);
console.info('k =', k);
console.info();

now = Date.now();
for (let i = 0; i < OPS; ++i) {
    k =
        ((((95 / 100) * math.factorial(n - x - y)) / math.factorial(n - x)) * math.factorial(n)) /
        math.factorial(n - y);
}
console.info('Math.js Factorial:');
console.info('Time:', Date.now() - now);
console.info('k =', k);
console.info();

now = Date.now();
for (let i = 0; i < OPS; ++i) {
    k =
        ((((95 / 100) * math.gamma(n - x - y + 1)) / math.gamma(n - x + 1)) * math.gamma(n + 1)) /
        math.gamma(n - y + 1);
}
console.info('Math.js Gamma:');
console.info('Time:', Date.now() - now);
console.info('k =', k);
console.info();

now = Date.now();
for (let i = 0; i < OPS; ++i) {
    k = (95 / 100 / math.combinations(nb.minus(xb), yb)) * math.combinations(nb, yb);
}
console.info('Math.js Combinations (Big Number):');
console.info('Time:', Date.now() - now);
console.info('k =', k);
console.info();

now = Date.now();
for (let i = 0; i < OPS; ++i) {
    k =
        ((((95 / 100) * math.factorial(nb.minus(xb).minus(yb))) / math.factorial(nb.minus(xb))) * math.factorial(nb)) /
        math.factorial(nb.minus(yb));
}
console.info('Math.js Factorial (Big Number):');
console.info('Time:', Date.now() - now);
console.info('k =', k);
console.info();

now = Date.now();
for (let i = 0; i < OPS; ++i) {
    k =
        ((((95 / 100) *
            math.gamma(
                nb
                    .minus(xb)
                    .minus(yb)
                    .plus(1),
            )) /
            math.gamma(nb.minus(xb).plus(1))) *
            math.gamma(nb.plus(1))) /
        math.gamma(nb.minus(yb).plus(1));
}
console.info('Math.js Gamma (Big Number):');
console.info('Time:', Date.now() - now);
console.info('k =', k);
console.info();

now = Date.now();
for (let i = 0; i < OPS; ++i) {
    k = ((((95 / 100) * gamma(n - x - y + 1)) / gamma(n - x + 1)) * gamma(n + 1)) / gamma(n - y + 1);
}
console.info('Custom Gamma:');
console.info('Time:', Date.now() - now);
console.info('k =', k);
console.info();

const countOnes = number => {
    let count = 0;
    let temp = number;

    while (temp > 0) {
        if ((temp & 1) === 1) {
            ++count;
        }
        temp >>= 1;
    }

    return count;
};

console.log(countOnes(7));
console.log(countOnes(2));
console.log(countOnes(0b11001000101));
