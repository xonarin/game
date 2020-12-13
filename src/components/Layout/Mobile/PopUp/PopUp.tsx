import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import s from './PopUp.scss';
import { cn } from '../../../../utils/bem-css-module';
import Text from '../../../Text/Text';
import Icon from '../../../Icon/Icon';
import LiveFeedTable from '../../../LiveFeedTable/Mobile/LiveFeedTable';
export interface PopUpProps {
    close: Function,
    children?: React.ReactNode,
    type?: String
}

const cnPopUp = cn(s, 'PopUp');

const items = [
    { id: 1, game: 'battle' as const, winner: 'Donald', chance: 36, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 2, game: 'dice' as const, winner: 'Donald', chance: 67, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 3, game: 'knb' as const, winner: 'Donald', chance: 10, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 4, game: 'dice' as const, winner: 'Donald', chance: 83, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 5, game: 'knb' as const, winner: 'Donald', chance: 67, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 6, game: 'battle' as const, winner: 'Donald', chance: 36, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
];
const PopUp: React.FC<PopUpProps> = ({ close, children }) => {
    useStyles(s);

    return (
        <div className={cnPopUp()}>
            <div className={cnPopUp("Container")}>
                <div className={cnPopUp("Header")}>
                    <div className={cnPopUp("Header-LeftSide")}>
                        {children}
                    </div>
                    <div className={cnPopUp("Header-RightSide")}>
                        <button type='button' onClick={() => close()}>
                            <Icon type='close' />
                        </button>
                    </div>

                </div>
                <div className={cnPopUp("Content")}>
                    <LiveFeedTable items={items} />
                </div>
            </div>

        </div>
    )
}

export default PopUp
