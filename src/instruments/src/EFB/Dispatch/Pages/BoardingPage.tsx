import React, { useEffect, useRef, useState } from 'react';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { gsap } from 'gsap';
import { AircraftWithPassengers } from '../Boarding/AircraftWithPassengers';
import {
    distributePax, initPassengers, Passenger, PaxBoardingStatus,
    createBoardingSequenceBackToFront, createBoardingSequenceRandom, createBoardingSequenceFrontToBack,
} from '../Boarding/PaxSim';

gsap.registerPlugin(MotionPathPlugin);

const NUM_PASSENGERS = 145;
export const BoardingPage = () => {
    const [pax, setPax] = useState<Passenger[]>([]);
    const [boardingStarted, setBoardingStarted] = useState<boolean>(false);
    const [height, setHeight] = useState(-1);
    const [timeline, setTimeline] = useState<gsap.core.Timeline | undefined>(undefined);
    const [passengersBoarded, setPassengersBoarded] = useState<number>(0);
    const [passengersSeated, setPassengersSeated] = useState<number>(0);

    const aircraftRef = useRef<HTMLDivElement>();
    useEffect(() => {
        const { offsetHeight } = aircraftRef.current as HTMLDivElement;
        if (offsetHeight) setHeight(offsetHeight);
    }, [aircraftRef]);

    useEffect(() => {
        if (pax.length === 0) {
            setPax(createPax());
        }
    });

    const createPax = () => {
        const thePax = initPassengers(NUM_PASSENGERS);
        let nextPaxIdx = distributePax(0, thePax, [0, 5]); // windows
        nextPaxIdx = distributePax(nextPaxIdx, thePax, [2, 3]); // aisle
        distributePax(nextPaxIdx, thePax, [1, 4]); // middle
        return thePax;
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
        setPax(pax?.map((p, idx) => {
            if (idx === paxIdx) {
                p.status = status;
            }
            return p;
        }));
    };

    const startBoardingBack2Front = () => {
        console.log(`startBoardingBack2Front: pax: ${pax.length}`);
        const paxSeq = createBoardingSequenceBackToFront(pax);
        startBoarding(true, paxSeq);
    };
    const startBoardingFront2Back = () => {
        const paxSeq = createBoardingSequenceFrontToBack(pax);
        startBoarding(true, paxSeq);
    };
    const startBoardingRandom = () => {
        const paxSeq = createBoardingSequenceRandom(pax);
        startBoarding(true, paxSeq);
    };

    const stopBoarding = () => {
        startBoarding(false, pax);
    };

    const finishBoarding = () => {
        timeline?.seek('100%', false);
    };

    const startBoarding = (boarding:boolean, thePax: Passenger[]) => {
        setBoardingStarted(boarding);

        if (timeline) {
            timeline.seek(0);
            timeline.kill();
            setPax(pax.map((p) => {
                p.status = PaxBoardingStatus.WAITING;
                return p;
            }));
            setPassengersBoarded(0);
            setPassengersSeated(0);
        }

        if (boarding) {
            const tl = gsap.timeline();

            thePax.forEach((p, idx) => {
                const duration = p.distance / 10;
                tl.to(`#passenger-${idx}`, {
                    duration,
                    onComplete,
                    onCompleteParams: [idx],
                    onStart,
                    onStartParams: [idx],
                    ease: 'none',
                    motionPath: {
                        path: `#motion-${idx}`,
                        align: `#motion-${idx}`,
                        autoRotate: false,
                        alignOrigin: [0.5, 0.5],
                    },
                }, '<+=1');
            });
            setTimeline(tl);
        }
    };

    return (
        <div className="flex relative flex-col flex-grow h-full">
            <div className="absolute top-6 right-16 rounded-md bg-theme-accent">
                <button
                    type="button"
                    onClick={() => startBoardingFront2Back()}
                    className="p-2 bg-opacity-50 hover:bg-opacity-100"
                    disabled={boardingStarted}
                >
                    Start boarding (Front-2-Back)
                </button>
                <br />
                <button
                    type="button"
                    onClick={() => startBoardingBack2Front()}
                    className="p-2 bg-opacity-50 hover:bg-opacity-100"
                    disabled={boardingStarted}
                >
                    Start boarding (Back-2-Front)
                </button>
                <br />
                <button
                    type="button"
                    onClick={() => startBoardingRandom()}
                    className="p-2 bg-opacity-50 hover:bg-opacity-100"
                    disabled={boardingStarted}
                >
                    Start boarding (Ryanair)
                </button>
                <br />
                <button
                    type="button"
                    onClick={() => finishBoarding()}
                    className="p-2 bg-opacity-50 hover:bg-opacity-100"
                    disabled={!boardingStarted}
                >
                    Finish boarding
                </button>
                <br />
                <button
                    type="button"
                    onClick={() => stopBoarding()}
                    className="p-2 bg-opacity-50 hover:bg-opacity-100"
                    disabled={!boardingStarted}
                >
                    Stop boarding
                </button>
                <br />
                <br />
                <div className="text-left">
                    <span>
                        Passengers Boarded:
                        {' '}
                        {passengersBoarded}
                        {' '}
                        /
                        {' '}
                        {NUM_PASSENGERS}
                    </span>
                    <br />
                    <span>
                        Passengers Seated:
                        {' '}
                        {passengersSeated}
                        {' '}
                        /
                        {' '}
                        {NUM_PASSENGERS}
                    </span>
                </div>
            </div>

            <div ref={aircraftRef} className="inset-x-0 mx-auto h-full">
                {pax !== undefined && (
                    <AircraftWithPassengers height={height} passengers={pax} />
                ) }
            </div>
        </div>
    );
};
