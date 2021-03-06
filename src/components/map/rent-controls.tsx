import classNames from 'classnames';
import React, { useCallback, useContext } from 'react';

import { useFormField } from '../../hooks/form';
import { useSavedPin } from '../../hooks/pin';
import { StationDetail } from '../../hooks/rent-popup';
import { Booking, Slot, Station } from '../../model';
import { LanguageContext } from '../../resources/language';

import './rent-controls.scss';
import Slider from './slider';

interface RentControlsProps {
  booking: Booking | null;
  className?: string;
  openedStation: StationDetail;
  selectedSlot: Slot | null;
  stations: Station[];

  onBookBike: React.MouseEventHandler;
  onCancelBooking: React.MouseEventHandler;
  onRentBike: (pin: string) => void;
}

const RentControls: React.FC<RentControlsProps> = ({
  booking,
  className,
  openedStation,
  selectedSlot,
  stations,

  onBookBike,
  onCancelBooking,
  onRentBike,
}) => {
  const [pin, setPin] = useSavedPin();
  const [pinInput, handlePinChange] = useFormField('');

  const handleSubmitPin = useCallback(
    (ev: React.FormEvent) => {
      ev.preventDefault();
      setPin(pinInput);
    },
    [pinInput],
  );

  const { map, BUCHUNGEN } = useContext(LanguageContext);

  const canRentBike =
    openedStation.station.state === 'OPERATIVE' &&
    openedStation.slots.stationSlots.some(s => s.isOccupied);
  const bookedStation =
    booking &&
    stations.find(station => station.stationId === booking.stationId);
  const isOpenedStationBooked =
    booking && booking.stationId === openedStation.station.stationId;

  return pin ? (
    <div className={classNames('rent-controls', className)}>
      <Slider
        background={() => (
          <div className="slider-content column">
            <span>
              {selectedSlot
                ? `${map.RENT.SLIDE_FOR_BIKE_NO1} ${
                    selectedSlot.stationSlotPosition
                  } ${map.RENT.SLIDE_FOR_BIKE_NO2}`
                : map.RENT.SLIDE_FOR_BEST_BIKE}
            </span>
          </div>
        )}
        disabled={!canRentBike}
        onCompleted={() => onRentBike(pin)}
      />

      <button
        className="btn outline book"
        disabled={!canRentBike && !booking}
        onClick={!booking ? onBookBike : onCancelBooking}
      >
        {!booking
          ? map.BOOKING.BOOK_BIKE
          : `${BUCHUNGEN.RESERVIERUNG.BUTTON} ${
              !isOpenedStationBooked ? `(${bookedStation!.name})` : ''
            }`}
      </button>
    </div>
  ) : (
    <form
      className={classNames('rent-controls', className)}
      onSubmit={handleSubmitPin}
    >
      <p>{map.PIN.CTA}</p>

      <input
        className="input outline"
        onChange={handlePinChange}
        placeholder="PIN"
        type="tel"
        value={pinInput}
      />

      <button
        className="btn outline"
        disabled={
          !pinInput ||
          isNaN((pinInput as unknown) as number) ||
          !isFinite((pinInput as unknown) as number)
        }
        type="submit"
      >
        {map.PIN.ACTION}
      </button>
    </form>
  );
};

export default RentControls;
