const DAYS_TO_EAT = 30;
let leaveDays = new Set();
let startDateGlobal = null;
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isToday(dateObj) {
  const today = new Date();
  return dateObj.getFullYear() === today.getFullYear() &&
         dateObj.getMonth() === today.getMonth() &&
         dateObj.getDate() === today.getDate();
}

function getTotalCycleDays() {
  return DAYS_TO_EAT + leaveDays.size;
}

function generateCalendar() {
  leaveDays.clear();
  document.getElementById('calendar').innerHTML = '';
  document.getElementById('result').style.display = 'none';
  document.getElementById('result').innerHTML = '';
  document.getElementById('dateRange').innerHTML = '';
  document.getElementById('printBtn').style.display = "none";
  document.getElementById('bulkLeaveBox').style.display = "none";

  const startDateInput = document.getElementById('startDate').value;
  if (!startDateInput) {
    alert("Please select a start date!");
    return;
  }
  startDateGlobal = new Date(startDateInput);
  renderCalendar();
  document.getElementById('bulkLeaveBox').style.display = "flex";

  let cycleStart = formatYYYYMMDD(startDateGlobal);
  document.getElementById('bulkLeaveStart').value = '';
  document.getElementById('bulkLeaveEnd').value = '';
  document.getElementById('bulkLeaveStart').min = cycleStart;
  document.getElementById('bulkLeaveEnd').min = cycleStart;
  document.getElementById('bulkLeaveStart').max = '';
  document.getElementById('bulkLeaveEnd').max = '';
}

function renderCalendar() {
  const calendarDiv = document.getElementById('calendar');
  calendarDiv.innerHTML = '';
  let totalDays = getTotalCycleDays();
  let currentDate = new Date(startDateGlobal);
  let currentMonth = -1;

  for (let i = 0; i < totalDays; i++) {
    if (currentDate.getMonth() !== currentMonth) {
      currentMonth = currentDate.getMonth();
      let monthHeader = document.createElement('div');
      monthHeader.className = 'month-header';
      monthHeader.textContent = `${monthNames[currentMonth]} ${currentDate.getFullYear()}`;
      calendarDiv.appendChild(monthHeader);

      weekdayNames.forEach(dayName => {
        let weekdayHeader = document.createElement('div');
        weekdayHeader.className = 'weekday-header';
        weekdayHeader.textContent = dayName;
        calendarDiv.appendChild(weekdayHeader);
      });
    }
    let dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    dayDiv.textContent = `${currentDate.getDate()} ${weekdayNames[currentDate.getDay()]}`;
    dayDiv.title = currentDate.toDateString();
    dayDiv.setAttribute('tabindex', 0);
    dayDiv.setAttribute('aria-label', `Day ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()} (${weekdayNames[currentDate.getDay()]})`);
    if (leaveDays.has(i)) dayDiv.classList.add('leave');
    if (isToday(currentDate)) dayDiv.classList.add('today');

    dayDiv.onclick = function () {
      if (leaveDays.has(i)) leaveDays.delete(i);
      else leaveDays.add(i);
      renderCalendar();
    };
    dayDiv.onkeydown = function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); dayDiv.onclick(); }
    };
    calendarDiv.appendChild(dayDiv);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  let endDate = new Date(startDateGlobal);
  endDate.setDate(startDateGlobal.getDate() + totalDays - 1);
  document.getElementById('dateRange').innerHTML = `
      <span style="font-size:1.06em;color:#353a62"><b>Cycle:</b> ${formatHumanDate(startDateGlobal)} <b>→</b> ${formatHumanDate(endDate)}</span>
      <br>
      <span style="color:#a0a5b2;font-size:0.97em;">(Duration: ${totalDays} days)</span>
  `;
}

function calculate() {
  if (!startDateGlobal) {
    alert("Please generate the calendar first!");
    return;
  }
  let startDate = new Date(startDateGlobal);
  let totalDays = getTotalCycleDays();
  let leaveCount = leaveDays.size;
  let endDate = new Date(startDateGlobal);
  endDate.setDate(startDateGlobal.getDate() + totalDays - 1);
  let icon = '<span class="icon">🌟</span>';
  document.getElementById('result').innerHTML = `
    ${icon}
    <b>Start Date:</b> ${formatHumanDate(startDate)}<br>
    <b>End Date:</b> ${formatHumanDate(endDate)}<br>
    <b>Total Leaves in Cycle:</b> <span style="color:#b35400">${leaveCount}</span>
  `;
  document.getElementById('result').style.display = '';
  document.getElementById('printBtn').style.display = "inline-block";
}

function printResult() { window.print(); }

function addBulkLeave() {
  if (!startDateGlobal) {
    alert("Please generate the calendar first!");
    return;
  }
  let bulkStart = document.getElementById('bulkLeaveStart').value;
  let bulkEnd = document.getElementById('bulkLeaveEnd').value;
  if (!bulkStart || !bulkEnd) {
    alert("Please select both start and end date for bulk leave.");
    return;
  }
  let sDate = new Date(bulkStart);
  let eDate = new Date(bulkEnd);
  if (eDate < sDate) {
    alert("Bulk leave 'To' date cannot be before 'From' date.");
    return;
  }
  let sIdx = Math.round((sDate - startDateGlobal) / (1000*60*60*24));
  let eIdx = Math.round((eDate - startDateGlobal) / (1000*60*60*24));
  for (let i = sIdx; i <= eIdx; i++) leaveDays.add(i);
  renderCalendar();
}

function formatYYYYMMDD(date) {
  let mm = (date.getMonth()+1).toString().padStart(2, '0');
  let dd = date.getDate().toString().padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}
function formatHumanDate(date) {
  return `${monthNames[date.getMonth()].slice(0,3)} ${date.getDate()}, ${date.getFullYear()}`;
}