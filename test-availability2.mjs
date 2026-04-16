async function testAvailability() {
  const equipmentId = 'cmo0ui3s5000811ue7ax0jl9c';
  
  const response = await fetch(`http://localhost:3000/api/reservations/availability?date=2026-04-18&equipmentId=${equipmentId}`);
  const data = await response.json();
  
  console.log('Availability for 2026-04-18 (equipment cmo0ui3s5000811ue7ax0jl9c):');
  if (data.slots) {
    const reserved = data.slots.filter(s => !s.available);
    console.log('Reserved slots:', reserved);
    console.log('First 15 slots:', data.slots.slice(0, 15));
  }
}

testAvailability().catch(console.error);
