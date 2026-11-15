import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './TargetPanelUPG.scss';
import { cn } from '../../../../utils/bem-css-module';
import { ItemUpgFragment } from '../../../../__generated__/graphql';
import ItemCardUPG from '../ItemCardUPG/ItemCardUPG';

export interface TargetPanelUPGProps {
    target: ItemUpgFragment | null;
    /** Скин выигран в последней игре. */
    won: boolean;
    onClear: () => void;
}

const cnTarget = cn(s, 'TargetPanelUPG');

/** Правая верхняя панель: выбранный скин для выигрыша. */
const TargetPanelUPG: React.FC<TargetPanelUPGProps> = ({ target, won, onClear }) => {
    useStyles(s);

    return (
        <section className={cnTarget({ won })}>
            {target ? (
                <>
                    {won && <div className={cnTarget('Badge')}>Вы выиграли!</div>}
                    <button type="button" className={cnTarget('Close')} onClick={onClear} aria-label="Сбросить">
                        ×
                    </button>
                    <ItemCardUPG className={cnTarget('Card')} item={target} size="l" />
                </>
            ) : (
                <div className={cnTarget('Placeholder')}>Выберите скин, который хотите получить</div>
            )}
        </section>
    );
};

export default TargetPanelUPG;
