import { MouseEvent as ReactMouseEvent } from 'react';

export const isLeftClickEvent = (event: ReactMouseEvent<HTMLAnchorElement, MouseEvent>) => {
    return event.button === 0;
};

export const isModifiedEvent = (event: ReactMouseEvent<HTMLAnchorElement, MouseEvent>) => {
    return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
};
