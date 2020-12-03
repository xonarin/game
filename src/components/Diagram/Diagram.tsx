import React from 'react';
import { AreaChart,CartesianGrid, Tooltip, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
const data = [
    {
        "name": "Page A",
        "uv": 4000,
        "pv": 2400,
        "amt": 2400
    },
    {
        "name": "Page B",
        "uv": 3000,
        "pv": 1398,
        "amt": 2210
    },
    {
        "name": "Page C",
        "uv": 2000,
        "pv": 9800,
        "amt": 2290
    },
    {
        "name": "Page D",
        "uv": 2780,
        "pv": 3908,
        "amt": 2000
    },
    {
        "name": "Page E",
        "uv": 1890,
        "pv": 4800,
        "amt": 2181
    },
    {
        "name": "Page F",
        "uv": 2390,
        "pv": 3800,
        "amt": 2500
    },
    {
        "name": "Page G",
        "uv": 3490,
        "pv": 4300,
        "amt": 2100
    }
]
export interface DiagramProps{
    color:string;
}
const Diagram: React.FC<DiagramProps> = ({color})=> {
    return (
        <ResponsiveContainer width="100%" height="100%" aspect={2}>
        <AreaChart width={730} height={250} data={data}>
            
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
            <Area type="monotone" dataKey="pv" stroke={color} fillOpacity={1} dot={true} fill={color==="#347dfe" ? "url(#colorPv)" : "url(#colorUv)"} />
        </AreaChart>
        </ResponsiveContainer>
    )
}

export default Diagram