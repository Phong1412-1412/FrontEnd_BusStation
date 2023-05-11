import React, { useMemo } from "react";
import "./style.css";
import { Typography } from "antd";

function BookingDetails(props) {
  const detail = useMemo(() => props.bookingDetail);

  // Hàm để ghép các số ghế thành một chuỗi
  const getChairNumbers = () => {
    const chairNumbers = detail.details.map((orderDetail) => orderDetail.chair.chairNumber);
    return chairNumbers.join(", ");
  };

  return (
    <div className="booking-details">
      <Typography.Title className="title">Booking Details</Typography.Title>
      <div className="details">
        <table>
          <tbody>
            <tr>
              <td className="details-title">Departure:</td>
              <td className="details-des">{detail.trip.provinceStart}</td>
            </tr>
            <tr>
              <td className="details-title">Destination:</td>
              <td className="details-des">{detail.trip.provinceEnd}</td>
            </tr>
            <tr>
              <td className="details-title">Journey date:</td>
              <td className="details-des">{detail.trip.timeStart.substring(0, 10)}</td>
            </tr>
            <tr>
              <td className="details-title">Booking status:</td>
              {detail.details[0].status === true ? (
                <td style={{ color: "green" }} className="details-des">
                  Booking Success
                </td>
              ) : (
                <td style={{ color: "red" }} className="details-des">
                  Cancel
                </td>
              )}
            </tr>
            <tr>
              <td className="details-title">Ordered seats:</td>
              <td className="details-des">{getChairNumbers()}</td>
            </tr>
            <tr>
              <td className="details-title">Booking ID:</td>
              <td className="details-des">{detail.orderId}</td>
            </tr>
            <tr>
              <td className="details-title">Passenger:</td>
              <td className="details-des">{detail.user.fullName}</td>
            </tr>
            <tr>
              <td className="details-title">Mobile number:</td>
              <td className="details-des">{detail.user.phoneNumber}</td>
            </tr>
            <tr>
              <td className="details-title">Email:</td>
              <td className="details-des">{detail.user.email}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BookingDetails;
