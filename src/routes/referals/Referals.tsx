import React, { useState } from 'react';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';
import ReferalsMobile from './Mobile/Referals';
import ReferalsWeb from './Web/Referals';

const Referals: React.FC = () => {
    const [mobile, setMobile] = useState(false)
    useIsomorphicLayoutEffect(() => {
        if (
            typeof window !== 'undefined' &&
            typeof window.document !== 'undefined' &&
            typeof window.document.createElement !== 'undefined' &&
            window.screen.width < 900
        ) {
            setMobile(true);
        }
    }, [typeof window !== 'undefined' && window?.screen?.width]);

<<<<<<< HEAD
const items = [
    { id: 1,  user: 'Donald', count: 36, status: true, income: 2500, date: '25.10.2019 в 21:46' },
    { id: 2,  user: 'Donald', count: 67, status: false, income: 2500, date: '26.10.2019 в 21:46' },
    { id: 3,  user: 'Donald', count: 10, status: true, income: 2500, date: '27.10.2019 в 21:46' },
    { id: 4,  user: 'Donald', count: 83, status: false, income: 2500, date: '28.10.2019 в 21:46' },
    { id: 5,  user: 'Donald', count: 67, status: true, income: 2500, date: '29.10.2019 в 21:46' },
    { id: 6,  user: 'Donald', count: 36, status: true, income: 2500, date: '30.10.2019 в 21:46' },
    { id: 7,  user: 'Donald', count: 83, status: false, income: 2500, date: '28.10.2019 в 21:46' },
    { id: 8,  user: 'Donald', count: 67, status: true, income: 2500, date: '29.10.2019 в 21:46' },
    { id: 9,  user: 'Donald', count: 36, status: true, income: 2500, date: '30.10.2019 в 21:46' },
];
=======
>>>>>>> dev

    if(mobile){
        return(
          <ReferalsMobile/>
        )
    }   

    return (
       <ReferalsWeb/>
    );
};

export default Referals;
