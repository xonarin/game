import React, { useState } from 'react';
import { AreaChart, CartesianGrid, Tooltip, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Diagram.scss';
import { cn } from '../../utils/bem-css-module';
import Text from '../Text/Text';

const cnDiagram = cn(s, 'Diagram');

export interface DiagramProps {
    color: string;
    items: { value: number; date: string }[];
    mobile?: boolean;
}
const Diagram: React.FC<DiagramProps> = ({ color, items, mobile }) => {
    useStyles(s);
    const [selectedTime, setSelectedTime] = useState('');

    const handleSelect = (index: number) => {
        const startTime = items[index].date;
        let finishTime = '';
        if (items[index + 1]) {
            finishTime = items[index + 1].date;
        } else {
            finishTime = 'До сегодня';
        }
        const time = `${startTime} - ${finishTime}`;
        setSelectedTime(time);
    };

    if (mobile) {
        return (
            <div className={cnDiagram()}>
                <ResponsiveContainer width="100%" height="100%" aspect={2}>
                    <AreaChart width={730} height={250} data={items}>
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#347dfe" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#347dfe" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="pv" axisLine={false} tickLine={false} orientation="top" tickMargin={20} />

                        <Tooltip cursor={false} />
                        <CartesianGrid vertical={false} stroke="#161822" />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            fillOpacity={1}
                            dot
                            fill={color === '#347dfe' ? 'url(#colorPv)' : 'url(#colorUv)'}
                            activeDot={{ onClick: (item: { index: number }) => handleSelect(item.index) }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                <div className={cnDiagram('Date')}>
                    <Text>{selectedTime}</Text>
                </div>
            </div>
        );
    }

    return (
        <div className={cnDiagram()}>
            <ResponsiveContainer width="100%" height="100%" aspect={2}>
                <AreaChart width={730} height={250} data={items}>
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#347dfe" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#347dfe" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="ss" allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={false} />
                    <CartesianGrid vertical={false} stroke="#161822" />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        fillOpacity={1}
                        dot
                        fill={color === '#347dfe' ? 'url(#colorPv)' : 'url(#colorUv)'}
                        activeDot={{ onClick: (item: { index: number }) => handleSelect(item.index) }}
                    />
                </AreaChart>
            </ResponsiveContainer>
            <div className={cnDiagram('Date')}>
                <Text>{selectedTime}</Text>
            </div>
        </div>
    );
};

export default Diagram;
