const KEY_C="eb_customers", KEY_B="eb_bills";
let customers=JSON.parse(localStorage.getItem(KEY_C)||"[]");
let bills=JSON.parse(localStorage.getItem(KEY_B)||"[]");

if(!customers.length){
  customers=[
    {id:"C001",name:"Arun Kumar",phone:"9876543210",address:"Trichy, Tamil Nadu",meter:"MTR1001"},
    {id:"C002",name:"Priya S",phone:"9123456780",address:"Madurai, Tamil Nadu",meter:"MTR1002"}
  ];
  saveCustomers();
}

document.getElementById("today").textContent=new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
document.querySelectorAll(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.page)));
document.getElementById("customerSearch").addEventListener("input",renderCustomers);
document.getElementById("billSearch").addEventListener("input",renderBills);
["previousReading","currentReading"].forEach(id=>document.getElementById(id).addEventListener("input",updatePreview));
document.getElementById("billForm").addEventListener("submit",generateBill);
document.getElementById("customerForm").addEventListener("submit",saveCustomerForm);

function saveCustomers(){localStorage.setItem(KEY_C,JSON.stringify(customers))}
function saveBills(){localStorage.setItem(KEY_B,JSON.stringify(bills))}
function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
  const titles={dashboard:"Dashboard",customers:"Customers",billing:"Generate Bill",bills:"Bill History"};
  document.getElementById("pageTitle").textContent=titles[id];
  if(id==="customers")renderCustomers();
  if(id==="billing")populateCustomerSelect();
  if(id==="bills")renderBills();
  updateDashboard();
}
function updateDashboard(){
  totalCustomers.textContent=customers.length;
  totalBills.textContent=bills.length;
  paidBills.textContent=bills.filter(b=>b.status==="Paid").length;
  pendingBills.textContent=bills.filter(b=>b.status==="Pending").length;
  const recent=bills.slice(-5).reverse();
  recentBills.innerHTML=recent.length?recent.map(b=>`<p><strong>${b.id}</strong> — ${b.customerName} — ₹${b.amount.toFixed(2)} — <span class="status ${b.status==="Paid"?"paid":"pending"}">${b.status}</span></p>`).join(""):"<p class='muted'>No bills generated yet.</p>";
}
function renderCustomers(){
  const q=customerSearch.value.toLowerCase();
  const rows=customers.filter(c=>(c.name+c.id+c.meter+c.phone).toLowerCase().includes(q));
  customerTable.innerHTML=rows.map(c=>`<tr><td>${c.id}</td><td>${c.name}</td><td>${c.phone}</td><td>${c.address}</td><td>${c.meter}</td><td><button class="secondary" onclick="editCustomer('${c.id}')">Edit</button> <button class="danger" onclick="deleteCustomer('${c.id}')">Delete</button></td></tr>`).join("")||"<tr><td colspan='6'>No customers found.</td></tr>";
}
function openCustomerModal(){
  customerForm.reset(); editCustomerId.value=""; modalTitle.textContent="Add Customer"; customerModal.classList.add("show");
}
function closeCustomerModal(){customerModal.classList.remove("show")}
function editCustomer(id){
  const c=customers.find(x=>x.id===id); if(!c)return;
  editCustomerId.value=c.id; customerName.value=c.name; customerPhone.value=c.phone; customerAddress.value=c.address; meterNumber.value=c.meter;
  modalTitle.textContent="Edit Customer"; customerModal.classList.add("show");
}
function saveCustomerForm(e){
  e.preventDefault();
  const id=editCustomerId.value;
  if(id){
    const c=customers.find(x=>x.id===id); Object.assign(c,{name:customerName.value,phone:customerPhone.value,address:customerAddress.value,meter:meterNumber.value});
    toast("Customer updated");
  }else{
    const newId="C"+String(customers.length+1).padStart(3,"0");
    customers.push({id:newId,name:customerName.value,phone:customerPhone.value,address:customerAddress.value,meter:meterNumber.value});
    toast("Customer added");
  }
  saveCustomers(); closeCustomerModal(); renderCustomers(); populateCustomerSelect(); updateDashboard();
}
function deleteCustomer(id){
  if(!confirm("Delete this customer?"))return;
  customers=customers.filter(c=>c.id!==id); saveCustomers(); renderCustomers(); populateCustomerSelect(); updateDashboard(); toast("Customer deleted");
}
function populateCustomerSelect(){
  billCustomer.innerHTML="<option value=''>Select customer</option>"+customers.map(c=>`<option value="${c.id}">${c.id} - ${c.name}</option>`).join("");
}
function tariff(units){
  if(units<=100)return units*2;
  if(units<=200)return 100*2+(units-100)*3;
  if(units<=500)return 100*2+100*3+(units-200)*5;
  return 100*2+100*3+300*5+(units-500)*7;
}
function calcBill(){
  const prev=Number(previousReading.value)||0, cur=Number(currentReading.value)||0;
  const units=Math.max(0,cur-prev), energy=tariff(units), total=energy+50;
  return {units,energy,total};
}
function updatePreview(){
  const x=calcBill(); unitsPreview.textContent=x.units; energyPreview.textContent="₹"+x.energy.toFixed(2); totalPreview.textContent="₹"+x.total.toFixed(2);
}
function generateBill(e){
  e.preventDefault();
  const customer=customers.find(c=>c.id===billCustomer.value);
  const prev=Number(previousReading.value),cur=Number(currentReading.value);
  if(!customer||cur<prev){toast("Check customer and meter readings");return}
  const x=calcBill(), id="B"+String(bills.length+1).padStart(4,"0");
  bills.push({id,customerId:customer.id,customerName:customer.name,month:billMonth.value,previous:prev,current:cur,units:x.units,amount:x.total,status:"Pending"});
  saveBills(); e.target.reset(); updatePreview(); updateDashboard(); toast("Bill generated successfully"); showPage("bills");
}
function renderBills(){
  const q=billSearch.value.toLowerCase();
  const rows=bills.filter(b=>(b.id+b.customerName+b.month).toLowerCase().includes(q)).slice().reverse();
  billTable.innerHTML=rows.map(b=>`<tr><td>${b.id}</td><td>${b.customerName}</td><td>${b.month}</td><td>${b.units}</td><td>₹${b.amount.toFixed(2)}</td><td><span class="status ${b.status==="Paid"?"paid":"pending"}">${b.status}</span></td><td><button class="secondary" onclick="togglePayment('${b.id}')">${b.status==="Paid"?"Mark Pending":"Mark Paid"}</button></td></tr>`).join("")||"<tr><td colspan='7'>No bills found.</td></tr>";
}
function togglePayment(id){
  const b=bills.find(x=>x.id===id); if(!b)return;
  b.status=b.status==="Paid"?"Pending":"Paid"; saveBills(); renderBills(); updateDashboard(); toast("Payment status updated");
}
function exportBills(){
  if(!bills.length){toast("No bills to export");return}
  const head=["Bill ID","Customer","Month","Units","Amount","Status"];
  const csv=[head,...bills.map(b=>[b.id,b.customerName,b.month,b.units,b.amount,b.status])].map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download="electricity_bills.csv"; a.click(); URL.revokeObjectURL(a.href);
}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
populateCustomerSelect(); updatePreview(); renderCustomers(); renderBills(); updateDashboard();
