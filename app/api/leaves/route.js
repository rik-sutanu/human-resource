import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import db from '@/lib/db';
import crypto from 'crypto';

export async function GET(request) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leaves = db.getLeaves();

    if (currentUser.role === 'admin') {
      return NextResponse.json(leaves);
    } else {
      return NextResponse.json(leaves.filter(l => l.employeeId === currentUser.employeeId));
    }
  } catch (error) {
    console.error("Fetch leaves error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, startDate, endDate, remarks } = body;

    if (!type || !startDate || !endDate) {
      return NextResponse.json({ error: "Type, start date, and end date are required" }, { status: 400 });
    }

    const newLeave = {
      id: `leave-${crypto.randomUUID().slice(0, 8)}`,
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name,
      type,
      startDate,
      endDate,
      remarks: remarks || "",
      status: "Pending",
      adminComment: null
    };

    db.saveLeave(newLeave);

    return NextResponse.json({ message: "Leave requested successfully", leave: newLeave }, { status: 201 });
  } catch (error) {
    console.error("Apply leave error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, adminComment } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Leave ID and status are required" }, { status: 400 });
    }

    if (status !== 'Approved' && status !== 'Rejected') {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const leaves = db.getLeaves();
    const targetLeave = leaves.find(l => l.id === id);

    if (!targetLeave) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    const updatedLeave = {
      ...targetLeave,
      status,
      adminComment: adminComment || null
    };

    db.saveLeave(updatedLeave);

    // If approved, automatically backfill attendance records for those dates
    if (status === 'Approved') {
      const start = new Date(targetLeave.startDate);
      const end = new Date(targetLeave.endDate);
      const attendanceRecords = db.getAttendance();

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Find existing attendance record for that date
        const existing = attendanceRecords.find(
          r => r.employeeId === targetLeave.employeeId && r.date === dateStr
        );

        if (existing) {
          db.saveAttendance({
            ...existing,
            status: "Leave"
          });
        } else {
          db.saveAttendance({
            id: `att-${crypto.randomUUID().slice(0, 8)}`,
            employeeId: targetLeave.employeeId,
            date: dateStr,
            checkIn: null,
            checkOut: null,
            status: "Leave"
          });
        }
      }
    }

    return NextResponse.json({ message: `Leave request ${status.toLowerCase()} successfully`, leave: updatedLeave });
  } catch (error) {
    console.error("Update leave request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
