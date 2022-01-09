import React, { useEffect, useRef, useState } from 'react';
import Button, { BUTTON_TYPE } from '../../Components/Button/Button';
import { AircraftWithPassengers } from '../Boarding/AircraftWithPassengers';
import { useBoarding } from '../Boarding/BoardingContextProvider';

export const BoardingPage = () => {
    const [height, setHeight] = useState(-1);
    const aircraftRef = useRef<HTMLDivElement>(null);
    const boardingContext = useBoarding();

    useEffect(() => {
        const { offsetHeight } = aircraftRef.current as HTMLDivElement;
        if (offsetHeight) setHeight(offsetHeight);
    }, [aircraftRef]);

    return (
        <div className="flex relative flex-col flex-grow h-full">
            <div className="absolute top-6 right-16">
                <Button
                    className="mb-2"
                    type={BUTTON_TYPE.BLUE}
                    onClick={() => boardingContext.startBoarding()}
                    disabled={boardingContext.boardingStarted}
                >
                    {`Start boarding ${boardingContext.boardingType.text}`}
                </Button>
                <Button
                    className="mb-2"
                    type={BUTTON_TYPE.BLUE}
                    onClick={() => boardingContext.pauseBoarding()}
                    disabled={!boardingContext.boardingStarted}
                >
                    Pause boarding
                </Button>
                <Button
                    className="mb-2"
                    type={BUTTON_TYPE.BLUE}
                    onClick={() => boardingContext.resetBoarding()}
                    disabled={!boardingContext.boardingStarted}
                >
                    Reset boarding
                </Button>
                <Button
                    className="mb-2"
                    type={BUTTON_TYPE.BLUE}
                    onClick={() => boardingContext.completeBoarding()}
                    disabled={!boardingContext.boardingStarted}
                >
                    Complete boarding now
                </Button>
            </div>
            <br />
            <div className="grid absolute top-6 left-6 grid-cols-2 rounded-md">
                <div className="mr-1">Passengers boarded:</div>
                <div className="w-24 text-right">{`${boardingContext.passengersBoarded} / ${boardingContext.numberOfPassengers}`}</div>
                <div className="mr-1">Passengers seated:</div>
                <div className="w-24 text-right">{`${boardingContext.passengersSeated} / ${boardingContext.numberOfPassengers}`}</div>
            </div>

            <div ref={aircraftRef} className="inset-x-0 mx-auto h-full">
                <AircraftWithPassengers height={height} passengers={boardingContext.passengers} />
            </div>
        </div>
    );
};
