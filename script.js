document.addEventListener("DOMContentLoaded", function() {
  $('#sessionDate').persianDatepicker({
    format: 'YYYY/MM/DD',
    initialValue: false,
  });
  loadSessionDataFromLocalStorage(); // بارگذاری داده‌ها از Local Storage هنگام لود شدن صفحه
});

// آبجکت برای ذخیره داده‌های هر فرد و جلسات مربوط به آن
const sessionData = {};

// تابع ذخیره برنامه
function saveProgram() {
  const selectedName = document.getElementById('nameDropdown').value;
  if (!selectedName) {
    alert('لطفاً یک نام انتخاب کنید.');
    return;
  }

  const studentName = document.getElementById('studentName').value;
  const sessionDate = document.getElementById('sessionDate').value;
  const exercises = [];
  const rows = document.querySelectorAll("#exerciseTableBody tr");

  rows.forEach((row) => {
    const exercise = row.children[0].querySelector("input").value;
    const count = row.children[1].querySelector("input").value;
    const set = row.children[2].querySelector("input").value;
    const weight = row.children[3].querySelector("input").value;
    const rest = row.children[4].querySelector("input").value;

    if (exercise || count || set || weight || rest) {
      exercises.push({ exercise, count, set, weight, rest });
    }
  });

  if (!sessionData[selectedName]) {
    sessionData[selectedName] = [];
  }

  // حداکثر 100 جلسه برای هر فرد
  if (sessionData[selectedName].length >= 100) {
    alert('حداکثر 100 جلسه برای این نام ذخیره شده است.');
    return;
  }

  sessionData[selectedName].push({ studentName, sessionDate, exercises });
  localStorage.setItem('sessionData', JSON.stringify(sessionData));
  alert(`برنامه برای "${selectedName}" ذخیره شد!`);
  loadSessionList();
}

// تابع بارگذاری لیست جلسات
function loadSessionList() {
  const selectedName = document.getElementById('nameDropdown').value;
  const sessionSelect = document.getElementById('sessionSelect');
  sessionSelect.innerHTML = ''; // خالی کردن کشو جلسات

  if (sessionData[selectedName]) {
    sessionData[selectedName].forEach((session, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `جلسه ${index + 1}: ${session.sessionDate}`;
      sessionSelect.appendChild(option);
    });
  }
}

// تابع بارگذاری جلسه خاص
function loadSpecificSession() {
  const selectedName = document.getElementById('nameDropdown').value;
  const sessionIndex = document.getElementById('sessionSelect').value;

  if (sessionIndex !== '') {
    const data = sessionData[selectedName][sessionIndex];
    document.getElementById('studentName').value = data.studentName || '';
    document.getElementById('sessionDate').value = data.sessionDate || '';

    const tableBody = document.getElementById("exerciseTableBody");
    tableBody.innerHTML = '';

    data.exercises.forEach((exercise) => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td><input type="text" value="${exercise.exercise}"></td>
        <td><input type="number" value="${exercise.count}" class="small-input"></td>
        <td><input type="number" value="${exercise.set}" class="small-input"></td>
        <td><input type="number" value="${exercise.weight}" class="weight-input"></td>
        <td><input type="text" value="${exercise.rest}" class="rest-input" oninput="autoResize(this)"></td>
        <td><button type="button" onclick="removeRow(this)">❌</button></td>
      `;
      tableBody.appendChild(newRow);
    });

    alert(`برنامه "${selectedName}" بارگذاری شد.`);
  }
}

function editSession() {
  const selectedName = document.getElementById('nameDropdown').value;
  const sessionIndex = document.getElementById('sessionSelect').value;

  if (selectedName && sessionIndex !== '') {
    saveProgram(); // ذخیره تغییرات جدید در جلسه
    alert(`جلسه ${parseInt(sessionIndex) + 1} ویرایش شد.`);
  } else {
    alert("لطفاً یک جلسه انتخاب کنید.");
  }
}

function removeSession() {
  const selectedName = document.getElementById('nameDropdown').value;
  const sessionIndex = document.getElementById('sessionSelect').value;

  if (selectedName && sessionIndex !== '') {
    sessionData[selectedName].splice(sessionIndex, 1); // حذف جلسه
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
    loadSessionList(); // بروزرسانی فهرست جلسات
    alert(`جلسه ${parseInt(sessionIndex) + 1} حذف شد.`);
  } else {
    alert("لطفاً یک جلسه انتخاب کنید.");
  }
}

// بارگذاری داده‌ها از Local Storage هنگام لود شدن صفحه
window.onload = function() {
  const storedData = localStorage.getItem('sessionData');
  if (storedData) {
    Object.assign(sessionData, JSON.parse(storedData));
  }
  loadNames(); // بارگذاری نام‌ها
  loadSessionList(); // بارگذاری لیست جلسات

  // اضافه کردن event listener برای کشو نام
  document.getElementById('nameDropdown').addEventListener('change', function() {
    const selectedName = this.value;
    loadNameData(selectedName); // بارگذاری اطلاعات مربوط به نام انتخاب شده
    loadSessionData(); // بارگذاری جلسات مربوط به نام انتخاب شده
  });

  // بارگذاری اطلاعات برای اولین نام (اگر وجود داشته باشد)
  const firstName = Object.keys(sessionData)[0];
  if (firstName) {
    document.getElementById('nameDropdown').value = firstName;
    loadNameData(firstName);
    loadSessionData();
  }
};

// تابع بارگذاری اطلاعات برای نام خاص
function loadNameData(selectedName) {
  const data = sessionData[selectedName];

  if (data) {
    document.getElementById('studentName').value = data.studentName || '';
    document.getElementById('sessionDate').value = data.sessionDate || '';

    const tableBody = document.getElementById("exerciseTableBody");
    tableBody.innerHTML = ''; // خالی کردن جدول

    data.exercises.forEach((exercise) => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td><input type="text" value="${exercise.exercise}"></td>
        <td><input type="number" value="${exercise.count}" class="small-input"></td>
        <td><input type="number" value="${exercise.set}" class="small-input"></td>
        <td><input type="number" value="${exercise.weight}" class="weight-input"></td>
        <td><input type="text" value="${exercise.rest}" class="rest-input" oninput="autoResize(this)"></td>
        <td><button type="button" onclick="removeRow(this)">❌</button></td>
      `;
      tableBody.appendChild(newRow);
    });

    alert(`اطلاعات ${selectedName} بارگذاری شد.`);
  } else {
    alert("هیچ اطلاعاتی برای این نام ذخیره نشده است.");
  }
}

// تابع بارگذاری جلسه‌ها برای نام انتخاب شده
function loadSessionData() {
  const selectedName = document.getElementById('nameDropdown').value;
  const sessionSelect = document.getElementById('sessionSelect');
  sessionSelect.innerHTML = ''; // خالی کردن کشو انتخاب جلسه

  if (sessionData[selectedName]) {
    sessionData[selectedName].forEach((session, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `جلسه ${index + 1}: ${session.sessionDate}`;
      sessionSelect.appendChild(option);
    });
  } else {
    alert("هیچ جلسه‌ای برای این نام موجود نیست.");
  }
}

function loadNames() {
  const nameDropdown = document.getElementById('nameDropdown');
  nameDropdown.innerHTML = ''; // خالی کردن کشو قبل از بارگذاری

  // بارگذاری نام‌ها از sessionData
  for (const name in sessionData) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    nameDropdown.appendChild(option);
  }
}

function loadProgram() {
  const selectedName = document.getElementById('nameDropdown').value;
  if (!selectedName) {
    alert('لطفاً یک نام انتخاب کنید.');
    return;
  }

  const data = sessionData[selectedName];

  if (data) {
    document.getElementById('studentName').value = data.studentName || '';
    document.getElementById('sessionDate').value = data.sessionDate || '';

    const tableBody = document.getElementById("exerciseTableBody");
    tableBody.innerHTML = ''; // خالی کردن جدول

    data.exercises.forEach((exercise) => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td><input type="text" value="${exercise.exercise}"></td>
        <td><input type="number" value="${exercise.count}" class="small-input"></td>
        <td><input type="number" value="${exercise.set}" class="small-input"></td>
        <td><input type="number" value="${exercise.weight}" class="weight-input"></td>
        <td><input type="text" value="${exercise.rest}" class="rest-input" oninput="autoResize(this)"></td>
        <td><button type="button" onclick="removeRow(this)">❌</button></td>
      `;
      tableBody.appendChild(newRow);
    });

    alert(`برنامه "${selectedName}" بارگذاری شد.`);
  } else {
    alert("هیچ اطلاعاتی برای این نام ذخیره نشده است.");
  }
}

function addRow() {
  const tableBody = document.getElementById("exerciseTableBody");
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td><input type="text" placeholder="حرکت"></td>
    <td><input type="number" placeholder="تعداد" class="small-input"></td>
    <td><input type="number" placeholder="ست" class="small-input"></td>
    <td><input type="number" placeholder="وزنه" class="weight-input"></td>
    <td><input type="text" placeholder="استراحت" class="rest-input" oninput="autoResize(this)"></td>
    <td><button type="button" onclick="removeRow(this)">❌</button></td>
  `;
  tableBody.appendChild(newRow);
}

function removeRow(button) {
  const row = button.parentNode.parentNode; // به ردیف والد دسترسی پیدا کن
  row.parentNode.removeChild(row); // ردیف را حذف کن
}

function saveExerciseData() {
  const sessionSelect = document.getElementById('sessionSelect').value;
  const studentName = document.getElementById('studentName').value;
  const sessionDate = document.getElementById('sessionDate').value;
  const exercises = [];
  const rows = document.querySelectorAll("#exerciseTableBody tr");

  rows.forEach((row) => {
    const exercise = row.children[0].querySelector("input").value;
    const count = row.children[1].querySelector("input").value;
    const set = row.children[2].querySelector("input").value;
    const weight = row.children[3].querySelector("input").value;
    const rest = row.children[4].querySelector("input").value;

    if (exercise || count || set || weight || rest) {
      exercises.push({
        exercise,
        count,
        set,
        weight,
        rest
      });
    }
  });

  sessionData[sessionSelect] = {
    studentName,
    sessionDate,
    exercises,
    namesList: [...namesList] // ذخیره نام‌ها
  };

  // ذخیره داده‌ها در Local Storage
  localStorage.setItem('sessionData', JSON.stringify(sessionData));
  alert("برنامه تمرینی برای " + sessionSelect + " ذخیره شد!");
}

function loadNameData(selectedName) {
  const data = sessionData[selectedName];

  if (data) {
    document.getElementById('studentName').value = data.studentName || '';
    document.getElementById('sessionDate').value = data.sessionDate || '';

    const tableBody = document.getElementById("exerciseTableBody");
    tableBody.innerHTML = ''; // خالی کردن جدول

    data.exercises.forEach((exercise) => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td><input type="text" value="${exercise.exercise}"></td>
        <td><input type="number" value="${exercise.count}" class="small-input"></td>
        <td><input type="number" value="${exercise.set}" class="small-input"></td>
        <td><input type="number" value="${exercise.weight}" class="weight-input"></td>
        <td><input type="text" value="${exercise.rest}" class="rest-input" oninput="autoResize(this)"></td>
        <td><button type="button" onclick="removeRow(this)">❌</button></td>
      `;
      tableBody.appendChild(newRow);
    });

    alert(`اطلاعات ${selectedName} بارگذاری شد.`);
  } else {
    alert("هیچ اطلاعاتی برای این نام ذخیره نشده است.");
  }
}

function saveAllData() {
  const allData = {
    sessionData: {},
    namesList: namesList,
  };

  for (const name of namesList) {
    if (sessionData[name]) {
      allData.sessionData[name] = sessionData[name];
    }
  }

  localStorage.setItem('programData', JSON.stringify(allData));
  alert("تمام داده‌ها با موفقیت ذخیره شد!");
}

function loadAllData() {
  const savedData = localStorage.getItem('programData');

  if (savedData) {
    const allData = JSON.parse(savedData);
    namesList = allData.namesList || [];
    Object.assign(sessionData, allData.sessionData);

    loadNames(); // بارگذاری نام‌ها
    loadSessionData(); // بارگذاری جلسات برای اولین نام
    alert("داده‌ها با موفقیت بارگذاری شدند!");
  } else {
    alert("هیچ داده‌ای برای بارگذاری وجود ندارد.");
  }
}

// تابع بارگذاری داده‌ها برای نام خاص
function loadNameData(name, data) {
  document.getElementById('studentName').value = data.studentName || '';
  document.getElementById('sessionDate').value = data.sessionDate || '';

  const tableBody = document.getElementById("exerciseTableBody");
  tableBody.innerHTML = ''; // خالی کردن جدول

  data.exercises.forEach((exercise) => {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td><input type="text" value="${exercise.exercise}"></td>
      <td><input type="number" value="${exercise.count}" class="small-input"></td>
      <td><input type="number" value="${exercise.set}" class="small-input"></td>
      <td><input type="number" value="${exercise.weight}" class="weight-input"></td>
      <td><input type="text" value="${exercise.rest}" class="rest-input" oninput="autoResize(this)"></td>
      <td><button type="button" onclick="removeRow(this)">❌</button></td>
    `;
    tableBody.appendChild(newRow);
  });
}

function downloadPDF() {
  const element = document.getElementById('student-program');
  
  const options = {
    margin: 0, // حذف حاشیه
    filename: 'exercise-program.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } // تنظیم فرمت به A4
  };

  html2pdf()
    .from(element)
    .set(options)
    .save();
}

// تابع افزودن حرکت جدید به کشو
function addNewExercise() {
  const newExerciseInput = document.getElementById('newExercise');
  const newExerciseValue = newExerciseInput.value.trim();
  
  if (newExerciseValue) {
    const dropdown = document.getElementById('exerciseDropdown');
    
    // ایجاد یک گزینه جدید برای کشو
    const newOption = document.createElement('option');
    newOption.value = newExerciseValue;
    newOption.textContent = newExerciseValue;

    // اضافه کردن گزینه جدید به کشو
    dropdown.appendChild(newOption);
    
    // اضافه کردن حرکت جدید به لیست حرکات
    exercisesList.push(newExerciseValue);
    
    // ذخیره حرکات جدید در Local Storage
    saveAllData();
    
    // خالی کردن ورودی بعد از افزودن
    newExerciseInput.value = '';
    alert('حرکت جدید با موفقیت اضافه شد!');
  } else {
    alert('لطفا نام حرکت را وارد کنید.');
  }
}

function addExercise() {
  const dropdown = document.getElementById('exerciseDropdown');
  const selectedValue = dropdown.value;

  if (selectedValue) {
    const tableBody = document.getElementById("exerciseTableBody");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td><input type="text" value="${selectedValue}" readonly></td>
      <td><input type="number" placeholder="تعداد" class="small-input"></td>
      <td><input type="number" placeholder="ست" class="small-input"></td>
      <td><input type="number" placeholder="وزنه" class="weight-input"></td>
      <td><input type="text" placeholder="استراحت" class="rest-input" oninput="autoResize(this)"></td>
      <td><button type="button" onclick="removeRow(this)">❌</button></td>
    `;

    tableBody.appendChild(newRow);
    dropdown.value = ""; // خالی کردن کشو بعد از اضافه کردن
  } else {
    alert('لطفا یک حرکت انتخاب کنید.');
  }
}

// تابع حذف حرکت از کشو
function removeExercise() {
  const dropdown = document.getElementById('exerciseDropdown');
  const selectedOption = dropdown.value;
  
  if (selectedOption) {
    dropdown.remove(dropdown.selectedIndex);
    exercisesList.splice(exercisesList.indexOf(selectedOption), 1); // حذف حرکت از لیست حرکات
    saveAllData(); // به‌روزرسانی Local Storage
    alert(`حرکت "${selectedOption}" با موفقیت حذف شد.`);
  } else {
    alert('لطفا یک حرکت برای حذف انتخاب کنید.');
  }
}
const namesList = []; // برای ذخیره لیست نام‌ها

function addName(event) {
    event.preventDefault(); // جلوگیری از ارسال فرم
    const nameInput = document.getElementById('addName');
    const nameValue = nameInput.value.trim();

    if (!nameValue) {
        alert('لطفاً نامی وارد کنید.'); // بررسی خالی بودن ورودی
        return;
    }

    if (namesList.includes(nameValue)) {
        alert('این نام قبلاً افزوده شده است.'); // بررسی وجود نام
        return;
    }

    namesList.push(nameValue);
    const dropdown = document.getElementById('nameDropdown');

    const newOption = document.createElement('option');
    newOption.value = nameValue;
    newOption.textContent = nameValue;

    dropdown.appendChild(newOption); // اضافه کردن نام به کشو
    alert(`نام "${nameValue}" با موفقیت افزوده شد!`);
    nameInput.value = ''; // خالی کردن ورودی بعد از افزودن
}
document.getElementById('nameDropdown').addEventListener('change', loadSessionData);
function loadSessionData() {
  const selectedName = document.getElementById('nameDropdown').value;
  const sessionSelect = document.getElementById('sessionSelect');
  sessionSelect.innerHTML = ''; // خالی کردن کشو انتخاب جلسه

  if (sessionData[selectedName]) {
    sessionData[selectedName].forEach((session, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `جلسه ${index + 1}: ${session.sessionDate}`;
      sessionSelect.appendChild(option);
    });
  } else {
    alert("هیچ جلسه‌ای برای این نام موجود نیست.");
  }
}