const DEFAULT_LABELS = ["Length", "Shoulder", "Chest", "Waist", "Sleeve", "Neck"];
let currentCustomerId = null;

/* ---------- Local storage helpers ---------- */
function getCustomers() {
    return JSON.parse(localStorage.getItem("expenses")) || [];
}
function setCustomers(list) {
    localStorage.setItem("expenses", JSON.stringify(list));
}
function getSizes() {
    return JSON.parse(localStorage.getItem("sizes")) || {};
}
function setSizes(obj) {
    localStorage.setItem("sizes", JSON.stringify(obj));
}

/* ---------- Customer table ---------- */
function addCustomerToTable(customer) {
    const tr = document.createElement("tr");

    ["name", "description", "category"].forEach(key => {
        const td = document.createElement("td");
        td.textContent = customer[key];
        tr.appendChild(td);
    });

    const actionTd = document.createElement("td");

    const sizeBtn = document.createElement("button");
    sizeBtn.textContent = "Size";
    sizeBtn.className = "size-btn";
    sizeBtn.addEventListener("click", () => openSizeModal(customer));

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "del-btn";
    delBtn.addEventListener("click", () => {
        tr.remove();
        setCustomers(getCustomers().filter(c => c.id !== customer.id));

        const sizes = getSizes();
        delete sizes[customer.id];
        setSizes(sizes);
    });

    actionTd.appendChild(sizeBtn);
    actionTd.appendChild(delBtn);
    tr.appendChild(actionTd);

    document.querySelector("#expense-list").appendChild(tr);
}

function loadCustomers() {
    let customers = getCustomers();

    // give an id to old records that don't have one
    let changed = false;
    customers.forEach(c => {
        if (!c.id) {
            c.id = Date.now().toString() + Math.random().toString(16).slice(2);
            changed = true;
        }
    });
    if (changed) setCustomers(customers);

    customers.forEach(addCustomerToTable);
}

document.querySelector("#addBtn").addEventListener("click", () => {
    const name = document.querySelector("#expense-name").value.trim();
    const description = document.querySelector("#description").value.trim();
    const category = document.querySelector("#expense-category").value;

    if (!name) {
        alert("Please enter customer name");
        return;
    }

    const customer = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        name,
        description,
        category
    };

    addCustomerToTable(customer);

    const list = getCustomers();
    list.push(customer);
    setCustomers(list);

    document.querySelector("#expense-name").value = "";
    document.querySelector("#description").value = "";
    document.querySelector("#expense-category").value = "";
});

/* ---------- Size popup ---------- */
const modal = document.querySelector("#sizeModal");
const sizeBody = document.querySelector("#sizeBody");
const editSizeBtn = document.querySelector("#editSizeBtn");
const saveSizeBtn = document.querySelector("#saveSizeBtn");

function renderSizeRows(rows) {
    sizeBody.innerHTML = "";
    rows.forEach(row => {
        const tr = document.createElement("tr");

        const td1 = document.createElement("td");
        const labelInput = document.createElement("input");
        labelInput.type = "text";
        labelInput.value = row.label;
        td1.appendChild(labelInput);

        const td2 = document.createElement("td");
        const valueInput = document.createElement("input");
        valueInput.type = "text";
        valueInput.value = row.value;
        valueInput.placeholder = "e.g. 40";
        td2.appendChild(valueInput);

        tr.appendChild(td1);
        tr.appendChild(td2);
        sizeBody.appendChild(tr);
    });
}

function setEditable(editable) {
    sizeBody.querySelectorAll("input").forEach(input => {
        input.disabled = !editable;
    });
    editSizeBtn.disabled = editable;   // already editing
    saveSizeBtn.disabled = !editable;  // nothing to save when locked
}

function openSizeModal(customer) {
    currentCustomerId = customer.id;
    document.querySelector("#sizeTitle").textContent = "Size - " + customer.name;

    const saved = getSizes()[customer.id];
    if (saved) {
        renderSizeRows(saved);
        setEditable(false);   // saved data opens locked, click Edit to change
    } else {
        renderSizeRows(DEFAULT_LABELS.map(label => ({ label, value: "" })));
        setEditable(true);    // new data opens ready to type
    }

    modal.classList.add("show");
}

function closeSizeModal() {
    modal.classList.remove("show");
    currentCustomerId = null;
}

editSizeBtn.addEventListener("click", () => setEditable(true));

saveSizeBtn.addEventListener("click", () => {
    const rows = [];
    sizeBody.querySelectorAll("tr").forEach(tr => {
        const inputs = tr.querySelectorAll("input");
        rows.push({ label: inputs[0].value.trim(), value: inputs[1].value.trim() });
    });

    const sizes = getSizes();
    sizes[currentCustomerId] = rows;
    setSizes(sizes);

    setEditable(false);
});

document.querySelector("#closeSizeBtn").addEventListener("click", closeSizeModal);

// click on dark background closes popup
modal.addEventListener("click", e => {
    if (e.target === modal) closeSizeModal();
});

// Esc key closes popup
document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeSizeModal();
});

window.addEventListener("load", loadCustomers);