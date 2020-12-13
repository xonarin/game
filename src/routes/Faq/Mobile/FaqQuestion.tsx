import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Faq.scss';
import { cn } from '../../../utils/bem-css-module';

interface Props {
    id: string;
    question: {
        title: string;
        answer: string;
    };
}
const cnFaq = cn(s, 'Faq');
function FaqQuestion(props: Props) {
    const [toggle, setToggle] = useState(false);
    const { question, id } = props;
    useStyles(s);
    const handleClick = () => {
        setToggle(!toggle);
    };
    return (
        <>
            <button type="button" className={cnFaq('single-question')} onClick={handleClick}>
                <span>{id}</span> {` ${question.title}`}
            </button>
            {toggle ? <div className={cnFaq('single-question-answer')}>{question.answer} </div> : null}
        </>
    );
}

export default FaqQuestion;
