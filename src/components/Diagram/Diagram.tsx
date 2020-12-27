import React, { useState } from 'react';
<<<<<<< HEAD
import { AreaChart,CartesianGrid, Tooltip, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
=======
import { AreaChart, CartesianGrid, Tooltip, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
>>>>>>> dev
import useStyles from 'isomorphic-style-loader/useStyles';
import s from './Diagram.scss';
import { cn } from '../../utils/bem-css-module';
import Text from '../Text/Text';
const cnDiagram = cn(s, 'Diagram');
const items = [
    {
<<<<<<< HEAD
        "name": "Page A",
        "uv": 4000,
        "pv": 2400,
        "amt": 2400,
        "date":"25.10.2019"
    },
    {
        "name": "Page B",
        "uv": 3000,
        "pv": 1398,
        "amt": 2210,
        "date":"26.10.2019"
    },
    {
        "name": "Page C",
        "uv": 2000,
        "pv": 9800,
        "amt": 2290,
        "date":"27.10.2019"
    },
    {
        "name": "Page D",
        "uv": 2780,
        "pv": 3908,
        "amt": 2000,
        "date":"28.10.2019"
    },
    {
        "name": "Page E",
        "uv": 1890,
        "pv": 4800,
        "amt": 2181,
        "date":"29.10.2019"
    },
    {
        "name": "Page F",
        "uv": 2390,
        "pv": 3800,
        "amt": 2500,
        "date":"30.10.2019"
    },
    {
        "name": "Page G",
        "uv": 3490,
        "pv": 4300,
        "amt": 2100,
        "date":"31.10.2019"
    }
]
export interface DiagramProps{
    color:string;
}
const Diagram: React.FC<DiagramProps> = ({color})=> {

    useStyles(s);
    const [selectedTime, setSelectedTime] = useState('')

    const handleSelect=(index:number)=>{
      const  startTime=items[index].date
      let finishTime=""
        if(items[index+1]){
            
           finishTime=items[index+1].date
        }else{
           finishTime="До сегодня"
        }
       const time=startTime + " - " + finishTime
        setSelectedTime(time)
=======
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
        date: '25.10.2019',
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
        date: '26.10.2019',
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
        date: '27.10.2019',
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
        date: '28.10.2019',
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
        date: '29.10.2019',
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
        date: '30.10.2019',
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
        date: '31.10.2019',
    },
];
export interface DiagramProps {
    color: string;
    mobile?: boolean;
}
const Diagram: React.FC<DiagramProps> = ({ color, mobile }) => {
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
        const time = startTime + ' - ' + finishTime;
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
                        <XAxis dataKey="pv" axisLine={false} tickLine={false} orientation="top" tickMargin={20}/>
                        
                        <Tooltip cursor={false} />
                        <CartesianGrid vertical={false} stroke="#161822" />
                        <Area
                            type="monotone"
                            dataKey="pv"
                            stroke={color}
                            fillOpacity={1}
                            dot={true}
                            fill={color === '#347dfe' ? 'url(#colorPv)' : 'url(#colorUv)'}
                            activeDot={{ onClick: (item: any) => handleSelect(item.index) }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                <div className={cnDiagram('Date')}>
                    <Text>{selectedTime}</Text>
                </div>
            </div>
        );
>>>>>>> dev
    }

    return (
        <div className={cnDiagram()}>
<<<<<<< HEAD

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
            <YAxis axisLine={false} tickLine={false}  />
            <Tooltip cursor={false} />
            <CartesianGrid vertical={false} stroke="#161822"/>
            <Area type="monotone" dataKey="pv" stroke={color} fillOpacity={1} dot={true} fill={color==="#347dfe" ? "url(#colorPv)" : "url(#colorUv)"} activeDot={{ onClick: (item:any) => handleSelect(item.index) }}/>
        </AreaChart>
        </ResponsiveContainer>
        <div className={cnDiagram("Date")}><Text>{selectedTime}</Text></div>
        </div>

    )
}
=======
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
                        dataKey="pv"
                        stroke={color}
                        fillOpacity={1}
                        dot={true}
                        fill={color === '#347dfe' ? 'url(#colorPv)' : 'url(#colorUv)'}
                        activeDot={{ onClick: (item: any) => handleSelect(item.index) }}
                    />
                </AreaChart>
            </ResponsiveContainer>
            <div className={cnDiagram('Date')}>
                <Text>{selectedTime}</Text>
            </div>
        </div>
    );
};
>>>>>>> dev

export default Diagram;
