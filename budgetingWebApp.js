// Get elements from the page.
const hourlyRateInput = document.getElementById('hourlyRate');
const projectedHoursInput = document.getElementById('projectedHours');
const payScheduleInput = document.getElementById('paySchedule');
const taxRateInput = document.getElementById('taxRate');
const saveButton = document.getElementById('saveButton');
const billNameInput = document.getElementById('billName');
const billAmountInput = document.getElementById('billAmount');
const billScheduleInput = document.getElementById('billSchedule');
const addBillButton = document.getElementById('addBillButton');
const billsList = document.getElementById('billsList');
const grossPaycheckInput = document.getElementById('grossPaycheck');
const netPaycheckInput = document.getElementById('netPaycheck');
const calculateTaxButton = document.getElementById('calculateTaxButton');
const calculatedTaxRate = document.getElementById('calculatedTaxRate');
const detailsButton = document.getElementById('detailsButton');
const details = document.getElementById('details');
const detailsText = document.getElementById('detailsText');
const output = document.getElementById('output');


// Initialize some variables to store our data.
let hourlyRate = 0;
let projectedHours = 0;
let paySchedule = 'weekly';
let taxRate = 0;
let bills = [];

// Load the settings from local storage when the page loads.
loadSettings();

// Attach event listeners to buttons.
saveButton.addEventListener('click', saveSettings);
addBillButton.addEventListener('click', addBill);
calculateTaxButton.addEventListener('click', calculateTax);
detailsButton.addEventListener('click', toggleDetails);

// Function to save the current settings to local storage.
function saveSettings() {
    // Update the settings based on the input fields.
    hourlyRate = parseFloat(hourlyRateInput.value);
    projectedHours = parseInt(projectedHoursInput.value);
    paySchedule = payScheduleInput.value;
    taxRate = parseFloat(taxRateInput.value);
    localStorage.setItem('hourlyRate', hourlyRate);
    localStorage.setItem('projectedHours', projectedHours);
    localStorage.setItem('paySchedule', paySchedule);
    localStorage.setItem('taxRate', taxRate);
    localStorage.setItem('bills', JSON.stringify(bills));
    updateOutput();
}

// Function to load the settings from local storage.
function loadSettings() {
    // Get the settings from local storage.
    const savedHourlyRate = localStorage.getItem('hourlyRate');
    const savedProjectedHours = localStorage.getItem('projectedHours');
    const savedPaySchedule = localStorage.getItem('paySchedule');
    const savedTaxRate = localStorage.getItem('taxRate');
    const savedBills = localStorage.getItem('bills');
    if (savedHourlyRate !== null) {
        hourlyRate = parseFloat(savedHourlyRate);
        hourlyRateInput.value = hourlyRate;
    }
    if (savedProjectedHours !== null) {
        projectedHours = parseInt(savedProjectedHours);
        projectedHoursInput.value = projectedHours;
    }
    if (savedPaySchedule !== null) {
        paySchedule = savedPaySchedule;
        payScheduleInput.value = paySchedule;
    }
    if (savedTaxRate !== null) {
        taxRate = parseFloat(savedTaxRate);
        taxRateInput.value = taxRate;
    }
    if (savedBills !== null) {
        bills = JSON.parse(savedBills);
        updateBillsList();
    }
    updateOutput();
}

// Function to add a new bill.
function addBill() {
    // Create the new bill.
    const bill = {
        name: billNameInput.value,
        amount: parseFloat(billAmountInput.value),
        schedule: billScheduleInput.value
    };
    // Add the new bill to the list.
    bills.push(bill);
    updateBillsList();
    saveSettings();
}

// Function to update the list of bills.
function updateBillsList() {
    // Clear the current list.
    while (billsList.firstChild) {
        billsList.firstChild.remove();
    }
    // Add each bill to the list.
    bills.forEach((bill, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.textContent = bill.name;

        const billInfo = document.createElement('span');
        billInfo.innerHTML = `$${bill.amount.toFixed(2)} <span class="badge badge-primary badge-pill">${bill.schedule}</span>`;
        listItem.appendChild(billInfo);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn btn-danger';
        deleteButton.addEventListener('click', () => {
            deleteBill(index);
        });

        listItem.appendChild(deleteButton);
        billsList.appendChild(listItem);
    });
}

// Function to delete a bill.
function deleteBill(index) {
    // Remove the bill from the list.
    bills.splice(index, 1);
    updateBillsList();
    saveSettings();
}

// Function to calculate the tax rate.
function calculateTax() {
    const grossPaycheck = parseFloat(grossPaycheckInput.value);
    const netPaycheck = parseFloat(netPaycheckInput.value);
    const taxRate = ((grossPaycheck - netPaycheck) / grossPaycheck) * 100;
    calculatedTaxRate.textContent = `Tax Rate: ${taxRate.toFixed(2)}%`;
}

// Function to update the output text.
function updateOutput() {
    const paycheck = (hourlyRate * projectedHours * (paySchedule === 'weekly' ? 1 : 2)) * (1 - taxRate / 100);
    const totalBills = calculateTotalBills();
    const leftOver = paycheck - totalBills;
	// Update the navbar display.
    navbarPaycheck.textContent = leftOver.toFixed(2);
    const detailsTextContent = `There are roughly 4 weeks in a month. You have $${totalBills.toFixed(2)} in bills. If you set aside $${(totalBills / 4).toFixed(2)} each paycheck, you'll have around $${(leftOver / 4).toFixed(2)} left for spending.`;
    const outputTextContent = `Your expected paycheck will be around $${paycheck.toFixed(2)}. You have ${bills.length} bills this pay period, totalling $${totalBills.toFixed(2)}. After you pay those bills, you should have around $${leftOver.toFixed(2)} left.`;
    detailsText.textContent = detailsTextContent;
    output.textContent = outputTextContent;
}

// Function to calculate the total bills for the current pay period.
function calculateTotalBills() {
    let totalBills = 0;
    bills.forEach(bill => {
        let multiplier;
        switch (bill.schedule) {
            case 'weekly':
                multiplier = paySchedule === 'weekly' ? 1 : 2;
                break;
            case 'biweekly':
                multiplier = paySchedule === 'weekly' ? 0.5 : 1;
                break;
            case 'monthly':
                multiplier = paySchedule === 'weekly' ? 0.25 : 0.5;
                break;
        }
        totalBills += bill.amount * multiplier;
    });
    return totalBills;
}

// Function to show/hide the details text.
function toggleDetails() {
    if (details.style.display === 'none') {
        details.style.display = 'block';
    } else {
        details.style.display = 'none';
    }
}