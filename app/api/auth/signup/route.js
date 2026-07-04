import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { employeeId, email, password, role, name, phone, address } = body;

    if (!employeeId || !email || !password || !role || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const users = db.getUsers();
    
    // Check if ID or Email already exists
    if (users.some(u => u.employeeId === employeeId)) {
      return NextResponse.json({ error: "Employee ID already exists" }, { status: 400 });
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const passwordHash = db.hashPassword(password);

    // Initialize defaults based on role
    const salaryStructure = role === 'admin' 
      ? { basic: 8000, hra: 3000, lta: 1500, allowances: 2000, deductions: 500 }
      : { basic: 4000, hra: 1500, lta: 800, allowances: 1200, deductions: 250 };

    const jobDetails = {
      title: role === 'admin' ? "HR Specialist" : "Junior Developer",
      department: role === 'admin' ? "Human Resources" : "Engineering",
      joiningDate: new Date().toISOString().split('T')[0],
      status: "Active"
    };

    const newUser = {
      employeeId,
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
      phone: phone || "",
      address: address || "",
      profilePicture: "",
      jobDetails,
      salaryStructure,
      documents: []
    };

    db.saveUser(newUser);

    return NextResponse.json({ message: "Registration successful" }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
