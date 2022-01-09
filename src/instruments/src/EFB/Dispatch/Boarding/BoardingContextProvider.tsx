import React, { createContext, useContext, useEffect, useState } from 'react';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { gsap } from 'gsap';
import { usePersistentProperty } from '@instruments/common/persistence';
import { createBoardingSequenceBackToFront, createBoardingSequenceFrontToBack, initPassengers, distributePax, showRows } from './PaxSim';

interface BoardingContextInterface {
    boardingStarted: boolean,
    passengers: Passenger[],
    numberOfPassengers: number,
    passengersBoarded: number,
    passengersSeated: number,
    boardingType: {type: BoardingSequenceType, text: string},
    setBoardingStarted : (boolean)=> void,
    startBoarding: () => void,
    completeBoarding: () => void,
    resetBoarding: () => void,
    pauseBoarding: () => void

}

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

export enum BoardingSequenceType {
    'FRONT2BACK' = 0,
    'BACK2FRONT',
    'RANDOM'
}

const NUM_PASSENGERS = 125;

const BoardingContext = createContext<BoardingContextInterface>(undefined as any);
export const useBoarding = () => useContext(BoardingContext);

gsap.registerPlugin(MotionPathPlugin);

export const BoardingProvider = ({ children }) => {
    const [boardingStarted, setBoardingStarted] = useState<boolean>(false);
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [passengersBoarded, setPassengersBoarded] = useState<number>(0);
    const [passengersSeated, setPassengersSeated] = useState<number>(0);
    const [timeline, setTimeline] = useState<gsap.core.Timeline | undefined>(undefined);
    const [boardingSeqenceTypeProp] = usePersistentProperty('CONFIG_BOARDING_SEQUENCE_TYPE', 'FRONT2BACK');

    const boardingTypeInfo = ():{type: BoardingSequenceType, text: string, start:()=>void} => {
        switch (boardingSeqenceTypeProp) {
        case 'BACK2FRONT': return { type: BoardingSequenceType.BACK2FRONT, text: 'Back-2-Front', start: startBoardingBack2Front };
        case 'FRONT2BACK': return { type: BoardingSequenceType.FRONT2BACK, text: 'Front-2-Back', start: startBoardingFront2Back };
        case 'RANDOM':
        default:
            return { type: BoardingSequenceType.RANDOM, text: 'Random', start: startBoardingRandom };
        }
    };

    useEffect(() => {
        if (boardingStarted) {
            boardingTypeInfo().start();
        }
    }, [boardingStarted]);

    const startBoarding = () => {
        const thePax = initPassengers(NUM_PASSENGERS);
        let nextPaxIdx = distributePax(0, thePax, [0, 5]); // windows
        nextPaxIdx = distributePax(nextPaxIdx, thePax, [2, 3]); // aisle
        distributePax(nextPaxIdx, thePax, [1, 4]); // middle
        setPassengers(thePax);
        setBoardingStarted(true);
    };
    const completeBoarding = () => {
        timeline?.seek('100%', false);
    };

    const resetBoarding = () => {
        initializeBoardingValues();
        setBoardingStarted(false);
    };

    const pauseBoarding = () => {
        showRows(passengers);
        timeline?.pause();
    };

    const initializeBoardingValues = () => {
        if (timeline) {
            timeline.seek(0);
            timeline.kill();
            setPassengers(passengers.map((p) => {
                p.status = PaxBoardingStatus.WAITING;
                return p;
            }));
            setPassengersBoarded(0);
            setPassengersSeated(0);
        }
    };

    const startBoardingBack2Front = () => {
        startAnimation(true, createBoardingSequenceBackToFront(passengers));
    };

    const startBoardingFront2Back = () => {
        startAnimation(true, createBoardingSequenceFrontToBack(passengers));
    };

    const startBoardingRandom = () => {
        startAnimation(true, createBoardingSequenceFrontToBack(passengers));
    };

    const onComplete = (...params: any[]) => {
        setPaxStatus(Number.parseInt(params[0]), PaxBoardingStatus.SEATED);
        setPassengersSeated((val) => val + 1);
    };

    const onStart = (...params: any[]) => {
        setPaxStatus(Number.parseInt(params[0]), PaxBoardingStatus.BOARING);
        setPassengersBoarded((val) => val + 1);
    };

    const setPaxStatus = (paxIdx: number, status: PaxBoardingStatus) => {
        setPassengers(passengers.map((p, idx) => {
            if (idx === paxIdx) {
                p.status = status;
            }
            return p;
        }));
    };

    const startAnimation = (boarding:boolean, thePax: Passenger[]) => {
        initializeBoardingValues();

        if (boarding) {
            const tl = gsap.timeline();
            thePax.forEach((p, idx) => {
                const duration = p.distance / 10;
                console.log(`path=${JSON.stringify(p.svgMotionPath)}`);
                tl.to(`#passenger-${idx}`, {
                    duration,
                    onComplete,
                    onCompleteParams: [idx],
                    onStart,
                    onStartParams: [idx],
                    ease: 'none',
                    motionPath: {
                        path: p.svgMotionPath,
                        autoRotate: false,
                        alignOrigin: [0.5, 0.5],
                    },
                }, '<+=1');
            });
            setTimeline(tl);
        }
    };

    return (
        <BoardingContext.Provider value={{
            boardingStarted,
            passengers,
            passengersBoarded,
            passengersSeated,
            numberOfPassengers: NUM_PASSENGERS,
            boardingType: { type: boardingTypeInfo().type, text: boardingTypeInfo().text },
            setBoardingStarted,
            startBoarding,
            completeBoarding,
            resetBoarding,
            pauseBoarding,
        }}
        >
            {children}
        </BoardingContext.Provider>
    );
};
