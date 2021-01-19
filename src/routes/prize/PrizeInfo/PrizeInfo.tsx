import React, { useCallback, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './PrizeInfo.scss';
import { cn } from '../../../utils/bem-css-module';
import Text from '../../../components/Text/Text';
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

    const [prize, setPrize] = useState<number | undefined>();

    const { hasBonus } = useHasBonusQuery();
    const getBonus = useGetBonusMutation();
    const onGetBonusClick = useCallback(async () => {
        const { data } = await getBonus();

        if (data) {
            setPrize(data.getBonus);
        }
    }, [getBonus]);

    return (
        <div className={cnPrizeInfo()}>
            <div className={cnPrizeInfo('Header')}>
                {selectedTab === 'freeCoins' ? <span>НАШИ ГРУППЫ</span> : <span>ПРОМОКОДЫ В ГРУППАХ</span>}
            </div>

            <div className={cnPrizeInfo('Groups')}>
                <a href="/" className={cnPrizeInfo('Btn')}>
                    Вконтакте
                </a>

                <a href="/" className={cnPrizeInfo('Btn')}>
                    Телеграм
                </a>
            </div>

            <div className={cnPrizeInfo('Content')}>
                {selectedTab === 'freeCoins' && (
                    <Text color="white">Вступайте в группу ВК и получайте до 0.10 монет каждые 15 минут.</Text>
                )}

                {selectedTab === 'activePromoCode' && (
                    <div>
                        <Text color="white">Для активации промокодов, вы должны:</Text>
                        <ul>
                            <li>Быть подписаны на группу ВК.</li>
                            <li>Открытый профиль в ВК.</li>
                            <li>Иметь не менее 20 друзей в ВК.</li>
                        </ul>
                    </div>
                )}

                {selectedTab === 'createPromoCode' && (
                    <div>
                        <Text color="white">Для создания промокодов, вы должны:</Text>
                        <ul>
                            <li>Иметь пополнений на сумму не менее 100 рублей.</li>
                            <li>Подписаны на группу ВК.</li>
                        </ul>
                    </div>
                )}
            </div>

            <div className={cnPrizeInfo('Action')}>
                {selectedTab === 'freeCoins' &&
                    (prize !== undefined ? (
                        <Text color="white">Вы получили: {prize} монет</Text>
                    ) : (
                        <button
                            type="button"
                            className={cnPrizeInfo('Btn')}
                            disabled={!hasBonus}
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
