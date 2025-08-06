import mongoose from 'mongoose';
import chalk from 'chalk';  // Import chalk for colorizing logs

const { connect } = mongoose;

export async function connectDB() {
    try {
        const conn = await connect(process.env.MONGO_URI);
        
        // Colorize the log message
        console.log(chalk.cyan.bold(`MongoDB Connected: ${conn.connection.host}`)); // Cyan and bold

    } catch (error) {
        // Colorize the error message
        console.log(chalk.red(`Error: ${error.message}`));  // Red color for error
        process.exit(1);
    }
}

