import { Alert, Checkbox, FormControl, FormControlLabel, MenuItem, Modal, Select, TextField, Tooltip,InputLabel } from "@mui/material"
import ArgonBox from "components/ArgonBox"
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";
import ArgonTypography from "components/ArgonTypography"
import { useEffect, useState } from "react";
import { editCar } from "services/car";
import { createCar, deleteCar } from "services/car";
import {getAllTypeCar} from "services/typeCar";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const initialFormData = {
    carNumber: "",
    typeCarId: 1,
    status: true
};

const initialTypeCarFormData = {
    typeCarId: 1,
    typeCarName: "Limousine 9 chỗ",
    totalChairs: 9
};


const CarFormModal = ({ car, open, handleClose, refresh, mode}) => {
    const [formData, setFormData] = useState(initialFormData);
    const [typeCarFromData, setTypeCarFromData] = useState(initialTypeCarFormData);
    const [formError, setFormError] = useState("")
    const [formSuccess, setFormSuccess] = useState(false)
    const [typeCar , setTypeCar] = useState([])



    useEffect(() => {
        if (car) {
            const { carNumber, typeCarId, status, tripId } = car
            setFormData({
                carNumber,
                typeCarId,
                status
            })
        }
    }, [car])

    useEffect(() => {
        (async () => {
            const typeCarDT = await getAllTypeCar()
            setTypeCar(typeCarDT)
            console.log(typeCar)
        })()
    }, [])


    const onHandleClose = () => {
        setFormError("")
        setFormSuccess(false)
        setFormData(initialFormData)
        handleClose()
    }

    const handleCheckboxChange = (event) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            status: event.target.checked,
        }));
    };

    const handleInputWithNumberChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: Number(value),
        }));
    }

    const handleDelete = async () => {
        try {
            await deleteCar(car.carId)

            setFormError("")
            setFormSuccess(true)
            setFormData(initialFormData)

            await refresh()
        } catch (error) {
            setFormSuccess(false)
            setFormError("Remove car failed. Please check and try again !")
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            if (!car) {
                await createCar(formData)
            }


            if (car) {
                await editCar(car.carId, formData)
            }

            setFormError("")
            setFormSuccess(true)
            setFormData(initialFormData)

            await refresh()
        } catch (error) {
            setFormSuccess(false)
            setFormError("Update information failed. Please check and try again !")
        }
    };

    return (
        <Modal
            open={open}
            onClose={onHandleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <ArgonBox sx={style}>
                <ArgonTypography id="modal-modal-title" variant="h6" component="h2">
                    {car ? "Edit information" : "New car"}
                </ArgonTypography>
                <form onSubmit={handleSubmit}>
                    {(mode === "VIEW" && car)
                        && (
                            <ArgonInput
                                name="tripId"
                                placeholder="ID"
                                defaultValue={car.carId}
                                sx={{ my: 1 }}
                                required
                                fullWidth
                                disabled={mode === "VIEW"}
                            />
                        )
                    }

                    <ArgonInput
                        name="carNumber"
                        placeholder="Car number*"
                        type="number"
                        value={formData.carNumber}
                        onChange={handleInputWithNumberChange}
                        sx={{ my: 1 }}
                        required
                        fullWidth
                        disabled={mode === "VIEW"}
                    />

                    <FormControl variant="outlined" fullWidth sx={{ my: 1 }}>
                            <InputLabel id="select-type-car-label">Select type car*</InputLabel>
                            <Select
                            labelId="select-type-car-label"
                            name="typeCarId"
                            value={formData.typeCarId}
                            onChange={handleInputWithNumberChange}
                            label="Select type car*"
                            required
                            disabled={mode === "VIEW"}
                            >
                            <MenuItem value=""></MenuItem>
                            {typeCar.map((option) => (
                                <MenuItem key={option.typeCarId} value={option.typeCarId}>
                                {option.typeCarName} - {option.totalChairs} seats
                                </MenuItem>
                            ))}
                            </Select>
                        </FormControl>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.status}
                                onChange={handleCheckboxChange}
                                name="status"
                                color="primary"
                                disabled={!car || mode === "VIEW"}
                            />
                        }
                        label="Status"
                        sx={{ m: 0, my: 1 }}
                    />

                    {formSuccess && <ArgonBox sx={{ my: 2 }}> <Alert severity="success">Success</Alert> </ArgonBox>}
                    {formError && <ArgonBox sx={{ my: 2 }}> <Alert severity="error">Action failed</Alert> </ArgonBox>}

                    <ArgonBox sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <ArgonButton type="submit" variant="contained" color="primary">
                            {car ? "Update" : "Create"}
                        </ArgonButton>
                        {car
                            && (
                                <ArgonButton type="button" variant="outlined" color="error" onClick={handleDelete}>
                                    Delete
                                </ArgonButton>
                            )
                        }
                    </ArgonBox>
                </form>
            </ArgonBox>
        </Modal>
    )
}

export default CarFormModal