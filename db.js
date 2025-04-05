//old

// const mongoose = require('mongoose');

// const uri = "mongodb+srv://juliusliew11:inBGybFXiD2LEE7v@tcgladder.r2nia.mongodb.net/?retryWrites=true&w=majority&appName=tcgladder";

// async function connectDB() {
//     try {
//         // Connect to the MongoDB server using Mongoose
//         await mongoose.connect(uri, {
//             useNewUrlParser: true,   // These are no longer required but for backward compatibility
//             useUnifiedTopology: true // It helps with keeping connections stable
//         });
//         console.log("You successfully connected to MongoDB!");

//     } catch (err) {
//         console.error("Connection failed", err);
//         process.exit(1);
//     }
// }

// module.exports = connectDB;

const mongoose = require('mongoose');

const uri = process.env.MONGO_URI; //Environment variable for the URI


async function connectDB() {
    try {
        // Connect to the MongoDB server using Mongoose
        await mongoose.connect(uri, {
            useNewUrlParser: true,  // These are no longer required but for backward compatibility
            useUnifiedTopology: true // It helps with keeping connections stable
        });
        console.log("You successfully connected to MongoDB!");
    } catch (err) {
        console.error("Connection failed", err);
        process.exit(1);
    }
}

module.exports = connectDB;
