/* =========================================================
   FIREBASE IMPORTS
========================================================= */

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIGURATION
========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyBtmvW1L4Cx-GntwTuxKVUvxQnT1NHpoNA",
  authDomain: "form-38c24.firebaseapp.com",
  projectId: "form-38c24",
  storageBucket: "form-38c24.firebasestorage.app",
  messagingSenderId: "829827276205",
  appId: "1:829827276205:web:3511bfa2616d7f768a1524",
  measurementId: "G-575PCYC89Z"
};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


/* =========================================================
   COLLECTION NAMES
========================================================= */

const CUSTOMERS_COLLECTION = "customers";
const BILLS_COLLECTION = "bills";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let customers = [];
let bills = [];
let editingCustomerId = null;


/* =========================================================
   HTML ELEMENTS
========================================================= */

const today =
  document.getElementById("today");

const pageTitle =
  document.getElementById("pageTitle");

const customerSearch =
  document.getElementById("customerSearch");

const billSearch =
  document.getElementById("billSearch");

const customerTable =
  document.getElementById("customerTable");

const billTable =
  document.getElementById("billTable");

const customerForm =
  document.getElementById("customerForm");

const billForm =
  document.getElementById("billForm");

const customerModal =
  document.getElementById("customerModal");

const modalTitle =
  document.getElementById("modalTitle");

const editCustomerId =
  document.getElementById("editCustomerId");

const customerName =
  document.getElementById("customerName");

const customerPhone =
  document.getElementById("customerPhone");

const customerAddress =
  document.getElementById("customerAddress");

const meterNumber =
  document.getElementById("meterNumber");

const billCustomer =
  document.getElementById("billCustomer");

const billMonth =
  document.getElementById("billMonth");

const previousReading =
  document.getElementById("previousReading");

const currentReading =
  document.getElementById("currentReading");

const unitsPreview =
  document.getElementById("unitsPreview");

const energyPreview =
  document.getElementById("energyPreview");

const totalPreview =
  document.getElementById("totalPreview");

const totalCustomers =
  document.getElementById("totalCustomers");

const totalBills =
  document.getElementById("totalBills");

const paidBills =
  document.getElementById("paidBills");

const pendingBills =
  document.getElementById("pendingBills");

const recentBills =
  document.getElementById("recentBills");

const toastElement =
  document.getElementById("toast");


/* =========================================================
   TODAY'S DATE
========================================================= */

if (today) {

  today.textContent =
    new Date().toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

document
  .querySelectorAll(".nav-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        showPage(
          button.dataset.page
        );

      }
    );

  });


function showPage(id) {

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove("active");

    });


  const selectedPage =
    document.getElementById(id);

  if (selectedPage) {

    selectedPage.classList.add("active");

  }


  document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.page === id
      );

    });


  const titles = {

    dashboard: "Dashboard",

    customers: "Customers",

    billing: "Generate Bill",

    bills: "Bill History"

  };


  if (pageTitle) {

    pageTitle.textContent =
      titles[id] || "Dashboard";

  }


  if (id === "customers") {

    renderCustomers();

  }


  if (id === "billing") {

    populateCustomerSelect();

  }


  if (id === "bills") {

    renderBills();

  }


  updateDashboard();

}


/* =========================================================
   LOAD CUSTOMERS FROM FIREBASE
========================================================= */

async function loadCustomers() {

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          CUSTOMERS_COLLECTION
        )
      );


    customers = [];


    snapshot.forEach(item => {

      customers.push({

        id: item.id,

        ...item.data()

      });

    });


    /*
      Add demo customers if database is empty.
    */

    if (customers.length === 0) {

      await addDoc(
        collection(
          db,
          CUSTOMERS_COLLECTION
        ),
        {

          customerCode: "C001",

          name: "Arun Kumar",

          phone: "9876543210",

          address: "Trichy, Tamil Nadu",

          meter: "MTR1001"

        }
      );


      await addDoc(
        collection(
          db,
          CUSTOMERS_COLLECTION
        ),
        {

          customerCode: "C002",

          name: "Priya S",

          phone: "9123456780",

          address: "Madurai, Tamil Nadu",

          meter: "MTR1002"

        }
      );


      /*
        Reload customers after inserting
        demo records.
      */

      const newSnapshot =
        await getDocs(
          collection(
            db,
            CUSTOMERS_COLLECTION
          )
        );


      customers = [];


      newSnapshot.forEach(item => {

        customers.push({

          id: item.id,

          ...item.data()

        });

      });

    }


    renderCustomers();

    populateCustomerSelect();

    updateDashboard();

  }

  catch (error) {

    console.error(
      "Customer loading error:",
      error
    );

    toast(
      "Unable to load customers"
    );

  }

}


/* =========================================================
   LOAD BILLS FROM FIREBASE
========================================================= */

async function loadBills() {

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          BILLS_COLLECTION
        )
      );


    bills = [];


    snapshot.forEach(item => {

      bills.push({

        id: item.id,

        ...item.data()

      });

    });


    renderBills();

    updateDashboard();

  }

  catch (error) {

    console.error(
      "Bill loading error:",
      error
    );

    toast(
      "Unable to load bills"
    );

  }

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

  if (totalCustomers) {

    totalCustomers.textContent =
      customers.length;

  }


  if (totalBills) {

    totalBills.textContent =
      bills.length;

  }


  if (paidBills) {

    paidBills.textContent =
      bills.filter(
        bill => bill.status === "Paid"
      ).length;

  }


  if (pendingBills) {

    pendingBills.textContent =
      bills.filter(
        bill => bill.status === "Pending"
      ).length;

  }


  if (recentBills) {

    const recent =
      bills
        .slice()
        .reverse()
        .slice(0, 5);


    if (recent.length === 0) {

      recentBills.innerHTML =
        "<p class='muted'>No bills generated yet.</p>";

    }

    else {

      recentBills.innerHTML =
        recent
          .map(bill => `

            <p>

              <strong>
                ${bill.billNumber || bill.id}
              </strong>

              —

              ${bill.customerName}

              —

              ₹${Number(
                bill.amount
              ).toFixed(2)}

              —

              <span
                class="status ${
                  bill.status === "Paid"
                    ? "paid"
                    : "pending"
                }"
              >
                ${bill.status}
              </span>

            </p>

          `)
          .join("");

    }

  }

}


/* =========================================================
   CUSTOMER SEARCH
========================================================= */

if (customerSearch) {

  customerSearch.addEventListener(
    "input",
    renderCustomers
  );

}


function renderCustomers() {

  if (!customerTable) {
    return;
  }


  const search =
    (
      customerSearch?.value || ""
    ).toLowerCase();


  const filteredCustomers =
    customers.filter(customer => {

      const data =

        (customer.customerCode || "") +

        (customer.name || "") +

        (customer.phone || "") +

        (customer.address || "") +

        (customer.meter || "");


      return data
        .toLowerCase()
        .includes(search);

    });


  if (filteredCustomers.length === 0) {

    customerTable.innerHTML = `

      <tr>

        <td colspan="6">
          No customers found.
        </td>

      </tr>

    `;

    return;

  }


  customerTable.innerHTML =
    filteredCustomers
      .map(customer => `

        <tr>

          <td>
            ${customer.customerCode || customer.id}
          </td>

          <td>
            ${customer.name}
          </td>

          <td>
            ${customer.phone}
          </td>

          <td>
            ${customer.address}
          </td>

          <td>
            ${customer.meter}
          </td>

          <td>

            <button
              class="secondary"
              onclick="editCustomer('${customer.id}')"
            >
              Edit
            </button>

            <button
              class="danger"
              onclick="deleteCustomer('${customer.id}')"
            >
              Delete
            </button>

          </td>

        </tr>

      `)
      .join("");

}


/* =========================================================
   OPEN CUSTOMER MODAL
========================================================= */

window.openCustomerModal =
  function () {

    if (customerForm) {

      customerForm.reset();

    }


    editingCustomerId = null;


    if (editCustomerId) {

      editCustomerId.value = "";

    }


    if (modalTitle) {

      modalTitle.textContent =
        "Add Customer";

    }


    if (customerModal) {

      customerModal.classList.add(
        "show"
      );

    }

  };


/* =========================================================
   CLOSE CUSTOMER MODAL
========================================================= */

window.closeCustomerModal =
  function () {

    if (customerModal) {

      customerModal.classList.remove(
        "show"
      );

    }

  };


/* =========================================================
   EDIT CUSTOMER
========================================================= */

window.editCustomer =
  function (id) {

    const customer =
      customers.find(
        item => item.id === id
      );


    if (!customer) {
      return;
    }


    editingCustomerId = id;


    if (editCustomerId) {

      editCustomerId.value =
        id;

    }


    if (customerName) {

      customerName.value =
        customer.name || "";

    }


    if (customerPhone) {

      customerPhone.value =
        customer.phone || "";

    }


    if (customerAddress) {

      customerAddress.value =
        customer.address || "";

    }


    if (meterNumber) {

      meterNumber.value =
        customer.meter || "";

    }


    if (modalTitle) {

      modalTitle.textContent =
        "Edit Customer";

    }


    if (customerModal) {

      customerModal.classList.add(
        "show"
      );

    }

  };


/* =========================================================
   CUSTOMER FORM
========================================================= */

if (customerForm) {

  customerForm.addEventListener(
    "submit",
    saveCustomerForm
  );

}


async function saveCustomerForm(event) {

  event.preventDefault();


  const name =
    customerName.value.trim();

  const phone =
    customerPhone.value.trim();

  const address =
    customerAddress.value.trim();

  const meter =
    meterNumber.value.trim();


  if (
    !name ||
    !phone ||
    !address ||
    !meter
  ) {

    toast(
      "Please fill all customer details"
    );

    return;

  }


  const customerData = {

    name: name,

    phone: phone,

    address: address,

    meter: meter

  };


  try {

    /* =========================================
       UPDATE EXISTING CUSTOMER
    ========================================= */

    if (editingCustomerId) {

      await updateDoc(

        doc(
          db,
          CUSTOMERS_COLLECTION,
          editingCustomerId
        ),

        customerData

      );


      toast(
        "Customer updated successfully"
      );

    }


    /* =========================================
       ADD NEW CUSTOMER
    ========================================= */

    else {

      const customerCode =

        "C" +

        String(
          customers.length + 1
        ).padStart(3, "0");


      customerData.customerCode =
        customerCode;


      await addDoc(

        collection(
          db,
          CUSTOMERS_COLLECTION
        ),

        customerData

      );


      toast(
        "Customer added successfully"
      );

    }


    closeCustomerModal();


    await loadCustomers();

  }

  catch (error) {

    console.error(error);

    toast(
      "Unable to save customer"
    );

  }

}


/* =========================================================
   DELETE CUSTOMER
========================================================= */

window.deleteCustomer =
  async function (id) {

    const customer =
      customers.find(
        item => item.id === id
      );


    if (!customer) {
      return;
    }


    const confirmation =
      confirm(
        `Delete ${customer.name}?`
      );


    if (!confirmation) {
      return;
    }


    try {

      await deleteDoc(

        doc(
          db,
          CUSTOMERS_COLLECTION,
          id
        )

      );


      toast(
        "Customer deleted successfully"
      );


      await loadCustomers();

    }

    catch (error) {

      console.error(error);

      toast(
        "Unable to delete customer"
      );

    }

  };


/* =========================================================
   CUSTOMER DROPDOWN
========================================================= */

function populateCustomerSelect() {

  if (!billCustomer) {
    return;
  }


  billCustomer.innerHTML =
    "<option value=''>Select customer</option>";


  customers.forEach(customer => {

    const option =
      document.createElement("option");


    option.value =
      customer.id;


    option.textContent =

      `${customer.customerCode || customer.id}
       - ${customer.name}`;


    billCustomer.appendChild(
      option
    );

  });

}


/* =========================================================
   TARIFF CALCULATION
========================================================= */

function tariff(units) {

  if (units <= 100) {

    return units * 2;

  }


  if (units <= 200) {

    return (

      100 * 2 +

      (units - 100) * 3

    );

  }


  if (units <= 500) {

    return (

      100 * 2 +

      100 * 3 +

      (units - 200) * 5

    );

  }


  return (

    100 * 2 +

    100 * 3 +

    300 * 5 +

    (units - 500) * 7

  );

}


/* =========================================================
   CALCULATE BILL
========================================================= */

function calcBill() {

  const previous =
    Number(
      previousReading?.value
    ) || 0;


  const current =
    Number(
      currentReading?.value
    ) || 0;


  const units =
    Math.max(
      0,
      current - previous
    );


  const energy =
    tariff(units);


  const fixedCharge = 50;


  const total =
    energy + fixedCharge;


  return {

    units: units,

    energy: energy,

    fixedCharge: fixedCharge,

    total: total

  };

}


/* =========================================================
   BILL PREVIEW
========================================================= */

function updatePreview() {

  const result =
    calcBill();


  if (unitsPreview) {

    unitsPreview.textContent =
      result.units;

  }


  if (energyPreview) {

    energyPreview.textContent =
      "₹" +
      result.energy.toFixed(2);

  }


  if (totalPreview) {

    totalPreview.textContent =
      "₹" +
      result.total.toFixed(2);

  }

}


/* =========================================================
   READING INPUT EVENTS
========================================================= */

[
  "previousReading",
  "currentReading"
].forEach(id => {

  const element =
    document.getElementById(id);


  if (element) {

    element.addEventListener(
      "input",
      updatePreview
    );

  }

});


/* =========================================================
   GENERATE BILL FORM
========================================================= */

if (billForm) {

  billForm.addEventListener(
    "submit",
    generateBill
  );

}


async function generateBill(event) {

  event.preventDefault();


  const customer =
    customers.find(
      item =>
        item.id ===
        billCustomer.value
    );


  const previous =
    Number(
      previousReading.value
    );


  const current =
    Number(
      currentReading.value
    );


  if (!customer) {

    toast(
      "Please select a customer"
    );

    return;

  }


  if (
    Number.isNaN(previous) ||
    Number.isNaN(current)
  ) {

    toast(
      "Please enter meter readings"
    );

    return;

  }


  if (current < previous) {

    toast(
      "Current reading cannot be less than previous reading"
    );

    return;

  }


  const result =
    calcBill();


  /*
    Generate bill number.
  */

  const billNumber =

    "B" +

    String(
      bills.length + 1
    ).padStart(4, "0");


  const billData = {

    billNumber:

      billNumber,

    customerId:

      customer.id,

    customerCode:

      customer.customerCode ||
      customer.id,

    customerName:

      customer.name,

    month:

      billMonth.value,

    previous:

      previous,

    current:

      current,

    units:

      result.units,

    energy:

      result.energy,

    fixedCharge:

      result.fixedCharge,

    amount:

      result.total,

    status:

      "Pending",

    createdAt:

      new Date().toISOString()

  };


  try {

    await addDoc(

      collection(
        db,
        BILLS_COLLECTION
      ),

      billData

    );


    toast(
      "Bill generated successfully"
    );


    billForm.reset();


    updatePreview();


    await loadBills();


    showPage("bills");

  }

  catch (error) {

    console.error(error);

    toast(
      "Unable to generate bill"
    );

  }

}


/* =========================================================
   BILL SEARCH
========================================================= */

if (billSearch) {

  billSearch.addEventListener(
    "input",
    renderBills
  );

}


/* =========================================================
   RENDER BILL TABLE
========================================================= */

function renderBills() {

  if (!billTable) {
    return;
  }


  const search =
    (
      billSearch?.value || ""
    ).toLowerCase();


  const filteredBills =

    bills

      .filter(bill => {

        const data =

          (bill.billNumber || bill.id || "") +

          (bill.customerName || "") +

          (bill.month || "");


        return data
          .toLowerCase()
          .includes(search);

      })

      .slice()
      .reverse();


  if (filteredBills.length === 0) {

    billTable.innerHTML = `

      <tr>

        <td colspan="7">
          No bills found.
        </td>

      </tr>

    `;

    return;

  }


  billTable.innerHTML =

    filteredBills

      .map(bill => `

        <tr>

          <td>
            ${bill.billNumber || bill.id}
          </td>

          <td>
            ${bill.customerName}
          </td>

          <td>
            ${bill.month}
          </td>

          <td>
            ${bill.units}
          </td>

          <td>
            ₹${Number(
              bill.amount
            ).toFixed(2)}
          </td>

          <td>

            <span
              class="status ${
                bill.status === "Paid"
                  ? "paid"
                  : "pending"
              }"
            >

              ${bill.status}

            </span>

          </td>

          <td>

            <button
              class="secondary"
              onclick="togglePayment('${bill.id}')"
            >

              ${
                bill.status === "Paid"
                  ? "Mark Pending"
                  : "Mark Paid"
              }

            </button>

          </td>

        </tr>

      `)

      .join("");

}


/* =========================================================
   PAYMENT STATUS
========================================================= */

window.togglePayment =
  async function (id) {

    const bill =
      bills.find(
        item => item.id === id
      );


    if (!bill) {
      return;
    }


    const newStatus =

      bill.status === "Paid"

        ? "Pending"

        : "Paid";


    try {

      await updateDoc(

        doc(
          db,
          BILLS_COLLECTION,
          id
        ),

        {

          status:
            newStatus

        }

      );


      toast(
        "Payment status updated"
      );


      await loadBills();

    }

    catch (error) {

      console.error(error);

      toast(
        "Unable to update payment status"
      );

    }

  };


/* =========================================================
   EXPORT BILLS
========================================================= */

window.exportBills =
  function () {

    if (bills.length === 0) {

      toast(
        "No bills to export"
      );

      return;

    }


    const header = [

      "Bill ID",

      "Customer",

      "Month",

      "Previous Reading",

      "Current Reading",

      "Units",

      "Energy Charge",

      "Fixed Charge",

      "Total Amount",

      "Status"

    ];


    const rows =

      bills.map(bill => [

        bill.billNumber || bill.id,

        bill.customerName,

        bill.month,

        bill.previous,

        bill.current,

        bill.units,

        bill.energy,

        bill.fixedCharge,

        bill.amount,

        bill.status

      ]);


    const csv =

      [header, ...rows]

        .map(row =>

          row

            .map(value =>

              `"${String(value)
                .replaceAll('"', '""')}"`
            )

            .join(",")

        )

        .join("\n");


    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href = url;

    link.download =
      "electricity_bills.csv";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);

  };


/* =========================================================
   TOAST
========================================================= */

function toast(message) {

  if (!toastElement) {
    return;
  }


  toastElement.textContent =
    message;


  toastElement.classList.add(
    "show"
  );


  setTimeout(
    () => {

      toastElement.classList.remove(
        "show"
      );

    },
    2200
  );

}


/* =========================================================
   START APPLICATION
========================================================= */

async function startApplication() {

  try {

    await loadCustomers();

    await loadBills();

    populateCustomerSelect();

    updatePreview();

    renderCustomers();

    renderBills();

    updateDashboard();

  }

  catch (error) {

    console.error(
      "Application startup error:",
      error
    );

    toast(
      "Application could not start"
    );

  }

}


/* =========================================================
   START
========================================================= */

startApplication();
