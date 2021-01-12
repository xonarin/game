// Время в минутах, на которое будет забанен игрок в чате, в зависимости от кол-ва предупреждений
export const warnsMap: Record<number, number> = {
    1: 30,
    2: 2 * 60,
    3: 24 * 60,
    4: 7 * 24 * 60,
    5: 30 * 24 * 60,
};

export const getBanEndTime = (startDate: Date | null, chatWarns: number): number => {
    if (!startDate || chatWarns <= 0) return 0;

    return (
        startDate.getTime() + (chatWarns >= 5 ? warnsMap[5] : warnsMap[chatWarns as keyof typeof warnsMap]) * 60 * 1000
    );
};
