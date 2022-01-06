import React, { } from 'react';
import { Passenger, PaxBoardingStatus } from './PaxSim';
import './Aircraft.css';
import { AircraftGroup } from './AircraftGroup';

type AircraftWithPassengersProps = {
    height: number;
    passengers: Passenger[];
}

export const AircraftWithPassengers = ({ height, passengers }:AircraftWithPassengersProps) => {
    const passengerClass = (paxStatus: PaxBoardingStatus) => {
        switch (paxStatus) {
        case PaxBoardingStatus.WAITING:
            return 'passengerWaiting';
        case PaxBoardingStatus.SEATED:
            return 'passengerSeated';
        case PaxBoardingStatus.BOARING:
        default:
            return 'passengerBoarding';
        }
    };

    const passengersElements = passengers.map((p, idx) => (
        <React.Fragment key={idx}>
            <path className="passengerPath" id={`motion-${idx}`} d={p.svgMotionPath} />
            <path className={passengerClass(p.status)} id={`passenger-${idx}`} d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" transform="scale(0.4 0.4)" />
        </React.Fragment>
    ));

    return (
        <svg
            viewBox="0 0 548.96005 575.39247"
            version="1.1"
            width={height}
        >
            <AircraftGroup />
            {passengersElements}
        </svg>
    );
};
