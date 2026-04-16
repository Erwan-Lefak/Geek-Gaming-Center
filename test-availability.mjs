async function testAvailability() {
  const date = new Date('2026-04-19'); // Un dimanche
  const equipmentId = 'cmo0ui3s5000811ue7ax0jl9c';
  
  const response = await fetch(`http://localhost:3000/api/reservations/availability?date=2026-04-19&equipmentId=${equipmentId}`);
  const data = await response.json();
  
  console.log('Availability for 2026-04-19 (Sunday):');
  console.log('Equipment:', equipmentId);
  console.log('Slots:', data.slots?.slice(0, 10));
}

testAvailability().catch(console.error);
