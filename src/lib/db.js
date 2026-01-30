import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
async function ensureDataDir() {
    const dirPath = path.dirname(dataFilePath);
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

// Read users from JSON file
export async function getUsers() {
    await ensureDataDir();
    try {
        const fileData = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(fileData);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return []; // Return empty array if file doesn't exist
        }
        throw error;
    }
}

// Write users to JSON file
export async function saveUsers(users) {
    await ensureDataDir();
    await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), 'utf8');
}

// Find user by email
export async function findUserByEmail(email) {
    const users = await getUsers();
    return users.find(user => user.email === email);
}

// Create new user
export async function createUser(userData) {
    const users = await getUsers();
    const newUser = { id: Date.now().toString(), ...userData };
    users.push(newUser);
    await saveUsers(users);
    return newUser;
}
