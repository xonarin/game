import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Footer.scss';
import { cn } from '../../../utils/bem-css-module';
import Text from '../../../components/Text/Text';
import Button from '../../../components/Button/Button';
import Link from '../../../components/Link/Link';

export interface FooterProps {
    isFluid?: boolean;
}

const cnFooter = cn(s, 'Footer');

const Footer: React.FC<FooterProps> = ({ isFluid }) => {
    useStyles(s);

    return (
        <footer className={cnFooter()}>
            <div className={cnFooter('Container', { isFluid })}>
                <div className={cnFooter('Main')}>
                    <ul className={cnFooter('Navigation')}>
                        <li>
                            <Link className={cnFooter('NavigationItem')} to="/faq#2">
                                <Text size="xs">О проекте</Text>
                            </Link>
                        </li>
                        <li>
                            <Link className={cnFooter('NavigationItem')} to="/faq">
                                <Text size="xs">Вопросы и ответы</Text>
                            </Link>
                        </li>
                        <li>
                            <Link className={cnFooter('NavigationItem')} to="/faq">
                                <Text size="xs">Правила</Text>
                            </Link>
                        </li>
                        <li>
                            <Link className={cnFooter('NavigationItem')} to="/referal">
                                <Text size="xs">Партнерская программа</Text>
                            </Link>
                        </li>
                        <li>
                            <Link className={cnFooter('NavigationItem')} to="/messages?userId=1">
                                <Text size="xs">Контакты</Text>
                            </Link>
                        </li>
                    </ul>
                    <div>
                        <Button className={cnFooter('SocialButton')} color="gray">
                            <a href="https://vk.com/willygame">VK</a>
                        </Button>
                        <Button className={cnFooter('SocialButton')} color="gray">
                        <a href="https://t.me/willygames">TG</a>
                        </Button>
                    </div>
                </div>
                <div className={cnFooter('Copyright')}>
                    <Text size="xs">Willy © 2020</Text>
                    <div className={cnFooter('PaymentsWrap')}>
                        <a className={cnFooter('PaymentsLink')}>
                            <img src="/qiwi.svg" alt="Приём оплаты на сайте картами" />
                        </a>
                        <a className={cnFooter('PaymentsLink')}>
                            <img src="/visa.svg" alt="Приём оплаты на сайте картами" />
                        </a>
                        <a className={cnFooter('PaymentsLink')}>
                            <img src="/mastercard.svg" alt="Приём оплаты на сайте картами" />
                        </a>
                        <a className={cnFooter('PaymentsLink')}>
                            <img src="/beeline.svg" alt="Приём оплаты на сайте картами" />
                        </a>
                        <a className={cnFooter('PaymentsLink')}>
                            <img src="/megafon.svg" alt="Приём оплаты на сайте картами" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
