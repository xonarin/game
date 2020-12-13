import React, { useCallback, useRef } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { Form } from 'react-final-form';
import { FormApi } from 'final-form';

import s from './ClassicGameForm.scss';
import { cn } from '../../../../utils/bem-css-module';
import useMeQuery from '../../../../hooks/graphql/users/useMeQuery';
import usePlaceClassicGameBetMutation from '../../../../hooks/graphql/classicGame/usePlaceClassicGameBetMutation';
import BetField from '../../../fields/BetField/BetField';
import Button from '../../../Button/Button';
import { BetInputRef } from '../../../inputs/BetInput/BetInput';
import PreLoader from '../../../PreLoader/PreLoader';
export interface ClassicGameFormValues {
    amount: number;
}

export interface ClassicGameFormProps {
    minBetAmount: number;
    className?: string;
}

const cnClassicGameForm = cn(s, 'ClassicGameForm');

const ClassicGameForm: React.FC<ClassicGameFormProps> = ({ minBetAmount, className }) => {
    useStyles(s);

    const fieldRef = useRef<BetInputRef | null>(null);

    const onFocus = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        const { current: input } = fieldRef;
        if (!input || event.target === input.elem()) return;

        event.preventDefault();
        input.focus(true);
    }, []);

    const placeClassicGameBetMutation = usePlaceClassicGameBetMutation();

    const onSubmit = useCallback(
        async (values: ClassicGameFormValues, form: FormApi<ClassicGameFormValues>) => {
            if (values.amount <= 0) return;

            await placeClassicGameBetMutation(values);

            setTimeout(() => form.reset({ amount: minBetAmount }), 0);
        },
        [minBetAmount, placeClassicGameBetMutation],
    );

    const { loading, me } = useMeQuery();

    if (loading || !me) {
        return  <PreLoader/>
    }

    return (
        <Form<ClassicGameFormValues> onSubmit={onSubmit} initialValues={{ amount: minBetAmount }}>
            {({ handleSubmit, form, values }) => {
                const buildOnControlClick = (inc: number) => () => {
                    form.change('amount', values.amount + inc);
                };

                return (
                    <form className={cnClassicGameForm(null, [className])} onSubmit={handleSubmit}>
                        <div className={cnClassicGameForm('Main')}>
                            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */}
                            <div className={cnClassicGameForm('BetFieldContainer')} onClick={onFocus}>
                                <BetField name="amount" ref={fieldRef} />
                            </div>
                            <Button className={cnClassicGameForm('SubmitButton')} upper submit>
                                Играть
                            </Button>
                        </div>
                        <div className={cnClassicGameForm('Controls')}>
                            <Button color="gray" onClick={buildOnControlClick(1)}>
                                +1
                            </Button>
                            <Button color="gray" onClick={buildOnControlClick(5)}>
                                +5
                            </Button>
                            <Button color="gray" onClick={buildOnControlClick(10)}>
                                +10
                            </Button>
                            <Button color="gray" onClick={buildOnControlClick(100)}>
                                +100
                            </Button>
                            <Button color="gray" onClick={buildOnControlClick(500)}>
                                +500
                            </Button>
                            <Button color="gray" onClick={buildOnControlClick(1000)}>
                                +1000
                            </Button>
                            <Button color="gray" onClick={() => form.change('amount', me.money!)}>
                                All
                            </Button>
                        </div>
                    </form>
                );
            }}
        </Form>
    );
};

export default ClassicGameForm;
