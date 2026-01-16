import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(cors());

// app.listen(8787, () => {
//     console.log("Server started!");
// });

const PORT = process.env.PORT || 8787; 
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

app.get("/", (req, res) => {
    res.send("Hello World!");
}
);

//add get request that check if the request body has name = "admin" and password = 123456
//path: localhost:8787/login
app.post("/login", (req, res) => {
    const body = req.body;
    if (body.name === "admin" && body.password === "123456") {
        res.status(200).send("Login success!");
    } else {
     res.status(401).send("Login failed!");
    }
});

// add post request that add new appointment to the appointments array and check in the array if the time is available or not
const appointments = [];

app.post("/appointment", (req, res) => {
    const body = req.body;

    const isTaken = appointments.some(
        (appointment) => appointment.dateTime === body.dateTime
    );

    if (!isTaken) {
        appointments.push(body);
        res.status(200).send("Appointment added successfully!");
    } else 
        res.status(400).send("Appointment is not available!");
});


// add get request that return all appointments
app.get("/appointments", (req, res) => {
    res.send(appointments);
});
let services = [];
let nextId = 1;

app.post("/service", (req, res) => {
    const serviceExists = services.some(service => service.name === req.body.name);
    if (serviceExists) {
        res.status(400).send("Service already exists!");
        return;
    }
    const newService = { id: nextId++, ...req.body };
    services.push(newService);
    res.status(200).json(newService); // מחזיר את האובייקט החדש
});

app.get("/services", (req, res) => {
    res.json(services);
});


let businessData ={
  name: "Respira",
  address: "Yafo - Jerusalem",
  phone: "02-6442222",
  owners: "owners: 45921",
  logo: "/images/logo.png"
};

app.post("/businessData", (req, res) => {
    const body = req.body;
    businessData = body;
    res.statusCode = 200;
    res.send(businessData);
});

app.get("/businessData", (req, res) => {
    res.send(businessData);
});
