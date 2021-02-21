const { Sequelize, DataTypes, Op } = require('sequelize');
const { combinations } = require('mathjs');
const { range } = require('lodash');
const Big = require('big.js');


const FIELD_SIZE = 25;
const PROFIT_PERCENT = -0.05;
const MIN_BOMBS_COUNT = 2;

let minesCoefsCache = null;

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

const generateMinesCoef = (fieldSize, bombsCount, step, profitPercent) => {
    const coef = ((1 + profitPercent) * combinations(fieldSize, step)) / combinations(fieldSize - bombsCount, step);
    return Math.floor(coef * 100) / 100;
};

const generateMinesCoefs = () => {
    minesCoefsCache = range(MIN_BOMBS_COUNT, FIELD_SIZE).map(bombsCount =>
        range(1, FIELD_SIZE - bombsCount + 1).map(step =>
            generateMinesCoef(FIELD_SIZE, bombsCount, step, PROFIT_PERCENT),
        ),
    );

    return minesCoefsCache;
};

const getMinesCoef = (bombsCount, step) => {
    if (minesCoefsCache === null) {
        minesCoefsCache = generateMinesCoefs();
    }

    return minesCoefsCache[bombsCount - MIN_BOMBS_COUNT][step - 1];
};

const sequelize = new Sequelize('mysql://root:OMHQ7rNPh0LozBnm5Jud@localhost:3306/playtime', {
    define: {
        freezeTableName: true,
    },
    logging: false,
});

const MinesGame = sequelize.define('MinesGame', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        get() {
            return this.getDataValue('id').toString();
        },
    },

    userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        get() {
            return this.getDataValue('userId').toString();
        },
    },

    betAmount: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
    },

    bombsCount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },

    fieldConf: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },

    stepsConf: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },

    status: {
        type: DataTypes.ENUM('InGame', 'Ended'),
        allowNull: false,
        defaultValue: 'InGame',
    },

    clientSeed: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    serverSeed: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    nonce: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
});

const addLeadingZeros = number => {
    return `0000000000000000000000000${number}`.slice(-25);
};

(async () => {
    const games = await MinesGame.findAll({
        where: {
            status: 'Ended',
            // createdAt: { [Op.gt]: new Date(2021, 1, 11) },
        },
    });

    const oaoaoa1 = games.map(game => {
        const bet = game.betAmount;
        const step = countOnes(game.stepsConf);

        if ((game.fieldConf & game.stepsConf) !== 0) {
            // console.log(bet, 0, game.bombsCount, step);
            return [0, bet, -bet];
        }

        const coef = getMinesCoef(game.bombsCount, step);
        // console.log(bet, coef, game.bombsCount, step);

        return [1, bet, coef * bet - bet];
    });

    const oaoaoa = oaoaoa1.reduce((acc, game) => [
        acc[0] + game[0],
        acc[1] + game[1],
        acc[2] + game[2],
    ], [0, 0, 0, 0]);

    console.log('Wins count', oaoaoa[0]);
    console.log('Games count', games.length);
    console.log('Bets sum', oaoaoa[1]);
    console.log('Profit sum', oaoaoa[2]);
    console.log('Profit percent', 100 * oaoaoa[2] / oaoaoa[1]);
})();