import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { emailService } from '@/lib/email';

export async function GET() {
  try {
    await dbConnect();
    const appointments = await Appointment.find().sort({ date: 1, time: 1 });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    await dbConnect();

    const appointment = await Appointment.create(data);

    // Send email confirmation (don't fail if email fails)
    try {
      await emailService.sendAppointmentConfirmation({
        customerName: appointment.ownerName,
        email: appointment.ownerEmail,
        petName: appointment.petName,
        service: appointment.service,
        date: appointment.date.toString(),
        time: appointment.time,
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
