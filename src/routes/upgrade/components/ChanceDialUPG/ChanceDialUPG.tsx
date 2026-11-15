import React, { useEffect, useRef, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ChanceDialUPG.scss';
import { cn } from '../../../../utils/bem-css-module';
import { formatPercent } from '../../format';

export interface ChanceDialUPGProps {
    /** Шанс 0…1, который видит игрок. */
    chance: number;
    rollRange: number;
    /** Окно выигрыша на шкале 0…rollRange-1 (включительно); null — цель не выбрана. */
    winStart: number | null;
    winEnd: number | null;
    /** Бросок последней игры: стрелка докручивается до него. */
    roll: number | null;
    /** Номер игры: меняется на каждый бросок (одинаковый roll подряд тоже прокручивает стрелку). */
    spinKey: number;
    /** Длительность прокрутки стрелки, мс. */
    spinMs: number;
    /** Итог показан (после прокрутки): подсветка окна. */
    outcome?: 'win' | 'lose' | null;
}

const cnDial = cn(s, 'ChanceDialUPG');

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 100;
const STROKE = 22;

/** Значение шкалы → угол от верха по часовой: середина шкалы — вверху, 0 и максимум — внизу. */
const toAngle = (value: number, rollRange: number) => (value / rollRange) * 360 - 180;

const polar = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: CENTER + RADIUS * Math.sin(rad), y: CENTER - RADIUS * Math.cos(rad) };
};

const arcPath = (fromDeg: number, toDeg: number) => {
    const from = polar(fromDeg);
    const to = polar(toDeg);
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${from.x} ${from.y} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${to.x} ${to.y}`;
};

const chanceLabel = (chance: number) => {
    if (chance >= 0.5) return 'высокий шанс';
    if (chance >= 0.2) return 'средний шанс';
    return 'низкий шанс';
};

/** Круговой индикатор шанса: окно выигрыша на круге и стрелка броска. */
const ChanceDialUPG: React.FC<ChanceDialUPGProps> = ({
    chance,
    rollRange,
    winStart,
    winEnd,
    roll,
    spinKey,
    spinMs,
    outcome,
}) => {
    useStyles(s);

    // Стрелка всегда крутится вперёд: к накопленному повороту добавляем несколько оборотов
    const [rotation, setRotation] = useState(180);
    const rotationRef = useRef(180);
    useEffect(() => {
        if (roll === null) return;
        const base = rotationRef.current - (rotationRef.current % 360);
        const next = base + 360 * 5 + ((toAngle(roll, rollRange) + 360) % 360);
        rotationRef.current = next;
        setRotation(next);
        // Только по новой игре: roll и rollRange читаются из её пропсов
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spinKey]);

    const hasWindow = winStart !== null && winEnd !== null;

    return (
        <div className={cnDial({ outcome: outcome ?? undefined })}>
            <svg className={cnDial('Svg')} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                <circle className={cnDial('Track')} cx={CENTER} cy={CENTER} r={RADIUS} strokeWidth={STROKE} />
                {hasWindow && (
                    <path
                        className={cnDial('Window')}
                        d={arcPath(toAngle(winStart!, rollRange), toAngle(winEnd! + 1, rollRange))}
                        strokeWidth={STROKE}
                    />
                )}
            </svg>

            <div
                className={cnDial('Needle')}
                style={{ transform: `rotate(${rotation}deg)`, transitionDuration: `${spinMs}ms` }}
            >
                <i className={cnDial('Arrow')} />
            </div>

            <div className={cnDial('Center')}>
                <span className={cnDial('Chance')}>{hasWindow ? formatPercent(chance) : '—'}</span>
                <span className={cnDial('Label')}>{hasWindow ? chanceLabel(chance) : 'выберите скины'}</span>
            </div>
        </div>
    );
};

export default ChanceDialUPG;
