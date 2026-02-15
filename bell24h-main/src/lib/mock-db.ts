// Define User type (if not already globally available or in next-auth.d.ts)
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Password is used for mock auth, might not be on session user
  role: string;
}

class MockDB {
  private users: User[] = [
    {
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
      password: 'password',
      role: 'user',
    },
  ];
  private static instance: MockDB;

  private constructor() {}

  public static getInstance(): MockDB {
    if (!MockDB.instance) {
      MockDB.instance = new MockDB();
    }
    return MockDB.instance;
  }

  findUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  addUser(user: Omit<User, 'id' | 'password'> & { password?: string }): User {
    const newUser: User = {
      ...user,
      id: (this.users.length + 1).toString(), // Simple ID generation
      password: user.password, // Explicitly include password
    };
    this.users.push(newUser);
    console.log('User added to mock DB:', newUser);
    console.log('Current mock DB users:', this.users);
    return newUser;
  }

  getUsers(): User[] {
    return this.users;
  }
}

// Ensure the instance persists across hot reloads and in any runtime (edge or node)
// by attaching it to globalThis. Next.js clears the module cache between requests
// in edge runtimes, so relying on static module state is not enough.
const globalWithMockDB = globalThis as any;

if (!globalWithMockDB.__mock_db) {
  globalWithMockDB.__mock_db = MockDB.getInstance();
}

const db = globalWithMockDB.__mock_db;
export default db;
