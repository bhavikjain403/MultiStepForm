import React, { useState, useEffect } from "react";
import { Stepper, Step, Button, Typography } from "@material-tailwind/react";
import axios from "axios";

export default function StepperControl() {
    // Variable to keep track of active step of the form
    const [activeStep, setActiveStep] = useState(0);
    const [isLastStep, setIsLastStep] = useState(false);
    const [isFirstStep, setIsFirstStep] = useState(false);

    // Functions to increment/decrement active step
    const handleNext = () => !isLastStep && setActiveStep((cur) => cur + 1);
    const handlePrev = () => !isFirstStep && setActiveStep((cur) => cur - 1);

    // Object to save the entered data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dob: '',
        address1: '',
        address2: '',
        pincode: '',
    });

    // List of errors of step 1 and 2 respectively
    const [errors1, setErrors1] = useState({});
    const [errors2, setErrors2] = useState({});

    // List to store the fetched countries
    const [countryData, setCountryData] = useState([]);
    // Store selected country
    const [country, setCountry] = useState("");

    // List to store the fetched states
    const [stateData, setStateData] = useState([]);
    // Store selected state
    const [state, setState] = useState("");

    // List to store the fetched cities
    const [cityData, setCityData] = useState([]);
    // Store selected city
    const [city, setCity] = useState("");

    // Check if step 1 is validated
    const [step1Validated, setStep1Validated] = useState(1);
    // Check if step 2 is validated
    const [step2Validated, setStep2Validated] = useState(1);

    // Check if page is loaded for the first time (used during useEffect)
    const [firstRender, setFirstRender] = useState(1);

    // Fetching list of countries
    useEffect(() => {
        axios.get("https://api.countrystatecity.in/v1/countries",
            {
                method: 'GET',
                headers: {
                    "X-CSCAPI-KEY": process.env.REACT_APP_API_KEY,
                    "API_KEY": process.env.REACT_APP_API_KEY
                },
                redirect: 'follow'
            }).then((response) => {
                var result = response.data
                result.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
                setCountryData(result)
            });
    }, []);

    // Fetching list of states when country changes
    useEffect(() => {
        if (country !== "") {
            axios.get(`https://api.countrystatecity.in/v1/countries/${country.iso2}/states`,
                {
                    method: 'GET',
                    headers: {
                        "X-CSCAPI-KEY": process.env.REACT_APP_API_KEY,
                        "API_KEY": process.env.REACT_APP_API_KEY
                    },
                    redirect: 'follow'
                }).then((response) => {
                    var result = response.data
                    result.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
                    setStateData(result)
                });
        }
    }, [country]);

    // Fetching list of cities when state changes
    useEffect(() => {
        if (state !== "") {
            axios.get(`https://api.countrystatecity.in/v1/countries/${country.iso2}/states/${state.iso2}/cities`,
                {
                    method: 'GET',
                    headers: {
                        "X-CSCAPI-KEY": process.env.REACT_APP_API_KEY,
                        "API_KEY": process.env.REACT_APP_API_KEY
                    },
                    redirect: 'follow'
                }).then((response) => {
                    var result = response.data
                    result.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
                    setCityData(result)
                });
        }
    }, [state]);

    // Validating the forms when data changes
    useEffect(() => {
        if (firstRender === 1) {
            setFirstRender(0);
        }
        else {
            validateStep1();
            validateStep2();
        }
    }, [formData])

    // Resetting all the states
    const resetStates = () => {
        setActiveStep(0)
        setIsFirstStep(false)
        setIsLastStep(false)
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            dob: '',
            address1: '',
            address2: '',
            pincode: '',
        })
        setErrors1({})
        setErrors2({})
        setCountryData([])
        setCountry("")
        setStateData([])
        setState("")
        setCityData([])
        setCity("")
        setStep1Validated(1)
        setStep2Validated(1)
        setFirstRender(1)
    }

    // Change function to enter the data to formData
    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Validate step 1
    const validateStep1 = () => {
        const { firstName, lastName, email, dob } = formData;
        const errors = {};
        if (firstName.length === 0) {
            errors.firstName = 'First name is required';
            setErrors1(errors);
        }
        if (lastName.length === 0) {
            errors.lastName = 'Last name is required';
            setErrors1(errors);
        }
        if (!email.trim()) {
            errors.email = 'Email is required';
            setErrors1(errors);
        }
        else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Please enter a valid Email ID';
            setErrors1(errors);
        }
        if (!dob.trim()) {
            errors.dob = 'Date of Birth is required';
            setErrors1(errors);
        }
        else {
            var todayDate = new Date().toJSON().slice(0, 10) + ' 01:00:00'
            var birthDate = new Date(formData.dob)
            var myAge = Math.floor((Date.now(todayDate) - birthDate) / (31557600000));
            if (myAge > 30 || myAge < 10) {
                errors.dob = 'Age should be between 10 and 30 years'
            }
            setErrors1(errors);
        }
        setErrors1(errors)
        if (Object.keys(errors).length === 0) {
            setStep1Validated(0)
        }
        else {
            setStep1Validated(1)
        }
    };

    // Validate step 2 (More validations can be added)
    const validateStep2 = () => {
        const { address1 } = formData;
        const errors2 = {};

        if (address1.length === 0) {
            errors2.address1 = 'Address Line 1 is required';
            setErrors2(errors2)
        }
        setErrors2(errors2)
        if (Object.keys(errors2).length === 0) {
            setStep2Validated(0)
        }
        else {
            setStep2Validated(1)
        }
    };

    // Final submit and reset states
    const handleSubmit = e => {
        e.preventDefault();
        alert("Data submitted successfully!")
        resetStates()
    };


    // UI starts here
    return (
        <>
            <div className="px-6 mt-6 mb-6 text-lg font-bold">
                Complete Student Profile
            </div>
            <hr className="my-6 border-1 border-black" />
            <div className="w-full px-12 md:px-24 py-4">


                {/* Stepper to indicate form progress */}
                <Stepper
                    activeStep={activeStep}
                    isLastStep={(value) => setIsLastStep(value)}
                    isFirstStep={(value) => setIsFirstStep(value)}
                    lineClassName="bg-gray-500"
                    activeLineClassName="bg-indigo-500"
                >
                    <Step onClick={() => setActiveStep(0)} activeClassName="bg-indigo-500" completedClassName="bg-indigo-500">
                        1
                        <div className="absolute -bottom-[2rem] w-max text-center">
                            <Typography
                                variant="h6"
                                color={activeStep === 0 ? "indigo" : "indigo"}
                                className="invisible lg:visible"
                            >
                                Personal Information
                            </Typography>
                        </div>
                    </Step>

                    <Step onClick={() => setActiveStep(1)} activeClassName="bg-indigo-500" completedClassName="bg-indigo-500">
                        2
                        <div className="absolute -bottom-[2rem] w-max text-center">
                            <Typography
                                variant="h6"
                                color={activeStep < 1 ? "gray" : "indigo"}
                                className="invisible lg:visible"
                            >
                                Address Information
                            </Typography>
                        </div>
                    </Step>

                    <Step onClick={() => setActiveStep(2)} activeClassName="bg-indigo-500" completedClassName="bg-indigo-500">
                        3
                        <div className="absolute -bottom-[2rem] w-max text-center">
                            <Typography
                                variant="h6"
                                color={activeStep < 2 ? "gray" : "indigo"}
                                className="invisible lg:visible"
                            >
                                Confirmation
                            </Typography>
                        </div>
                    </Step>
                </Stepper>

                {/* Form components */}
                <form onSubmit={handleSubmit} className="bg-white mt-12 pt-6">

                    {/* Form Step 1 */}
                    {activeStep === 0 && (
                        <>
                            <div className="mb-6 text-lg font-bold">Let's Enter your Personal Details</div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">First Name</label>
                                    <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter your first name" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                    {errors1.firstName && <p className="text-red-500 text-xs italic">{errors1.firstName}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">Last Name</label>
                                    <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter your last name" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                    {errors1.lastName && <p className="text-red-500 text-xs italic">{errors1.lastName}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email ID</label>
                                    <input type="text" name="email" id="email" value={formData.email} onChange={handleChange} placeholder="Enter your email id" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                    {errors1.email && <p className="text-red-500 text-xs italic">{errors1.email}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dob">Date of Birth</label>
                                    <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                    {errors1.dob && <p className="text-red-500 text-xs italic">{errors1.dob}</p>}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Form Step 2 */}
                    {activeStep === 1 && (
                        <>
                            <div className="mb-6 text-lg font-bold">Enter your current mailing address</div>
                            <div className="grid lg:grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address1">Address Line 1<span className="text-red-700">*</span></label>
                                    <input type="text" name="address1" id="address1" value={formData.address1} onChange={handleChange} placeholder="Enter your address (Apt., suit, house no." className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                    {errors2.address1 && <p className="text-red-500 text-xs italic">{errors2.address1}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address2">Address Line 2 <span className="text-gray-500 text-xs font-normal">(optional)</span></label>
                                    <input type="text" name="address2" id="address2" value={formData.address2} onChange={handleChange} placeholder="Enter your last name" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                    {errors2.address2 && <p className="text-red-500 text-xs italic">{errors2.address2}</p>}
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="country">Country</label>
                                    <select name="country" id="country" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" onChange={(e) => { setCountry(JSON.parse(e.target.value)); setState(""); setCity("") }}>
                                        <option value="" disabled selected={country === ''}>Select a Country</option>
                                        {
                                            countryData.map((x, y) =>
                                                <option key={y} value={JSON.stringify(x)} selected={x.name === country.name}>{x.name}</option>
                                            )
                                        }
                                    </select>
                                    {errors2.country && <p className="text-red-500 text-xs italic">{errors2.country}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="state">State</label>
                                    <select name="state" id="state" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" onChange={(e) => { setState(JSON.parse(e.target.value)); setCity("") }}>
                                        <option value="" disabled selected={state === ''}>Select a State</option>
                                        {
                                            stateData.map((x, y) =>
                                                <option key={y} value={JSON.stringify(x)} selected={x.name === state.name}>{x.name}</option>
                                            )
                                        }
                                    </select>
                                    {errors2.state && <p className="text-red-500 text-xs italic">{errors2.state}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">City</label>
                                    <select name="city" id="city" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" onChange={(e) => { setCity(JSON.parse(e.target.value)) }}>
                                        <option value="" disabled selected={city === ''}>Select a City</option>
                                        {
                                            cityData.map((x, y) =>
                                                <option key={y} value={JSON.stringify(x)} selected={x.name === city.name}>{x.name}</option>
                                            )
                                        }
                                    </select>
                                    {errors2.city && <p className="text-red-500 text-xs italic">{errors2.city}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pincode">Pincode</label>
                                    <input type="text" name="pincode" id="pincode" value={formData.pincode} onChange={handleChange} placeholder="Enter Pincode" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                    {errors2.pincode && <p className="text-red-500 text-xs italic">{errors2.pincode}</p>}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Form Step 3 (Summary) */}
                    {activeStep === 2 && (
                        <>
                            <div className="mb-6 text-lg font-bold">Please confirm the data</div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <span className="text-gray-700 text-sm font-bold mb-2">First Name : </span>
                                    <span className="text-gray-500 text-sm font-semibold mb-2">{formData.firstName || "Not entered"}</span>
                                </div>
                                <div className="mb-4">
                                    <span className="text-gray-700 text-sm font-bold mb-2">Last Name : </span>
                                    <span className="text-gray-500 text-sm font-semibold mb-2">{formData.lastName || "Not entered"}</span>
                                </div>
                                <div className="mb-4">
                                    <span className="text-gray-700 text-sm font-bold mb-2">Email ID : </span>
                                    <span className="text-gray-500 text-sm font-semibold mb-2">{formData.email || "Not entered"}</span>
                                </div>
                                <div className="mb-4">
                                    <span className="text-gray-700 text-sm font-bold mb-2">Date of Birth : </span>
                                    <span className="text-gray-500 text-sm font-semibold mb-2">{formData.dob || "Not entered"}</span>
                                </div>
                                <div className="mb-4">
                                    <span className="text-gray-700 text-sm font-bold mb-2">Address Line 1 : </span>
                                    <span className="text-gray-500 text-sm font-semibold mb-2">{formData.address1 || "Not entered"}</span>
                                </div>
                                <div className="mb-4">
                                    <span className="text-gray-700 text-sm font-bold mb-2">Address Line 2 : </span>
                                    <span className="text-gray-500 text-sm font-semibold mb-2">{formData.address2 || "Not entered"}</span>
                                </div>
                                <div className="mb-4">
                                    <span className="text-gray-700 text-sm font-bold mb-2">Country : </span>
                                    <span className="text-gray-500 text-sm font-semibold mb-2">{country.name || "Not entered"}</span>
                                </div>
                                <div className="mb-4">
                                    <span className="text-gray-700 text-sm font-bold mb-2">State : </span>
                                    <span className="text-gray-500 text-sm font-semibold mb-2">{state.name || "Not entered"}</span>
                                </div>
                                <div className="mb-4">
                                    <span className="text-gray-700 text-sm font-bold mb-2">City : </span>
                                    <span className="text-gray-500 text-sm font-semibold mb-2">{city.name || "Not entered"}</span>
                                </div>
                                <div className="mb-4">
                                    <span className="text-gray-700 text-sm font-bold mb-2">Pincode : </span>
                                    <span className="text-gray-500 text-sm font-semibold mb-2">{formData.pincode || "Not entered"}</span>
                                </div>
                            </div>
                        </>
                    )}
                </form>

                <hr className="my-6 border-1 border-black" />

                {/* Submit buttons that are dynamically enabled/disabled */}
                <div className="mt-6 flex justify-between">
                    <Button onClick={handlePrev} disabled={isFirstStep} className="bg-white shadow-none normal-case text-black border-2 border-indigo-500 hover:bg-indigo-500 hover:text-white">
                        Back
                    </Button>
                    {
                        activeStep === 2 ? (
                            <Button onClick={handleSubmit} className="bg-indigo-500 shadow-none normal-case text-white hover:border-2 hover:border-indigo-500 hover:bg-white hover:text-black">
                                Finish
                            </Button>
                        ) :
                            (
                                activeStep === 0 ? (
                                    step1Validated === 1 ?
                                        <Button onClick={handleNext} disabled className="bg-gray-400 shadow-none normal-case text-black">
                                            Save & Continue
                                        </Button> :
                                        <Button onClick={handleNext} disabled={isLastStep} className="bg-indigo-500 shadow-none normal-case text-white hover:border-2 hover:border-indigo-500 hover:bg-white hover:text-black">
                                            Save & Continue
                                        </Button>
                                ) :
                                    (
                                        step2Validated === 1 ?
                                            <Button onClick={handleNext} disabled className="bg-gray-400 shadow-none normal-case text-black">
                                                Save & Continue
                                            </Button> :
                                            <Button onClick={handleNext} disabled={isLastStep} className="bg-indigo-500 shadow-none normal-case text-white hover:border-2 hover:border-indigo-500 hover:bg-white hover:text-black">
                                                Save & Continue
                                            </Button>
                                    )
                            )
                    }
                </div>
            </div>
            <hr className="my-6 border-1 border-black" />
            <div className="flex justify-center mb-6">
                Developed by Bhavik Jain
            </div>
        </>
    );
}