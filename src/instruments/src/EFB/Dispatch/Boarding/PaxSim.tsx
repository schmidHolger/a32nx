import React, { useEffect } from 'react';

export enum PaxBoardingStatus {
    'WAITING' = 'W',
    'BOARING' = 'B',
    'SEATED' = 'S'
}

export type Passenger = {
    row: number | undefined;
    seat: number | undefined;
    status: PaxBoardingStatus,
    svgMotionPath: string,
    distance: number,
};
export const NUM_OF_ROWS = 30;
export const NUM_OF_SEATS = 6;
const ROW_START_Y = [100.3, 112.6, 125, 137.5, 149.5, 161.8, 173.7, 185.8, 198.1, 210.1, 224, 237.4,
    248.8, 259, 269.6, 280.9, 291.8, 302.6, 313.5, 324.2, 335.2, 346.2, 356.9, 368.1,
    378.6, 389.6, 400.5, 411.4, 422.6, 432.9];
const SEAT_HEIGHT = 6.2;

const createPaxPath = ({ row, seat }: {row: number, seat: number}) => {
    const { endX, endY } = getEndPos({ row, seat });
    return `M 244 78 L 258 78 L 268 79.1 L 274 82 L 274 ${endY} L ${endX} ${endY}`;
};

const getDistanceForPax = ({ row, seat }: {row: number, seat: number}) => {
    const { endX, endY } = getEndPos({ row, seat });
    return 30.72 + endY - 82 + Math.abs(274 - endX);
};

const getEndPos = ({ row, seat }: {row: number, seat: number}): {endX:number, endY:number} => {
    const endY = ROW_START_Y[row] + SEAT_HEIGHT / 2;
    let endX = seat < 3 ? 251.1 + seat * 7.2 : 297.2 - (5 - seat) * 7.2;
    if (row === NUM_OF_ROWS - 2) {
        if (seat < 3) {
            endX += 1;
        } else {
            endX -= 0.7;
        }
    }
    if (row === NUM_OF_ROWS - 1) {
        if (seat < 3) {
            endX += 1.8;
        } else {
            endX -= 1.5;
        }
    }
    return { endX, endY };
};

export const distributePax = (nextPaxIdx:number, pax:Passenger[], seats:number[]):number => {
    const paxLength = pax.length;
    if (nextPaxIdx < paxLength) {
        let paxIdx = nextPaxIdx;
        for (let row = 0; row < NUM_OF_ROWS && paxIdx < paxLength; row += 1) {
            for (let seatIdx = 0; seatIdx < 2 && paxIdx < paxLength; seatIdx += 1) {
                pax[paxIdx].row = row;
                pax[paxIdx].seat = seats[seatIdx];
                pax[paxIdx].svgMotionPath = createPaxPath({ row, seat: seats[seatIdx] });
                pax[paxIdx].distance = getDistanceForPax({ row, seat: seats[seatIdx] });
                paxIdx += 1;
            }
        }
        return paxIdx;
    }

    return pax.length;
};

export const showRows = (pax: Passenger[]) => {
    Array.from({ length: NUM_OF_ROWS }).forEach((_r, ri) => {
        let info = '';
        Array.from({ length: NUM_OF_SEATS }).forEach((_s, si) => {
            const thePaxIdx = pax.findIndex((p) => p.row === ri && p.seat === si);
            if (thePaxIdx !== -1) {
                info += `${pax[thePaxIdx].status} `;
            } else {
                info += '- ';
            }
        });
        console.log(`Row-${ri}: ${info}`);
    });
};

export const initPassengers = (numOfPax: number): Passenger[] => Array.from({ length: numOfPax }, () => ({
    row: undefined,
    seat: undefined,
    status: PaxBoardingStatus.WAITING,
    svgMotionPath: '',
    distance: 0,
}));

export const createBoardingSequenceBackToFront = (passengers: Passenger[]) => passengers.sort((a, b) => sortBackToFront(a, b));
export const createBoardingSequenceFrontToBack = (passengers: Passenger[]) => passengers.sort((a, b) => sortFrontToBack(a, b));
export const createBoardingSequenceRandom = (passengers: Passenger[]) => shuffleArray(passengers);

const sortBackToFront = (a: Passenger, b:Passenger):number => {
    if (a.row === b.row && a.seat === b.seat) {
        return 0;
    }

    if (a.row !== undefined && b.row !== undefined
        && a.seat !== undefined && b.seat !== undefined) {
        if (a.row === b.row) {
            return compareSeatsForEqualRows(a.seat, b.seat);
        }

        return b.row - a.row;
    }
    return 0;
};

const sortFrontToBack = (a: Passenger, b:Passenger):number => {
    if (a.row === b.row && a.seat === b.seat) {
        return 0;
    }

    if (a.row !== undefined && b.row !== undefined
        && a.seat !== undefined && b.seat !== undefined) {
        if (a.row === b.row) {
            return compareSeatsForEqualRows(a.seat, b.seat);
        }

        return a.row - b.row;
    }
    return 0;
};

const compareSeatsForEqualRows = (seatA: number, seatB:number):number => {
    const seatASide = seatA < 3 ? 0 : 1;
    const seatBSide = seatB < 3 ? 0 : 1;

    if (seatASide === seatBSide) {
        return (seatA - seatB) * (seatASide ? -1 : 1);
    }
    return seatASide - seatBSide;
};

const shuffleArray = (array:any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array.map((e) => e);
};
