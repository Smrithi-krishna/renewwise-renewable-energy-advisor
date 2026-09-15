/* =====================================================
   RENEWWISE
   Renewable Energy Advisory System
   ===================================================== */


/* ================= GLOBAL STATE ================= */

let currentStep = 1;

let selectedDistrict = "";

let selectedSpace = "";

let selectedBudget = "";

let selectedGoal = "";

let selectedVehicles = "";

let map;


/* ================= START ADVISOR ================= */

function startAdvisor() {

    document
        .getElementById("advisor")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* ================= KERALA MAP ================= */

function initializeMap() {

    map = L.map("keralaMap", {
        zoomControl: true,
        attributionControl: true
    });


    fetch("Kerala_districts.geojson")

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Kerala_districts.geojson could not be loaded."
                );

            }

            return response.json();

        })


        .then(data => {

            /*
                Only show Kerala's 14 districts.

                Districts:
                admin_level = 5
                boundary = administrative
                geometry = Polygon / MultiPolygon
            */

            const districtLayer = L.geoJSON(
                data,
                {

                    /* ================= FILTER ================= */

                    filter: function (feature) {

                        const properties =
                            feature.properties || {};

                        const geometry =
                            feature.geometry || {};

                        return (
                            String(properties.admin_level) === "5" &&
                            properties.boundary === "administrative" &&
                            (
                                geometry.type === "Polygon" ||
                                geometry.type === "MultiPolygon"
                            )
                        );

                    },


                    /* ================= DISTRICT STYLE ================= */

                    style: function () {

                        return {

                            color: "#52745e",

                            weight: 1.5,

                            fillColor: "#dcebd9",

                            fillOpacity: 0.85

                        };

                    },


                    /* ================= DISTRICT EVENTS ================= */

                    onEachFeature:
                        function (feature, layer) {

                            const district =
                                getDistrictName(feature);


                            layer.bindTooltip(
                                district,
                                {
                                    permanent: true,

                                    direction: "center",

                                    className:
                                        "district-label"
                                }
                            );


                            /* ================= MOUSE OVER ================= */

                            layer.on(
                                "mouseover",
                                function () {

                                    if (
                                        selectedDistrict
                                        !== district
                                    ) {

                                        layer.setStyle({

                                            fillColor:
                                                "#b8d9b8",

                                            fillOpacity:
                                                1,

                                            weight:
                                                2.5

                                        });

                                    }

                                }
                            );


                            /* ================= MOUSE OUT ================= */

                            layer.on(
                                "mouseout",
                                function () {

                                    if (
                                        selectedDistrict
                                        !== district
                                    ) {

                                        districtLayer.resetStyle(
                                            layer
                                        );

                                    }

                                }
                            );


                            /* ================= CLICK ================= */

                            layer.on(
                                "click",
                                function () {

                                    selectDistrict(
                                        district,
                                        layer,
                                        districtLayer
                                    );

                                }
                            );

                        }

                }
            );


            /* ================= ADD DISTRICTS ================= */

            districtLayer.addTo(map);


            /* ================= FIT KERALA ================= */

            const bounds =
                districtLayer.getBounds();

            if (bounds.isValid()) {

                map.fitBounds(
                    bounds,
                    {
                        padding: [25, 25],

                        maxZoom: 8
                    }
                );

            }

        })


        .catch(error => {

            console.error(error);

            document
                .getElementById("keralaMap")
                .innerHTML = `

                    <div style="
                        padding:30px;
                        text-align:center;
                        color:#8a3d3d;
                    ">

                        <h3>
                            Map could not be loaded
                        </h3>

                        <p>
                            Make sure
                            <strong>
                                Kerala_districts.geojson
                            </strong>
                            is inside the same folder as
                            index.html.
                        </p>

                    </div>

                `;

        });

}


/* ================= GET DISTRICT NAME ================= */

function getDistrictName(feature) {

    const properties =
        feature.properties || {};


    const possibleNames = [

        "district",

        "District",

        "DISTRICT",

        "name",

        "Name",

        "NAME",

        "district_name",

        "District_Name",

        "DISTRICT_NAME"

    ];


    for (
        const key of possibleNames
    ) {

        if (
            properties[key] &&
            typeof properties[key] === "string"
        ) {

            return properties[key];

        }

    }


    return "Unknown District";

}


/* ================= SELECT DISTRICT ================= */

function selectDistrict(
    district,
    clickedLayer,
    districtLayer
) {

    selectedDistrict =
        normalizeDistrict(district);


    /* Reset all districts */

    districtLayer.eachLayer(
        function (layer) {

            districtLayer.resetStyle(
                layer
            );

        }
    );


    /* Highlight selected district */

    clickedLayer.setStyle({

        fillColor:
            "#4f9862",

        fillOpacity:
            1,

        color:
            "#245535",

        weight:
            3

    });


    /* Show selected location */

    document
        .getElementById(
            "selectedLocation"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "selectedDistrict"
        )
        .textContent =
        selectedDistrict +
        ", Kerala";


    /* Enable Continue */

    const continueButton =
        document.getElementById(
            "locationContinue"
        );


    continueButton.disabled =
        false;


    continueButton.style.opacity =
        "1";


    /* Zoom selected district */

    map.fitBounds(
        clickedLayer.getBounds(),
        {
            padding: [80, 80],

            maxZoom: 10
        }
    );

}


/* ================= NORMALIZE DISTRICT ================= */

function normalizeDistrict(name) {

    const cleanName =
        String(name || "")
            .trim()
            .replace(
                /\s+District$/i,
                ""
            );


    const lowerName =
        cleanName.toLowerCase();


    if (
        lowerName.includes(
            "ernakulam"
        )
    ) {

        return "Ernakulam";

    }


    if (
        lowerName.includes(
            "thiruvananthapuram"
        )
    ) {

        return "Thiruvananthapuram";

    }


    if (
        lowerName.includes(
            "kozhikode"
        )
    ) {

        return "Kozhikode";

    }


    if (
        lowerName.includes(
            "alappuzha"
        )
    ) {

        return "Alappuzha";

    }


    if (
        lowerName.includes(
            "trivandrum"
        )
    ) {

        return "Thiruvananthapuram";

    }


    if (
        lowerName.includes(
            "calicut"
        )
    ) {

        return "Kozhikode";

    }


    return cleanName;

}


/* ================= STEP NAVIGATION ================= */

function showStep(stepNumber) {

    document
        .querySelectorAll(".step")
        .forEach(
            step => {

                step.classList.remove(
                    "active"
                );

            }
        );


    const step =
        document.getElementById(
            "step" + stepNumber
        );


    if (!step) {

        console.error(
            "Step not found: step" +
            stepNumber
        );

        return;

    }


    step.classList.add(
        "active"
    );


    currentStep =
        stepNumber;


    /* ================= UPDATE PROGRESS ================= */

    document
        .getElementById(
            "stepNumber"
        )
        .textContent =
        stepNumber;


    document
        .getElementById(
            "progressFill"
        )
        .style.width =
        (
            stepNumber /
            6 *
            100
        ) + "%";


    /* ================= SCROLL ================= */

    document
        .getElementById(
            "advisor"
        )
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* ================= NEXT / PREVIOUS ================= */

function nextStep() {

    if (
        currentStep < 6
    ) {

        showStep(
            currentStep + 1
        );

    }

}


function previousStep() {

    if (
        currentStep > 1
    ) {

        showStep(
            currentStep - 1
        );

    }

}


/* ================= ENERGY VALIDATION ================= */

function validateEnergy() {

    const bill =
        Number(
            document
                .getElementById(
                    "bill"
                )
                .value
        ) || 0;


    const consumption =
        Number(
            document
                .getElementById(
                    "consumption"
                )
                .value
        ) || 0;


    if (
        bill <= 0 &&
        consumption <= 0
    ) {

        alert(
            "Please enter either your monthly electricity bill or consumption."
        );

        return;

    }


    nextStep();

}


/* ================= PROPERTY ================= */

function selectSpace(button) {

    document
        .querySelectorAll(
            "#step3 .choice"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "selected"
                );

            }
        );


    button.classList.add(
        "selected"
    );


    selectedSpace =
        button.dataset.space;

}


function validateProperty() {

    const property =
        document
            .getElementById(
                "property"
            )
            .value;


    const sunlight =
        document
            .getElementById(
                "sunlight"
            )
            .value;


    if (
        property === "" ||
        selectedSpace === "" ||
        sunlight === ""
    ) {

        alert(
            "Please complete all property details."
        );

        return;

    }


    nextStep();

}


/* ================= BUDGET ================= */

function selectBudget(
    button,
    value
) {

    document
        .querySelectorAll(
            ".budget-choice"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "selected"
                );

            }
        );


    button.classList.add(
        "selected"
    );


    selectedBudget =
        value;

}


function validateBudget() {

    if (
        selectedBudget === ""
    ) {

        alert(
            "Please select your approximate budget."
        );

        return;

    }


    nextStep();

}


/* ================= GOAL ================= */

function selectGoal(
    button,
    value
) {

    document
        .querySelectorAll(
            ".goal-choice"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "selected"
                );

            }
        );


    button.classList.add(
        "selected"
    );


    selectedGoal =
        value;

}


/* ================= GOAL VALIDATION ================= */

function validateGoal() {

    if (
        selectedGoal === ""
    ) {

        alert(
            "Please select your main goal."
        );

        return;

    }


    nextStep();

}


/* ================= VEHICLES ================= */

function selectVehicles(
    button,
    value
) {

    document
        .querySelectorAll(
            "#step6 .choice"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "selected"
                );

            }
        );


    button.classList.add(
        "selected"
    );


    selectedVehicles =
        value;

}


/* ================= VEHICLE VALIDATION ================= */

function validateVehicles() {

    /*
        Number of vehicles is required.
        Vehicle type and monthly expense are optional.
    */

    if (
        selectedVehicles === ""
    ) {

        alert(
            "Please select how many vehicles your household uses."
        );

        return false;

    }

    return true;

}


/* ================= VEHICLE TYPE NAME ================= */

function getVehicleTypeName(value) {

    const names = {

        petrol:
            "Petrol",

        diesel:
            "Diesel",

        cng:
            "CNG",

        electric:
            "Electric",

        mixed:
            "Mixed"

    };


    return (
        names[value] ||
        "—"
    );

}


/* ================= RECOMMENDATION ================= */

function generateRecommendation() {

    /* Validate vehicle section */

    if (
        !validateVehicles()
    ) {

        return;

    }


    const bill =
        Number(
            document
                .getElementById(
                    "bill"
                )
                .value
        ) || 0;


    let consumption =
        Number(
            document
                .getElementById(
                    "consumption"
                )
                .value
        ) || 0;


    const property =
        document
            .getElementById(
                "property"
            )
            .value;


    const sunlight =
        document
            .getElementById(
                "sunlight"
            )
            .value;


    const vehicleType =
        document
            .getElementById(
                "vehicleType"
            )
            .value;


    const vehicleExpense =
        Number(
            document
                .getElementById(
                    "vehicleExpense"
                )
                .value
        ) || 0;


    /* ================= CONSUMPTION ESTIMATE ================= */

    if (
        consumption === 0 &&
        bill > 0
    ) {

        consumption =
            Math.round(
                bill / 9
            );

    }


    /* ================= SCORE ================= */

    let score = 50;


    const solarFriendly = [

        "Ernakulam",

        "Thrissur",

        "Palakkad",

        "Malappuram",

        "Kozhikode",

        "Kannur",

        "Kasaragod",

        "Alappuzha"

    ];


    if (
        solarFriendly.includes(
            selectedDistrict
        )
    ) {

        score += 8;

    }


    /* ================= SUNLIGHT ================= */

    if (
        sunlight === "high"
    ) {

        score += 20;

    }

    else if (
        sunlight === "medium"
    ) {

        score += 10;

    }

    else if (
        sunlight === "low"
    ) {

        score -= 10;

    }


    /* ================= ROOFTOP SPACE ================= */

    if (
        selectedSpace === "large"
    ) {

        score += 15;

    }

    else if (
        selectedSpace === "medium"
    ) {

        score += 10;

    }

    else if (
        selectedSpace === "small"
    ) {

        score += 3;

    }


    /* ================= PROPERTY ================= */

    if (
        property === "house"
    ) {

        score += 5;

    }

    else if (
        property === "commercial"
    ) {

        score += 8;

    }


    /* ================= BUDGET ================= */

    if (
        selectedBudget === "high" ||
        selectedBudget === "premium"
    ) {

        score += 8;

    }

    else if (
        selectedBudget === "medium"
    ) {

        score += 4;

    }


    /* ================= GOAL ================= */

    if (
        selectedGoal === "saving" ||
        selectedGoal === "environment" ||
        selectedGoal === "independence" ||
        selectedGoal === "longterm"
    ) {

        score += 5;

    }


    /* ================= LIMIT SCORE ================= */

    score =
        Math.max(
            0,
            Math.min(
                99,
                score
            )
        );


    /* =====================================================
       RECOMMENDED RENEWABLE ENERGY SOLUTION
       ===================================================== */

    let recommendedSolution =
        "Rooftop Solar";


    let recommendationText =
        "Rooftop solar is a suitable option based on your property, sunlight availability and energy needs.";


    if (
        sunlight === "low" &&
        selectedSpace === "small"
    ) {

        recommendedSolution =
            "Solar Water Heating";


        recommendationText =
            "Solar water heating may be a more practical renewable-energy option when rooftop electricity generation is limited by shade and available space.";

    }


    else if (
        selectedSpace === "small" &&
        sunlight === "medium"
    ) {

        recommendedSolution =
            "Solar Water Heating";


        recommendationText =
            "Solar water heating may be suitable when available installation space is limited and the rooftop receives partial sunlight.";

    }


    else if (
        selectedGoal === "environment" &&
        property === "commercial" &&
        selectedSpace === "large" &&
        sunlight === "high"
    ) {

        recommendedSolution =
            "Rooftop Solar";


        recommendationText =
            "Rooftop solar is well suited to a large commercial property with good sunlight availability and a focus on reducing environmental impact.";

    }


    else if (
        selectedGoal === "independence" &&
        selectedSpace === "large" &&
        sunlight === "high"
    ) {

        recommendedSolution =
            "Rooftop Solar + Battery Storage";


        recommendationText =
            "A rooftop solar system combined with battery storage can support greater energy independence where sufficient rooftop space and sunlight are available.";

    }


    else if (
        selectedGoal === "saving" ||
        selectedGoal === "longterm"
    ) {

        recommendedSolution =
            "Rooftop Solar";


        recommendationText =
            "Rooftop solar can help reduce dependence on grid electricity and may support long-term electricity-cost savings.";

    }


    /* ================= DISPLAY MAIN RECOMMENDATION ================= */

    document
        .getElementById(
            "recommendedSolution"
        )
        .textContent =
        recommendedSolution;


    document
        .getElementById(
            "recommendationText"
        )
        .textContent =
        recommendationText;


    /* ================= SYSTEM SIZE ================= */

    let systemSize = 2;


    if (
        consumption > 250
    ) {

        systemSize = 3;

    }


    if (
        consumption > 400
    ) {

        systemSize = 4;

    }


    if (
        consumption > 550
    ) {

        systemSize = 5;

    }


    /* ================= SAVINGS ================= */

    let annualSavings;


    if (
        bill > 0
    ) {

        annualSavings =
            Math.round(
                bill *
                12 *
                0.65
            );

    }

    else {

        annualSavings =
            Math.round(
                consumption *
                12 *
                9 *
                0.65
            );

    }


    if (
        !annualSavings ||
        annualSavings < 0
    ) {

        annualSavings = 25000;

    }


    /* ================= CARBON ================= */

    const annualGeneration =
        systemSize *
        1200;


    const carbonReduction =
        (
            annualGeneration *
            0.7 /
            1000
        ).toFixed(1);


    /* =====================================================
       MOBILITY RECOMMENDATION
       ===================================================== */

    let mobilityRecommendation =
        "Consider a cleaner transportation option when replacing your current vehicle.";


    if (
        selectedVehicles === "0"
    ) {

        mobilityRecommendation =
            "Consider public transport, walking or cycling where practical to reduce transportation emissions.";

    }


    else if (
        vehicleType === "petrol" ||
        vehicleType === "diesel"
    ) {

        if (
            vehicleExpense >= 5000
        ) {

            mobilityRecommendation =
                "Your household has relatively high monthly fuel spending. Consider an electric vehicle (EV) or CNG vehicle when replacing a vehicle.";

        }

        else {

            mobilityRecommendation =
                "Consider an EV or CNG vehicle when your current petrol or diesel vehicle is due for replacement.";

        }

    }


    else if (
        vehicleType === "cng"
    ) {

        mobilityRecommendation =
            "CNG is already a cleaner alternative to conventional petrol or diesel use. Consider an EV when replacing your vehicle.";

    }


    else if (
        vehicleType === "electric"
    ) {

        mobilityRecommendation =
            "Electric mobility is already a cleaner transportation choice. Continue using your EV efficiently.";

    }


    else if (
        vehicleType === "mixed"
    ) {

        mobilityRecommendation =
            "Consider gradually replacing petrol or diesel vehicles with EVs or CNG vehicles.";

    }


    /* ================= DISPLAY RESULT ================= */

    document
        .getElementById(
            "resultDistrict"
        )
        .textContent =
        selectedDistrict;


    document
        .getElementById(
            "profileLocation"
        )
        .textContent =
        selectedDistrict +
        ", Kerala";


    document
        .getElementById(
            "profileUsage"
        )
        .textContent =
        Math.round(
            consumption
        ) +
        " kWh/month";


    document
        .getElementById(
            "profileProperty"
        )
        .textContent =
        getPropertyName(
            property
        );


    document
        .getElementById(
            "profileGoal"
        )
        .textContent =
        getGoalName(
            selectedGoal
        );


    document
        .getElementById(
            "score"
        )
        .textContent =
        score + "%";


    document
        .getElementById(
            "systemSize"
        )
        .textContent =
        systemSize + " kW";


    document
        .getElementById(
            "savings"
        )
        .textContent =
        "₹" +
        annualSavings.toLocaleString(
            "en-IN"
        );


    document
        .getElementById(
            "carbon"
        )
        .textContent =
        carbonReduction +
        " tonnes";


    /* ================= MOBILITY RESULT ================= */

    document
        .getElementById(
            "resultVehicles"
        )
        .textContent =
        selectedVehicles === "0"
            ? "None"
            : selectedVehicles;


    document
        .getElementById(
            "resultVehicleType"
        )
        .textContent =
        getVehicleTypeName(
            vehicleType
        );


    document
        .getElementById(
            "resultVehicleExpense"
        )
        .textContent =
        vehicleExpense > 0
            ? "₹" +
              vehicleExpense.toLocaleString(
                  "en-IN"
              )
            : "Not provided";


    document
        .getElementById(
            "mobilityRecommendation"
        )
        .textContent =
        mobilityRecommendation;


    /* ================= SHOW RESULT ================= */

    document
        .getElementById(
            "result"
        )
        .classList.add(
            "show"
        );


    document
        .getElementById(
            "result"
        )
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* ================= DISPLAY NAMES ================= */

function getPropertyName(
    value
) {

    const names = {

        house:
            "Independent House",

        apartment:
            "Apartment",

        commercial:
            "Commercial Building"

    };


    return (
        names[value] ||
        "—"
    );

}


function getGoalName(
    value
) {

    const names = {

        saving:
            "Reduce electricity bills",

        environment:
            "Reduce carbon footprint",

        independence:
            "Energy independence",

        longterm:
            "Long-term savings"

    };


    return (
        names[value] ||
        "—"
    );

}


/* ================= RESTART ================= */

function restartAssessment() {

    selectedDistrict = "";

    selectedSpace = "";

    selectedBudget = "";

    selectedGoal = "";

    selectedVehicles = "";


    /* Hide result */

    document
        .getElementById(
            "result"
        )
        .classList.remove(
            "show"
        );


    /* Reset form fields */

    const energyForm =
        document.getElementById(
            "energyForm"
        );


    if (energyForm) {

        energyForm.reset();

    }


    const bill =
        document.getElementById(
            "bill"
        );

    const consumption =
        document.getElementById(
            "consumption"
        );

    const property =
        document.getElementById(
            "property"
        );

    const sunlight =
        document.getElementById(
            "sunlight"
        );

    const vehicleType =
        document.getElementById(
            "vehicleType"
        );

    const vehicleExpense =
        document.getElementById(
            "vehicleExpense"
        );


    if (bill) {
        bill.value = "";
    }


    if (consumption) {
        consumption.value = "";
    }


    if (property) {
        property.value = "";
    }


    if (sunlight) {
        sunlight.value = "";
    }


    if (vehicleType) {
        vehicleType.value = "";
    }


    if (vehicleExpense) {
        vehicleExpense.value = "";
    }


    /* Remove selected states */

    document
        .querySelectorAll(
            ".selected"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "selected"
                );

            }
        );


    /* Hide selected location */

    document
        .getElementById(
            "selectedLocation"
        )
        .classList.add(
            "hidden"
        );


    /* Disable location button */

    document
        .getElementById(
            "locationContinue"
        )
        .disabled = true;


    currentStep = 1;


    showStep(1);


    /* Rebuild map */

    if (map) {

        map.remove();

        map = null;

    }


    initializeMap();

}


/* ================= START ================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeMap();

    }
);


/* =====================================================
   DARK / LIGHT MODE
   ===================================================== */

function toggleTheme() {

    document.body.classList.toggle(
        "dark-mode"
    );


    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );


    const themeIcon =
        document.getElementById(
            "themeIcon"
        );


    if (isDark) {

        themeIcon.textContent =
            "☀️";


        localStorage.setItem(
            "renewwise-theme",
            "dark"
        );

    }

    else {

        themeIcon.textContent =
            "🌙";


        localStorage.setItem(
            "renewwise-theme",
            "light"
        );

    }

}


/* ================= REMEMBER THEME ================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const savedTheme =
            localStorage.getItem(
                "renewwise-theme"
            );


        const themeIcon =
            document.getElementById(
                "themeIcon"
            );


        if (
            savedTheme === "dark"
        ) {

            document.body.classList.add(
                "dark-mode"
            );


            if (themeIcon) {

                themeIcon.textContent =
                    "☀️";

            }

        }

        else {

            if (themeIcon) {

                themeIcon.textContent =
                    "🌙";

            }

        }

    }
);