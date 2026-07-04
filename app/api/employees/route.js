import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = db.getUsers().map(({ passwordHash, ...user }) => user);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Fetch employees error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { employeeId, name, phone, address, profilePicture, role, jobDetails, salaryStructure } = body;

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const allUsers = db.getUsers();
    const targetUser = allUsers.find(u => u.employeeId === employeeId);
    if (!targetUser) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Role verification
    if (currentUser.role !== 'admin' && currentUser.employeeId !== employeeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prepare updated user object
    let updatedUser = { ...targetUser };

    if (currentUser.role === 'admin') {
      // Admin can update everything
      if (name !== undefined) updatedUser.name = name;
      if (phone !== undefined) updatedUser.phone = phone;
      if (address !== undefined) updatedUser.address = address;
      if (profilePicture !== undefined) updatedUser.profilePicture = profilePicture;
      if (role !== undefined) updatedUser.role = role;
      if (jobDetails !== undefined) updatedUser.jobDetails = { ...targetUser.jobDetails, ...jobDetails };
      if (salaryStructure !== undefined) updatedUser.salaryStructure = { ...targetUser.salaryStructure, ...salaryStructure };
    } else {
      // Employee can only update limited fields
      if (phone !== undefined) updatedUser.phone = phone;
      if (address !== undefined) updatedUser.address = address;
      if (profilePicture !== undefined) updatedUser.profilePicture = profilePicture;
    }

    db.saveUser(updatedUser);

    const { passwordHash, ...savedUserWithoutPassword } = updatedUser;
    return NextResponse.json({
      message: "Profile updated successfully",
      user: savedUserWithoutPassword
    });
  } catch (error) {
    console.error("Update employee error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
