import { DependencyList, RefObject, useCallback, useEffect, useMemo } from 'react';

import useMeasure from './useMeasure';
import useDeepRef from './useDeepRef';

export interface RenderFunction {
    (ctx: CanvasRenderingContext2D, width: number, height: number, dt: number): void;
}

export interface OnResizeFunction {
    (ctx: CanvasRenderingContext2D, width: number, height: number): void;
}

const useCanvasRendering = <T extends HTMLCanvasElement>(
    canvasRef: RefObject<T>,
    render: RenderFunction,
    onResize: OnResizeFunction = () => {},
    deps: DependencyList = [],
): void => {
    const canvas = canvasRef.current;
    const ctx = useMemo(() => canvas?.getContext('2d'), [canvas]);

    const snapshotRef = useDeepRef(useMeasure(canvasRef));
    const snapshot = snapshotRef.current;

    const memoizedRender = useCallback(render, deps);
    const memoizedOnResize = useCallback(onResize, deps);

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = snapshot.width; // eslint-disable-line no-param-reassign
            canvasRef.current.height = snapshot.height; // eslint-disable-line no-param-reassign
        }

        if (ctx) {
            memoizedOnResize(ctx, snapshot.width, snapshot.height);
        }
    }, [canvasRef, snapshot, memoizedOnResize, ctx]);

    useEffect(() => {
        let requestId: number;
        let lastTime: number | undefined;

        const tick = () => {
            if (!ctx) return; // TODO: Может имеет смысл выкинуть ошибку

            const currentTime = performance.now();
            const dt = lastTime === undefined ? 0 : currentTime - lastTime;

            memoizedRender(ctx, snapshotRef.current.width, snapshotRef.current.height, dt);

            requestId = window.requestAnimationFrame(tick);
            lastTime = currentTime;
        };

        requestId = window.requestAnimationFrame(tick);

        return () => {
            window.cancelAnimationFrame(requestId);
        };
    }, [canvasRef, ctx, memoizedRender, snapshotRef]);
};

export default useCanvasRendering;
