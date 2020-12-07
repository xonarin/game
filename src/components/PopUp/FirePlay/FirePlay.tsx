import React from 'react'
import Icon from '../../Icon/Icon'
import Text from '../../Text/Text'
import s from './FirePlay.scss';
import { cn } from '../../../utils/bem-css-module';
import EditbleInput from '../../inputs/EditbleInput/EditbleInput';
import useStyles from 'isomorphic-style-loader/useStyles';
import Link from '../../Link/Link';
export interface FirePlayProps{
    close:Function
}

const cnFirePlay = cn(s, 'FirePlay');
const FirePlay:React.FC<FirePlayProps> = ({close}) => {
    useStyles(s);

    return (
        <div className={cnFirePlay()}>
            <div className={cnFirePlay('Header')}>
                <div>
                    <Icon type='diceWhite' />
                    <Text color='white'>
                        Честная игра
                </Text>
                </div>
                <button type='button' onClick={()=>close()}>
                <Icon type='close' />
                </button>
            </div>
            <div className={cnFirePlay('Description')}>
                <div  className={cnFirePlay('Description-Row')}>
                    <Text color='white'>
                        Наша система честной игры гарантирует, что мы не можем манипулировать результатом игры.
                 </Text>
                </div>
                <div  className={cnFirePlay('Description-Row')}>
                    <Text color='white'>

                        Подобно тому, как вы разрезали колоду в реальном казино, мы разрешаем вам выбирать «клиентский сид». Эта реализация дает вам полное спокойствие во время игры, зная, что мы не можем «подстраивать» ставки в нашу пользу.
                    </Text>

                </div>
                <div  className={cnFirePlay('Description-Row')}>
                    <Text color='white'>
                        Вы можете узнать больше о том, как этот алгоритм хеширования обеспечивает полную безопасность для игроков <Link to='/'><Text color='blue'>здесь...</Text></Link> 
                      </Text>
                </div>

            </div>
            <div className={cnFirePlay('Settings')}>
                <div className={cnFirePlay('Parametres')}>
                    <Text color='white'>
                        Клиентский сид:
                    </Text>
                    <EditbleInput />
                </div>
                <div className={cnFirePlay('Parametres')}>
                    <Text color='white'>
                        Сервер сид (хеширован)
                    </Text>
                    <EditbleInput />
                </div>
                <div className={cnFirePlay('Parametres')}>
                    <Text color='white'>
                        Кол-во игр с этим сидом
                    </Text>
                    <EditbleInput />
                </div>
            </div>
            <div className={cnFirePlay('Footer')}>
                <Text>
                    Для того чтобы изменить клиентский или серверный сид нажмите <Icon type='edit'/>
               </Text>
            </div>
        </div>
    )
}

export default FirePlay
