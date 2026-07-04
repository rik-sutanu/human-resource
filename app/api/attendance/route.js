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

    const { searchParams } = new URL(request.url);
    const employeeIdFilter = searchParams.get('employeeId');

    const attendanceRecords = db.getAttendance();

    if (currentUser.role === 'admin') {
      if (employeeIdFilter) {
        return NextResponse.json(attendanceRecords.filter(r => r.employeeId === employeeIdFilter));
      }
      return NextResponse.json(attendanceRecords);
    } else {
      // Employees can only see their own attendance
      return NextResponse.json(attendanceRecords.filter(r => r.employeeId === currentUser.employeeId));
    }
  } catch (error) {
    console.error("Fetch attendance error:", error);
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
    const { action } = body; // 'check-in' or 'check-out'

    if (action !== 'check-in' && action !== 'check-out') {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const todayDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
    const attendanceRecords = db.getAttendance();

    // Find today's record for this employee
    const todayRecord = attendanceRecords.find(
      r => r.employeeId === currentUser.employeeId && r.date === todayDate
    );

    if (action === 'check-in') {
      if (todayRecord) {
        return NextResponse.json({ error: "Already checked in today" }, { status: 400 });
      }

      const newRecord = {
        id: `att-${crypto.randomUUID().slice(0, 8)}`,
        employeeId: currentUser.employeeId,
        date: todayDate,
        checkIn: new Date().toISOString(),
        checkOut: null,
        status: "Present"
      };

      db.saveAttendance(newRecord);
      return NextResponse.json({ message: "Check-in successful", record: newRecord });
    }

    if (action === 'check-out') {
      if (!todayRecord) {
        return NextResponse.json({ error: "You must check in first" }, { status: 400 });
      }
      if (todayRecord.checkOut) {
        return NextResponse.json({ error: "Already checked out today" }, { status: 400 });
      }

      const updatedRecord = {
        ...todayRecord,
        checkOut: new Date().toISOString()
      };

      db.saveAttendance(updatedRecord);
      return NextResponse.json({ message: "Check-out successful", record: updatedRecord });
    }
  } catch (error) {
    console.error("Attendance log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
