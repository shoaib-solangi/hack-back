import Appointment from "../model/Appointment.js";

const scheduleAppointment = async () => {
  // This is a simplified version. In a real-world scenario, you'd implement more complex logic
  // to find the next available slot and handle office hours, holidays, etc.
  const date = new Date()
  date.setDate(date.getDate() + 7) // Schedule for 7 days from now

  const appointment = new Appointment({
    date,
    time: "10:00 AM",
    officeLocation: "Saylani Welfare Main Office, Karachi",
  })

  await appointment.save()
  return appointment
}

export default scheduleAppointment;



