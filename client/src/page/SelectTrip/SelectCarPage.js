import { useEffect, useState, useRef } from 'react';
import SelectSeat from './SelectSeat';
import CommentPage from '../CommentPage/index'
import './css/SelectCarPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation } from 'react-router-dom';
import { searchTrip } from '../../services/trip';
import {getAllTypeCar} from '../../services/typeCar';

export default function SelectCarPage() {
    const [trips, setTrips] = useState([])
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [selectedCar, setSelectedCar] = useState(null)
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [selectedCarType, setSelectedCarType] = useState([]);
    const [carType, setTypeCar] = useState(0);
    const overlayRef = useRef(null);
    useEffect(() => {
        (async () => {
            const typeCarDT = await getAllTypeCar()
            setSelectedCarType(typeCarDT)
        })()
    }, [])

    const [isOpen, setIsOpen] = useState(false);
    function openNewPage(tripId) {
        setIsOpen(true);
        setSelectedTripId(tripId);
    };

    useEffect(() => {
        function handleClickOutside(event) {
          if (
            overlayRef.current &&
            !overlayRef.current.contains(event.target)
          ) {
            setIsOpen(false);
          }
        }
    
        document.addEventListener("mousedown", handleClickOutside);
    
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [overlayRef]);

    const location = useLocation();

    const refetch = async () => {
        const { payload } = location.state
        const { content } = await searchTrip(
            payload.sourceCity, 
            payload.destinationCity, 
            payload.dateTime
        );

        setTrips(content)
    }

    useEffect(() => {
        const searchResult = location.state && location.state.data ? location.state.data : [];
        const { content } = searchResult;
        setTrips(content)
    }, [location])

    const onChooseTrip = async (trip) => {
        if (selectedTrip && selectedTrip.tripId === trip.tripId) {
            setSelectedCar(null)
            setSelectedTrip(null)
            await refetch()
            return;
        }

        await refetch()
        setSelectedTrip(trip);
    }

    const formatTime = (time) => {
        const timeParts = time.split(" ");
        return timeParts[1];
    };

    const handleSelectCar = (car) => {
        setSelectedCar(car)
    }

    return (
        <div className="select-car-page">
            <div className="col">
                <p className="select-car-page__title">Select The Trip</p>
            </div>
            <div>
                <div className="col">
                    {trips && trips.length > 0 ? (
                        <div className="select-car-page__list">
                            {trips.map((trip) => (
                                <div key={trip.tripId} className="car">

                                    <div>
                                        <div className="car__type-price">
                                            <p style={{ fontWeight: 500, fontSize: "20px" }}>Time start: {formatTime(trip.timeStart || "")}</p>
                                            <p style={{ fontWeight: 500, fontSize: "15px" }}>Price: {Intl.NumberFormat().format(trip.price) || ""}đ</p>
                                        </div>
                                        <div className="car__time-and-button">
                                            <div className="car__time">
                                                <div className='car__time-icon'>
                                                    <i>
                                                        <FontAwesomeIcon icon={['far', 'clock']} />
                                                    </i>
                                                    <i>
                                                        <FontAwesomeIcon icon={['far', 'clock']} />
                                                    </i>
                                                </div>
                                                <div>
                                                    <p>Departure Place</p>
                                                    <p>Journey Place</p>
                                                </div>
                                                <div>
                                                    <p style={{
                                                        fontSize: "60px",
                                                        margin: 0,
                                                        // transform: "translateY(-0px)",
                                                        fontWeight: 100,
                                                        opacity: 0.3
                                                    }}>
                                                        |
                                                    </p>
                                                </div>
                                                <div>
                                                    <p>{trip.provinceStart || ""}</p>
                                                    <p>{trip.provinceEnd || ""}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <button onClick={() => onChooseTrip(trip)} className="btn-choose">
                                                    {selectedTrip?.tripId === trip.tripId ? "Close" : "Choose a trip"}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="car__service">
                                            <div>
                                                <i>
                                                    <FontAwesomeIcon icon={['fas', 'snowflake']} />
                                                </i>
                                                <p>A/C</p>
                                            </div>
                                            <div>
                                                <p>|</p>
                                            </div>
                                            <div>
                                                <i>
                                                    <FontAwesomeIcon icon={['fas', 'wifi']} />
                                                </i>
                                                <p>Wifi</p>
                                            </div>
                                            <div>
                                                <p>|</p>
                                            </div>
                                            <div>
                                                <i>
                                                    <FontAwesomeIcon icon={['fas', 'charging-station']} />
                                                </i>
                                                <p>Charging Plug</p>
                                            </div>
                                            <div>
                                                <p>|</p>
                                            </div>
                                            <div>
                                                <button className='comment-button' onClick={() => openNewPage(trip.tripId)}>Comment</button>
                                                {   
                                                    isOpen && (
                                                    <div class="overlay">
                                                        <div className='comments-page' ref={overlayRef}>
                                                        <button onClick={() => {        
                                                            setIsOpen(false);
                                                            setSelectedTripId(null);
                                                        }} className='close'>&times;</button>
                                                        <CommentPage data={selectedTripId} trip={trip}/>
                                                        </div>
                                                    </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className='select-car-type' style={{ display: trip.tripId === selectedTrip?.tripId ? 'block' : 'none' }}>
                                        <label htmlFor='car-type'>Select car type:</label>
                                        <select id='car-type' value={carType} 
                                            onChange={(e) => {
                                                const selectedCarType = Number(e.target.value);
                                                setTypeCar(isNaN(selectedCarType) ? 0 : selectedCarType);
                                             }}>
                                            <option value=''>All</option>
                                            {selectedCarType?.map((carType, id) => (
                                            <option key={id} value={carType.typeCarId}>{carType.typeCarName}</option>
                                            ))}

                                        </select>
                                        </div>
                                        {(selectedCar && selectedTrip.tripId === trip.tripId)
                                            ? <SelectSeat trip={selectedTrip} car={selectedCar} />
                                            : (
                                                <div style={{ display: trip.tripId === selectedTrip?.tripId ? 'block' : 'none' }} className='car-list'>
                                                    {trip.car.filter((car) => carType === 0 || car.typeCar.typeCarId === carType).map((car, id) => (
                                                            <div className='car-list__item' key={id}>
                                    
                                                                <div>
                                                                    <h5> {car.typeCar.typeCarName} - Number {car.carNumber}</h5>
                                                                    <p>Seats: {car.chair.length}</p>
                                                                    <p>Empty: {car.emptySeats}</p>
                                                                </div>
                                                                <div>
                                                                    <button onClick={() => handleSelectCar(car)}>Select</button>
                                                                </div>
                                                            </div>
                                                    ))}
                                                </div>
                                            )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (<h4>No trips found</h4>)}
                </div>
            </div>
        </div>
    )
}