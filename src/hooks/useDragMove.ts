import React, { DependencyList, useCallback, useEffect, useRef } from 'react';

export interface DragMoveState {
    isDragging: boolean;
    x: number;
    y: number;
}

export interface OnDragMove {
    (dx: number, dy: number, isDragging: boolean): void;
}

export interface OnDragStart {
    (event: React.MouseEvent<HTMLDivElement>): void;
}

const useDragMove = (onDragMove: OnDragMove, deps: DependencyList): OnDragStart => {
    const stateRef = useRef<DragMoveState>({
        isDragging: false,
        x: 0,
        y: 0,
    });

    const onDragStart = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        stateRef.current = {
            isDragging: true,
            x: event.clientX,
            y: event.clientY,
        };
    }, []);

    const onDragMoveMemoized = useCallback(onDragMove, deps);

    useEffect(() => {
        const onMouseMove = (event: MouseEvent) => {
            const { isDragging, x, y } = stateRef.current;

            if (isDragging) {
                event.preventDefault();
                onDragMoveMemoized(event.clientX - x, event.clientY - y, true);

                stateRef.current = {
                    isDragging: true,
                    x: event.clientX,
                    y: event.clientY,
                };
            }
        };

        const onDragEnd = () => {
            const { isDragging, x, y } = stateRef.current;

            if (isDragging) {
                onDragMoveMemoized(0, 0, false);
                stateRef.current = { isDragging: false, x, y };
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onDragEnd);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onDragEnd);
        };
    }, [onDragMoveMemoized]);

    return onDragStart;
};

export default useDragMove;
