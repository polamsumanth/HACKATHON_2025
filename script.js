let patients = JSON.parse(localStorage.getItem('patients')) || [];
let beds = JSON.parse(localStorage.getItem('beds')) ||
  Array.from({ length: 10 }, (_, i) => ({
    bed_id: i + 1,
    occupied: false,
    patient: null
  }));

document.addEventListener('DOMContentLoaded', () => {
  updateBedSelect();
  displayQueue();
  displayBeds();
});

function showMessage(msg, isError = false) {
  const messageBox = document.getElementById('messageBox');
  messageBox.textContent = msg;
  messageBox.className = isError ? 'error' : 'success';
  messageBox.style.display = 'block';

  setTimeout(() => {
    messageBox.style.display = 'none';
  }, 5000);
}

function addPatient() {
  const id = parseInt(document.getElementById('patientId').value);
  const name = document.getElementById('patientName').value.trim();
  const priority = document.getElementById('patientPriority').value;
  const condition = document.getElementById('patientCondition').value.trim();

  if (!id || !name || !priority || !condition) {
    showMessage("Please fill all patient details", true);
    return;
  }

  if (patients.some(p => p.id === id)) {
    showMessage(`Patient ID ${id} already exists`, true);
    return;
  }

  patients.push({
    id,
    name,
    priority: parseInt(priority),
    condition,
    admissionTime: new Date().toISOString()
  });

  patients.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return new Date(a.admissionTime) - new Date(b.admissionTime);
  });

  saveData();
  showMessage(`Patient ${name} added to queue. Priority: ${priority}`);
  displayQueue();

  document.getElementById('patientId').value = '';
  document.getElementById('patientName').value = '';
  document.getElementById('patientPriority').value = '';
  document.getElementById('patientCondition').value = '';
}

function allocateBed() {
  if (patients.length === 0) {
    showMessage("No patients in the queue.", true);
    return;
  }

  const availableBed = beds.find(b => !b.occupied);
  if (!availableBed) {
    showMessage("No available beds.", true);
    return;
  }

  const patient = patients.shift();
  availableBed.occupied = true;
  availableBed.patient = patient;
  availableBed.allocationTime = new Date().toISOString();

  saveData();
  showMessage(`Patient ${patient.name} allocated to Bed ${availableBed.bed_id}`);
  updateBedSelect();
  displayQueue();
  displayBeds();
}

function dischargeBed() {
  const bedId = parseInt(document.getElementById('dischargeBedId').value);
  const bed = beds.find(b => b.bed_id === bedId);

  if (!bed) {
    showMessage("Please select a valid bed", true);
    return;
  }

  if (!bed.occupied) {
    showMessage(`Bed ${bedId} is already available`, true);
    return;
  }

  const patientName = bed.patient.name;
  bed.occupied = false;
  bed.patient = null;

  saveData();
  showMessage(`Bed ${bedId} discharged. Patient ${patientName} has left.`);
  updateBedSelect();
  displayBeds();
}

function updateBedSelect() {
  const select = document.getElementById('dischargeBedId');
  select.innerHTML = '<option value="">Select Bed to Discharge</option>';

  beds.filter(b => b.occupied).forEach(bed => {
    const option = document.createElement('option');
    option.value = bed.bed_id;
    option.textContent = `Bed ${bed.bed_id} - ${bed.patient.name}`;
    select.appendChild(option);
  });
}

function displayQueue() {
  const queueEl = document.getElementById('queueDisplay');

  if (patients.length === 0) {
    queueEl.textContent = "Patient queue is empty.";
    return;
  }

  queueEl.innerHTML = patients.map(p => `
    <div class="patient-card">
      <strong>ID:</strong> ${p.id}<br>
      <strong>Name:</strong> ${p.name}<br>
      <strong>Priority:</strong> ${p.priority}<br>
      <strong>Condition:</strong> ${p.condition}<br>
      <small>Waiting since: ${new Date(p.admissionTime).toLocaleTimeString()}</small>
    </div>
  `).join('');
}

function displayBeds() {
  const bedEl = document.getElementById('bedDisplay');
  bedEl.innerHTML = '';

  beds.forEach(bed => {
    const bedCard = document.createElement('div');
    bedCard.className = `bed-card ${bed.occupied ? 'occupied' : 'available'}`;

    bedCard.innerHTML = `
      <strong>Bed ${bed.bed_id}</strong><br>
      ${bed.occupied ? `
        <strong>Patient:</strong> ${bed.patient.name}<br>
        <strong>Priority:</strong> ${bed.patient.priority}<br>
        <strong>Condition:</strong> ${bed.patient.condition}<br>
        <small>Allocated: ${new Date(bed.allocationTime).toLocaleTimeString()}</small>
      ` : 'Available'}
    `;

    bedEl.appendChild(bedCard);
  });
}

function saveData() {
  localStorage.setItem('patients', JSON.stringify(patients));
  localStorage.setItem('beds', JSON.stringify(beds));
}
