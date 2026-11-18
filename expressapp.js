
import express from 'express';

const app = express();

// Middleware to parse JSON data
app.use(express.json());

// Sample food records
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

// Validate food details
function validateFood(food) {

    if (
        !Number.isInteger(food.id) ||
        typeof food.foodName !== "string" ||
        !food.foodName.trim() ||
        typeof food.category !== "string" ||
        !food.category.trim() ||
        typeof food.price !== "number" ||
        food.price <= 0 ||
        typeof food.availability !== "boolean"
    ) {
        return "Invalid food details";
    }

    return null;
}

// 1. GET - Retrieve all foods
app.get('/foods', (req, res) => {

    res.status(200).json({
        message: "All food items",
        foods: foods
    });

});

// 2. GET - Retrieve food by ID
app.get('/foods/:id', (req, res) => {

    const id = Number(req.params.id);

    const food = foods.find(
        item => item.id === id
    );

    if (!food) {
        return res.status(404).json({
            message: "Food item not found"
        });
    }

    res.status(200).json(food);

});

// 3. POST - Add a new food item
app.post('/foods', (req, res) => {

    const newFood = req.body;

    if (
        !newFood ||
        typeof newFood !== "object" ||
        Array.isArray(newFood)
    ) {
        return res.status(400).json({
            message: "Invalid food data"
        });
    }

    const requiredFields = [
        "id",
        "foodName",
        "category",
        "price",
        "availability"
    ];

    const missingFields = requiredFields.filter(
        field => !Object.hasOwn(newFood, field)
    );

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: "Required fields are missing",
            missingFields
        });
    }

    const error = validateFood(newFood);

    if (error) {
        return res.status(400).json({
            message: error
        });
    }

    const exists = foods.some(
        food => food.id === newFood.id
    );

    if (exists) {
        return res.status(400).json({
            message: "Food ID already exists"
        });
    }

    foods.push(newFood);

    res.status(201).json({
        message: "Food item added successfully",
        food: newFood
    });

});

// 4. PUT - Update food details
app.put('/foods/:id', (req, res) => {

    const id = Number(req.params.id);

    const index = foods.findIndex(
        food => food.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Food item not found"
        });
    }

    const updatedData = req.body;

    if (
        !updatedData ||
        typeof updatedData !== "object" ||
        Array.isArray(updatedData) ||
        Object.keys(updatedData).length === 0 ||
        Object.hasOwn(updatedData, "id")
    ) {
        return res.status(400).json({
            message: "Invalid update data"
        });
    }

    const updatedFood = {
        ...foods[index],
        ...updatedData
    };

    const error = validateFood(updatedFood);

    if (error) {
        return res.status(400).json({
            message: error
        });
    }

    foods[index] = updatedFood;

    res.status(200).json({
        message: "Food item updated successfully",
        food: updatedFood
    });

});

// 5. DELETE - Delete food item
app.delete('/foods/:id', (req, res) => {

    const id = Number(req.params.id);

    const index = foods.findIndex(
        food => food.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Food item not found"
        });
    }

    const deletedFood = foods[index];

    foods.splice(index, 1);

    res.status(200).json({
        message: "Food item deleted successfully",
        food: deletedFood
    });

});

// Handle invalid routes
app.use((req, res) => {

    res.status(404).json({
        message: "404 - Route Not Found"
    });

});

// Handle invalid JSON and other errors
app.use((err, req, res, next) => {

    if (err instanceof SyntaxError && err.status === 400) {
        return res.status(400).json({
            message: "Invalid JSON data"
        });
    }

    res.status(500).json({
        message: "Internal Server Error"
    });

});

// Start Express server
app.listen(4000, () => {
    console.log("Express Server running at http://localhost:4000");
});
