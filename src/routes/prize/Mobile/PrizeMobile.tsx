import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import s from './PrizeMobile.scss';
import Text from '../../../components/Text/Text';
import { cn } from '../../../utils/bem-css-module';
import Layout from '../../../components/Layout/Layout';
const cnPrize = cn(s, 'PrizeMobile');

const PrizeMobile:React.FC = () => {
    const [selectedTab, setSelectedTab] = useState('freeCoins');
    const [showPrize, setShowPrize] = useState(false)
    const [promoCode, setPromoCode] = useState('')
    const [promoCodeAmount, setPromoCodeAmount] = useState("")   
    const [activateAmount, setActivateAmount] = useState("") 
    useStyles(s);

    return (
        <Layout>
            <div className={cnPrize()}>
            <div className={cnPrize('Nav')}>
                <button className={selectedTab==="freeCoins" ?  cnPrize('Nav-Item-Active') :cnPrize('Nav-Item')} onClick={()=>setSelectedTab("freeCoins")}>
                    <div className={cnPrize('Nav-Item-Img')}>
                        <img src="" alt="" />
                    </div>
                    <div className={cnPrize('Nav-Item-Info')}>
                        <Text color="blue">Бесплатные монеты</Text>
                        <Text>Вступай в нашу группу и получай до 0.10 каждые 15 минут.</Text>
                    </div>
                </button>

                <button className={selectedTab==="activePromocode" ?  cnPrize('Nav-Item-Active') :cnPrize('Nav-Item')} onClick={()=>setSelectedTab("activePromocode")}>
                    <div className={cnPrize('Nav-Item-Img')}>
                        <img src="" alt="" />
                    </div>
                    <div className={cnPrize('Nav-Item-Info')}>
                        <Text color="blue">Активировать промокод</Text>
                        <Text>Получайте промокоды от нас или друзей и получайте награду.</Text>
                    </div>
                </button>

                <button className={selectedTab==="createPromocode" ?  cnPrize('Nav-Item-Active') :cnPrize('Nav-Item')} onClick={()=>setSelectedTab("createPromocode")}>
                    <div className={cnPrize('Nav-Item-Img')}>
                        <img src="" alt="" />
                    </div>
                    <div className={cnPrize('Nav-Item-Info')}>
                        <Text color="blue">Создать промокод</Text>
                        <Text>Создайте промокод и поделитесь им с друзьями.</Text>
                    </div>
                </button>
            </div>
            <div className={cnPrize('Info')}>
                <div className={cnPrize('Info-Header')}>
                    {selectedTab === 'freeCoins' ? <span>НАШИ ГРУППЫ</span> : <span>ПРОМОКОДЫ В ГРУППАХ</span>}
                </div>
                <div className={cnPrize('Info-Groups')}>
                    <a href="/" className={cnPrize('Btn')}>
                        Вконтакте
                    </a>
                    <a href="/" className={cnPrize('Btn')}>
                        Телеграм
                    </a>
                </div>
                <div className={cnPrize('Info-Content')}>
                    {selectedTab === 'freeCoins' ? (
                        <Text color="white">
                            Вступайте в группу ВК и получайте до 0.10 монет каждые 15 минут.
                        </Text>
                    ) : selectedTab === 'activePromocode' ? (
                        <div>
                            <Text color="white">Для активации промокодов, вы должны:</Text>
                            <ul>
                                <li>Быть подписаны на группу ВК.</li>
                                <li>Открытый профиль в ВК.</li>
                                <li>Иметь не менее 20 друзей в ВК.</li>
                            </ul>
                        </div>
                    ) : (
                        <div>
                            <Text color="white">Для создания промокодов, вы должны:</Text>
                            <ul>
                                <li>Иметь пополнений на сумму не менее 100 рублей.</li>
                                <li> Подписаны на группу ВК.</li>
                            </ul>
                        </div>
                    )}
                </div>
                <div className={cnPrize('Info-Action')}>
                    {selectedTab==="freeCoins"   ? <>{showPrize ? <Text color="white">Вы получили: 10 diamond</Text>: <button className={cnPrize('Btn')} onClick={()=>setShowPrize(true)}>Получить</button>} 
                   </>:selectedTab==='activePromocode' ? <div className={cnPrize('Active-Promocode')}><input type="text" placeholder='Введите промокод'  onChange={(e)=>setPromoCode(e.target.value)}/><button>Активировать</button></div> : <div className={cnPrize('Create-Promocode')}><div className={cnPrize('Create-Promocode-Inputs')}><input type="text" value={promoCodeAmount} onChange={(e)=>Number(e.target.value) || e.target.value===""  ? setPromoCodeAmount(e.target.value) : null } placeholder='Сумма промокода'/> <input type="text" value={activateAmount} onChange={(e)=>Number(e.target.value) || e.target.value===""  ? setActivateAmount(e.target.value) : null } placeholder='Активаций'/></div><button>Создать</button></div> }
                   
                </div>
            </div>
        </div>
        </Layout>
    )
}

export default PrizeMobile
