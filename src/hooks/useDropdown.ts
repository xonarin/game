import { useState, useCallback, useRef, useEffect, RefObject } from 'react';

export type UseDropdownResult<T extends Element> = [RefObject<T>, boolean, () => void, () => void, () => void];

const ESC_KEY = 27;

const onEscapeKeyPress = (fn: () => void) => ({ keyCode }: KeyboardEvent) => (keyCode === ESC_KEY ? fn() : null);

const useDropdown = <T extends Element>(): UseDropdownResult<T> => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<T>(null);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(currentIsOpen => !currentIsOpen), []);

    useEffect(() => {
        const handleGlobalMouseDown = ({ target }: MouseEvent) => {
            if (ref.current && !ref.current.contains(target as Node | null)) {
                close();
            }
        };

        const handleGlobalKeydown = onEscapeKeyPress(close);

        document.addEventListener('mousedown', handleGlobalMouseDown);
        document.addEventListener('keydown', handleGlobalKeydown);

        return () => {
            document.removeEventListener('mousedown', handleGlobalMouseDown);
            document.removeEventListener('keydown', handleGlobalKeydown);
        };
    }, [close]);

    return [ref, isOpen, toggle, open, close];
};

export default useDropdown;
