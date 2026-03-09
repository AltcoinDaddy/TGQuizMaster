export const getTimeRemaining = (endTime: string | Date): string => {
    const total = Date.parse(endTime.toString()) - Date.parse(new Date().toString());
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);

    if (days > 0) {
        return `${days}d ${hours}h`;
    }
    if (hours > 0) {
        return `${hours}h remaining`;
    }
    return 'Ending soon';
};
