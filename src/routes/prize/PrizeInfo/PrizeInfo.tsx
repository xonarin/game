import React, { useCallback } from 'react';
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

    const { hasBonus, refetchHasBonus } = useHasBonusQuery();

    const { getBonusMutation, getBonusResult } = useGetBonusMutation();
    const onGetBonusClick = useCallback(async () => {
        await getBonusMutation();
        await refetchHasBonus();
    }, [getBonusMutation, refetchHasBonus]);

    return (
        <div className={cnPrizeInfo()}>
            <div className={cnPrizeInfo('Header')}>
                {selectedTab === 'freeCoins' ? <span>НАШИ ГРУППЫ</span> : <span>ПРОМОКОДЫ В ГРУППАХ</span>}
            </div>

            <div className={cnPrizeInfo('Groups')}>
                <a href="https://vk.com/willygame" className={cnPrizeInfo('Btn')}>
                    Вконтакте
                </a>

                <a href="https://t.me/willygames" className={cnPrizeInfo('Btn')}>
                    Телеграм
                </a>
            </div>

            <div className={cnPrizeInfo('Content')}>
                {selectedTab === 'freeCoins' && (
                    <div>
                        <Text color="white">Чтобы получать каждый день до 3 рублей, нужно:</Text>
                        <ul>
                            <li>Быть подписаным на группу ВК.</li>
                            <li>Открытый профиль в ВК.</li>
                            <li>Сделать репост последней записи в ВК группе.</li>
                        </ul>
                    </div>
                )}

                {selectedTab === 'activePromoCode' && (
                    <div>
                        <Text color="white">Для активации промокодов, вы должны:</Text>
                        <ul>
                            <li>Быть подписаным на группу ВК.</li>
                            <li>Открытый профиль в ВК.</li>
                            <li>Иметь не менее 20 друзей в ВК.</li>
                        </ul>
                    </div>
                )}

                {selectedTab === 'createPromoCode' && (
                    <div>
                        <Text color="white">Для создания промокодов, вы должны:</Text>
                        <ul>
                            <li>Иметь пополнений на сумму не менее 50 рублей.</li>
                            <li>Подписаным на группу ВК.</li>
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
