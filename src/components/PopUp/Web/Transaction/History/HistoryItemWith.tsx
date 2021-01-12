import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../../../../utils/bem-css-module';
import Icon from '../../../../Icon/Icon';
import Text from '../../../../Text/Text';
import Button from '../../../../Button/Button';
import s from './HistoryItemWith.scss';

const cnHistory = cn(s, 'HistoryItem');

function HistoryItem() {
    const [toggle, setToggle] = useState(false);
    useStyles(s);

    return (
        <div className={cnHistory()}>
            <div className={cnHistory('Short-Info')}>
                <div className={cnHistory('Short-InfoLeft')} onClick={() => setToggle(!toggle)}>
                    <div className={cnHistory('Service')}>
                        <div className={cnHistory('Icon')}>
                            <Icon type="qiwi" />
                        </div>
                        <div className={cnHistory('Info')}>
                            <Text color="white">Qiwi</Text>
                            <Text color="white">#54544</Text>
                        </div>
                    </div>
                    <div className={cnHistory('Time')}>
                        <Text color="white">10.12.2020</Text>
                    </div>
                    <div className={cnHistory('Amount')}>
                        <Text color="white">
                            50 <Icon type="diamond" />
                        </Text>
                    </div>
                </div>

                <div className={cnHistory('Status')}>
                    <Button className={cnHistory('Status')}>Отменить</Button>
                </div>
            </div>
            {toggle ? (
                <div className={cnHistory('Description')}>
                    <Text color="white">
                        Сумма пополнения: 50 <Icon type="diamond" size="xs" />
                    </Text>
                    <Text color="white">Время пополения : 20.12.2020</Text>
                </div>
            ) : null}

            <div className={cnHistory('Short-Info')}>
                <div className={cnHistory('Short-InfoLeft')} onClick={() => setToggle(!toggle)}>
                    <div className={cnHistory('Service')}>
                        <div className={cnHistory('Icon')}>
                            <Icon type="qiwi" />
                        </div>
                        <div className={cnHistory('Info')}>
                            <Text color="white">Qiwi</Text>
                            <Text color="white">#54544</Text>
                        </div>
                    </div>
                    <div className={cnHistory('Time')}>
                        <Text color="white">10.12.2020</Text>
                    </div>
                    <div className={cnHistory('Amount')}>
                        <Text color="white">
                            50 <Icon type="diamond" />
                        </Text>
                    </div>
                </div>

                <div className={cnHistory('Status')}>
                    <Button className={cnHistory('Status')} color="green">
                        Выплачено
                    </Button>
                </div>
            </div>
            {toggle ? (
                <div className={cnHistory('Description')}>
                    <Text color="white">
                        Сумма пополнения: 50 <Icon type="diamond" size="xs" />
                    </Text>
                    <Text color="white">Время пополения : 20.12.2020</Text>
                </div>
            ) : null}

            <div className={cnHistory('Short-Info')}>
                <div className={cnHistory('Short-InfoLeft')} onClick={() => setToggle(!toggle)}>
                    <div className={cnHistory('Service')}>
                        <div className={cnHistory('Icon')}>
                            <Icon type="qiwi" />
                        </div>
                        <div className={cnHistory('Info')}>
                            <Text color="white">Qiwi</Text>
                            <Text color="white">#54544</Text>
                        </div>
                    </div>
                    <div className={cnHistory('Time')}>
                        <Text color="white">10.12.2020</Text>
                    </div>
                    <div className={cnHistory('Amount')}>
                        <Text color="white">
                            50 <Icon type="diamond" />
                        </Text>
                    </div>
                </div>

                <div className={cnHistory('Status')}>
                    <Button className={cnHistory('Status')} color="gray">
                        Отменено
                    </Button>
                </div>
            </div>
            {toggle ? (
                <div className={cnHistory('Description')}>
                    <Text color="white">
                        Сумма пополнения: 50 <Icon type="diamond" size="xs" />
                    </Text>
                    <Text color="white">Время пополения : 20.12.2020</Text>
                </div>
            ) : null}

            <div className={cnHistory('Short-Info')}>
                <div className={cnHistory('Short-InfoLeft')} onClick={() => setToggle(!toggle)}>
                    <div className={cnHistory('Service')}>
                        <div className={cnHistory('Icon')}>
                            <Icon type="qiwi" />
                        </div>
                        <div className={cnHistory('Info')}>
                            <Text color="white">Qiwi</Text>
                            <Text color="white">#54544</Text>
                        </div>
                    </div>
                    <div className={cnHistory('Time')}>
                        <Text color="white">10.12.2020</Text>
                    </div>
                    <div className={cnHistory('Amount')}>
                        <Text color="white">
                            50 <Icon type="diamond" />
                        </Text>
                    </div>
                </div>

                <div className={cnHistory('Status')}>
                    <Button className={cnHistory('Status')} color="orange">
                        В процессе
                    </Button>
                </div>
            </div>
            {toggle ? (
                <div className={cnHistory('Description')}>
                    <Text color="white">
                        Сумма пополнения: 50 <Icon type="diamond" size="xs" />
                    </Text>
                    <Text color="white">Время пополения : 20.12.2020</Text>
                </div>
            ) : null}
        </div>
    );
}

export default HistoryItem;
