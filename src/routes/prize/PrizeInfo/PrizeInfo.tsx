import React, { useCallback, useContext } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './PrizeInfo.scss';
import { cn } from '../../../utils/bem-css-module';
import Text from '../../../components/Text/Text';
import AppContext from '../../../context';
import PrizeActivePromoCodeForm from '../PrizeActivePromoCodeForm/PrizeActivePromoCodeForm';
import PrizeCreatePromoCodeForm from '../PrizeCreatePromoCodeForm/PrizeCreatePromoCodeForm';
import useHasBonusQuery from '../../../hooks/graphql/bonus/useHasBonusQuery';
import useGetBonusMutation from '../../../hooks/graphql/bonus/useGetBonusMutation';

export type TabNameType = 'freeCoins' | 'activePromoCode' | 'createPromoCode';

export interface PrizeInfoProps {
    readonly selectedTab: TabNameType;
}

const cnPrizeInfo = cn(s, 'PrizeInfo');

export const PrizeInfo: React.FC<PrizeInfoProps> = ({ selectedTab }) => {
    useStyles(s);

    const { authProviders } = useContext(AppContext);
    const bot = authProviders?.telegramBot || null;
    const channel = authProviders?.telegramChannel || null;

    const { refetchHasBonus } = useHasBonusQuery();

    const { getBonusMutation, getBonusResult } = useGetBonusMutation();
    const onGetBonusClick = useCallback(async () => {
        await getBonusMutation();
        await refetchHasBonus();
    }, [getBonusMutation, refetchHasBonus]);

    return (
        <div className={cnPrizeInfo()}>
            <div className={cnPrizeInfo('Header')}>
                <span>НАШ TELEGRAM</span>
            </div>

            <div className={cnPrizeInfo('Groups')}>
                {channel && (
                    <a
                        href={`https://t.me/${channel}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cnPrizeInfo('Btn')}
                    >
                        Наш канал
                    </a>
                )}

                {bot && (
                    <a
                        href={`https://t.me/${bot}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cnPrizeInfo('Btn')}
                    >
                        Запустить бота
                    </a>
                )}
            </div>

            <div className={cnPrizeInfo('Content')}>
                {selectedTab === 'freeCoins' && (
                    <div>
                        <Text color="white">Чтобы получать каждый день до 3 рублей, нужно:</Text>
                        <ul>
                            <li>Подключить Telegram (если вход был через VK ID).</li>
                            <li>Подписаться на наш Telegram-канал.</li>
                            <li>Запустить бота (нажать «Старт»).</li>
                        </ul>
                    </div>
                )}

                {selectedTab === 'activePromoCode' && (
                    <div>
                        <Text color="white">Для активации промокодов вы должны:</Text>
                        <ul>
                            <li>Подключить Telegram (если вход был через VK ID).</li>
                            <li>Подписаться на наш Telegram-канал.</li>
                            <li>Запустить бота (нажать «Старт»).</li>
                        </ul>
                    </div>
                )}

                {selectedTab === 'createPromoCode' && (
                    <div>
                        <Text color="white">Для создания промокодов вы должны:</Text>
                        <ul>
                            <li>Иметь пополнений на сумму не менее 50 рублей.</li>
                            <li>Подписаться на наш Telegram-канал и запустить бота.</li>
                        </ul>
                    </div>
                )}
            </div>

            <div className={cnPrizeInfo('Action')}>
                {selectedTab === 'freeCoins' &&
                    (getBonusResult.data !== undefined ? (
                        <Text color="white">Вы получили {getBonusResult.data?.getBonus} монет</Text>
                    ) : (
                        <button
                            type="button"
                            className={cnPrizeInfo('Btn')}
                            disabled={getBonusResult.loading}
                            onClick={onGetBonusClick}
                        >
                            Получить
                        </button>
                    ))}

                {selectedTab === 'activePromoCode' && <PrizeActivePromoCodeForm />}

                {selectedTab === 'createPromoCode' && <PrizeCreatePromoCodeForm />}
            </div>
        </div>
    );
};
