import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './MinesButton.scss';
import { cn } from '../../../../utils/bem-css-module';

type MinesButtonType = 'bomb' | 'gem';

export interface MinesButtonProps {
    cell: number;
    type?: MinesButtonType;
    isStepped?: boolean;
    onClick?: (cell: number) => void;
}

const cnMinesButton = cn(s, 'MinesButton');

const MinesButton: React.FC<MinesButtonProps> = ({ cell, type, isStepped, onClick }) => {
    useStyles(s);

    const handleClick = useCallback(() => {
        if (!isStepped && onClick) {
            onClick(cell);
        }
    }, [cell, isStepped, onClick]);

    return (
        <button
            className={cnMinesButton({ type, isStepped })}
            type="button"
            aria-label="Mines field cell"
            onClick={handleClick}
        >
            <i className={cnMinesButton('Icon')} />
        </button>
    );
};

export default MinesButton;
