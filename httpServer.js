
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current folder path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Food records
let foods = [
    {
        id: 1,
        foodName: "Pizza",
        category: "Fast Food",
        price: 250,
        availability: true
    },
    {
        id: 2,
        foodName: "Burger",
        category: "Fast Food",
        price: 120,
        availability: true
    },
    {
        id: 3,
        foodName: "Pasta",
        category: "Italian",
        price: 180,
        availability: false
    }
];

// Helper function to send JSON
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify(data));
}

// Create HTTP server
const server = http.createServer((req, res) => {

    // GET /
    if (req.url === "/" && req.method === "GET") {
        res.writeHead(200, {
            "Content-Type": "text/html"
        });

        res.end(`
            <h1>Welcome to Food Ordering System</h1>
            <p>Order your favourite food online!</p>
        `);
    }

    // GET /foods
    else if (req.url === "/foods" && req.method === "GET") {
        const availableFoods = foods.filter(
            food => food.availability === true
        );

        sendJSON(res, 200, availableFoods);
    }

    // GET /about
    else if (req.url === "/about" && req.method === "GET") {
        sendJSON(res, 200, {
            restaurantName: "Food Ordering Restaurant",
            location: "India",
            message: "We serve delicious food."
        });
    }

    // GET /menu
    else if (req.url === "/menu" && req.method === "GET") {
        const menuPath = path.join(__dirname, "public", "menu.html");

        fs.readFile(menuPath, "utf8", (err, data) => {
            if (err) {
                sendJSON(res, 500, {
                    message: "Error reading menu file"
                });
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/html"
            });

            res.end(data);
        });
    }

    // POST /add-food
    else if (req.url === "/add-food" && req.method === "POST") {
        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {
            try {
                const newFood = JSON.parse(body);

                const requiredFields = [
                    "id",
                    "foodName",
                    "category",
                    "price",
                    "availability"
                ];

                if (
                    newFood === null ||
                    typeof newFood !== "object" ||
                    Array.isArray(newFood) ||
                    !requiredFields.every(field =>
                        Object.hasOwn(newFood, field)
                    )
                ) {
                    sendJSON(res, 400, {
                        message: "All food fields are required"
                    });
                    return;
                }

                if (
                    !Number.isInteger(newFood.id) ||
                    typeof newFood.foodName !== "string" ||
                    !newFood.foodName.trim() ||
                    typeof newFood.category !== "string" ||
                    !newFood.category.trim() ||
                    typeof newFood.price !== "number" ||
                    newFood.price <= 0 ||
                    typeof newFood.availability !== "boolean"
                ) {
                    sendJSON(res, 400, {
                        message: "Invalid food details"
                    });
                    return;
                }

                const exists = foods.some(
                    food => food.id === newFood.id
                );

                if (exists) {
                    sendJSON(res, 400, {
                        message: "Food ID already exists"
                    });
                    return;
                }

                foods.push(newFood);

                sendJSON(res, 201, {
                    message: "Food added successfully",
                    food: newFood
                });

            } catch (error) {
                sendJSON(res, 400, {
                    message: "Invalid JSON format"
                });
            }
        });
    }

    // Invalid route
    else {
        sendJSON(res, 404, {
            message: "Route not found"
        });
    }
});

// Start server
server.listen(3000, () => {
    console.log("HTTP Server running at http://localhost:3000");
});
