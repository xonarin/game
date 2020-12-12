import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Faq.scss';
import { cn } from '../../../utils/bem-css-module';
import FaqQuestion from './FaqQuestion';

interface Props {
    id: number;
    theme: {
        title: string;
        questions: [
            {
                id: number;
                title: string;
                answer: string;
            },
        ];
    };
}
const cnFaq = cn(s, 'Faq');

function FaqTheme(props: Props) {
    const [toggle, setToggle] = useState(false);
    const { theme, id } = props;
    useStyles(s);
    const handleClick = () => {
        setToggle(!toggle);
    };
    return (
        <>
            <button id={`${id}`} type="button" className={cnFaq('question-theme')} onClick={handleClick}>
                {`${id}.  ${theme.title}`}
            </button>
            {toggle
                ? theme.questions.map((item, index) => {
                      return <FaqQuestion question={item} key={item.id} id={`${id}.${index + 1}`} />;
                  })
                : null}
        </>
    );
}

export default FaqTheme;
