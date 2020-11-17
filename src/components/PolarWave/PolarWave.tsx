/* eslint-disable no-param-reassign */
import React, { useEffect, useRef } from 'react';

import useCanvasRendering from '../../hooks/useCanvasRendering';

interface Point {
    x: number;
    y: number;

    phi: number;
    alpha: number;

    r0: number;
    dr: number;
    period: number;
}

export interface PolarWaveProps {
    color: string | ((ctx: CanvasRenderingContext2D) => CanvasGradient);
    pointsCount: number;
    minRadius: number;
    maxRadius: number;
    rotationPeriod: number;

    minBound: number;
    maxBound: number;
    minOscillationPeriod: number;
    maxOscillationPeriod: number;

    className?: string;
}

const PI2 = Math.PI * 2;

const mid = (a: number, b: number) => {
    return a + (b - a) / 2;
};

const PolarWave: React.FC<PolarWaveProps> = ({
    color,
    pointsCount,
    minRadius,
    maxRadius,
    rotationPeriod,
    minBound,
    maxBound,
    minOscillationPeriod,
    maxOscillationPeriod,
    className,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointsRef = useRef<Point[]>([]);
    const fillStyleRef = useRef<string | CanvasGradient>('#ff0000');

    useEffect(() => {
        if (maxBound > maxRadius - minRadius) {
            throw new Error('PolarWave: Max bound should be less than delta of radius');
        }

        // Генерация точек
        pointsRef.current = new Array(pointsCount).fill(undefined).map((_0, index) => {
            const alpha = Math.random() * PI2;
            const dr = minBound + Math.random() * (maxBound - minBound);
            const r0 = minRadius + Math.random() * (maxRadius - minRadius - dr);

            return {
                x: 0,
                y: 0,
                phi: (PI2 / pointsCount) * index,
                alpha,
                r0,
                dr,
                period: minOscillationPeriod + Math.random() * (maxOscillationPeriod - minOscillationPeriod),
            };
        });
    }, [pointsCount, minRadius, maxRadius, minBound, maxBound, minOscillationPeriod, maxOscillationPeriod]);

    useCanvasRendering(
        canvasRef,
        (ctx, width, height, dt) => {
            const x0 = width / 2;
            const y0 = height / 2;
            const epsilonPhi = (dt / rotationPeriod) * PI2;

            // Update points
            pointsRef.current.forEach(point => {
                point.phi -= epsilonPhi;
                if (point.phi < -PI2) point.phi += PI2;

                point.alpha += (dt / point.period) * PI2;
                if (point.alpha > PI2) point.alpha -= PI2;

                const r = point.r0 + ((Math.sin(point.alpha) + 1) / 2) * point.dr;
                point.x = x0 + r * Math.cos(point.phi);
                point.y = y0 - r * Math.sin(point.phi);
            });

            ctx.clearRect(0, 0, width, height);

            ctx.save();
            ctx.lineWidth = 2;
            ctx.fillStyle = fillStyleRef.current;

            ctx.beginPath();

            // Draw points
            pointsRef.current.forEach((point, index, array) => {
                const nextPoint = array[index === array.length - 1 ? 0 : index + 1];

                ctx.quadraticCurveTo(point.x, point.y, mid(point.x, nextPoint.x), mid(point.y, nextPoint.y));
            });

            // Замыкание кривой
            const firstPoint = pointsRef.current[0];
            const secondPoint = pointsRef.current[1];
            ctx.quadraticCurveTo(
                firstPoint.x,
                firstPoint.y,
                mid(firstPoint.x, secondPoint.x),
                mid(firstPoint.y, secondPoint.y),
            );

            ctx.fill();

            ctx.restore();
        },
        ctx => {
            fillStyleRef.current = typeof color === 'function' ? color(ctx) : color;
        },
        [color, rotationPeriod],
    );

    return <canvas className={className} ref={canvasRef} />;
};

export default PolarWave;
