import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './PopUp.scss';
import { cn } from '../../../../utils/bem-css-module';
import Icon from '../../../Icon/Icon';
import LiveFeedTable from '../../../LiveFeedTable/Mobile/LiveFeedTable';

export interface PopUpProps {
    close: Function;
    children?: React.ReactNode;
    type?: String;
}

const cnPopUp = cn(s, 'PopUp');

const PopUp: React.FC<PopUpProps> = ({ close, children }) => {
    useStyles(s);

    return (
        <div className={cnPopUp()}>
            <div className={cnPopUp('Container')}>
                <div className={cnPopUp('Header')}>
                    <div className={cnPopUp('Header-LeftSide')}>{children}</div>
                    <div className={cnPopUp('Header-RightSide')}>
                        <button type="button" onClick={() => close()}>
                            <Icon type="close" />
                        </button>
                    </div>
                </div>

                <div className={cnPopUp('Content')}>
                    <LiveFeedTable />
                </div>
            </div>
        </div>
    );
};

export default PopUp;
