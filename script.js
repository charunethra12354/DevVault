const storageKey = "devVaultData";

let data;

try {
const savedData = JSON.parse(localStorage.getItem(storageKey));

data = {
    notes: Array.isArray(savedData?.notes) ? savedData.notes : [],
    resources: Array.isArray(savedData?.resources) ? savedData.resources : [],
    snippets: Array.isArray(savedData?.snippets) ? savedData.snippets : [],
    bugs: Array.isArray(savedData?.bugs) ? savedData.bugs : []
};

} catch {
data = {
notes: [],
resources: [],
snippets: [],
bugs: []
};
}

function saveData() {
localStorage.setItem(storageKey, JSON.stringify(data));
renderAll();
}

function escapeHTML(value) {
return String(value).replace(/[&<>"']/g, character => ({
"&": "&",
"<": "<",
">": ">",
'"': """,
"'": "'"
})[character]);
}

function safeUrl(value) {
try {
const url = new URL(value);

    if (url.protocol === "http:" || url.protocol === "https:") {
        return url.href;
    }
} catch {
    // Ignore invalid URLs.
}

return null;

}

function renderItems(type, containerId) {
const container = document.getElementById(containerId);

if (data[type].length === 0) {
    container.innerHTML = '<p class="empty">Nothing saved yet. Add your first item!</p>';
    return;
}

container.innerHTML = data[type].map((item, index) => {
    let content = "";

    if (type === "resources") {
        const url = safeUrl(item.url);

        content = url
            ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">Open resource ↗</a>`
            : "<p>Invalid resource URL.</p>";
    } else if (type === "snippets") {
        content = `<pre>${escapeHTML(item.content)}</pre>`;
    } else {
        content = `<p>${escapeHTML(item.content)}</p>`;
    }

    return `
        <article class="item">
            <h3>${escapeHTML(item.title)}</h3>
            ${content}
            <button class="delete-btn"
                data-type="${type}"
                data-index="${index}">
                Delete
            </button>
        </article>
    `;
}).join("");

}

function renderAll() {
renderItems("notes", "notesList");
renderItems("resources", "resourcesList");
renderItems("snippets", "snippetsList");
renderItems("bugs", "bugsList");

document.getElementById("noteCount").textContent = data.notes.length;
document.getElementById("resourceCount").textContent = data.resources.length;
document.getElementById("snippetCount").textContent = data.snippets.length;
document.getElementById("bugCount").textContent = data.bugs.length;

}

document.getElementById("noteForm").addEventListener("submit", event => {
event.preventDefault();

data.notes.unshift({
    title: document.getElementById("noteTitle").value.trim(),
    content: document.getElementById("noteContent").value.trim()
});

event.target.reset();
saveData();

});

document.getElementById("resourceForm").addEventListener("submit", event => {
event.preventDefault();

const title = document.getElementById("resourceTitle").value.trim();
const url = document.getElementById("resourceUrl").value.trim();

if (!safeUrl(url)) {
    alert("Please enter a valid HTTP or HTTPS URL.");
    return;
}

data.resources.unshift({ title, url });

event.target.reset();
saveData();

});

document.getElementById("snippetForm").addEventListener("submit", event => {
event.preventDefault();

data.snippets.unshift({
    title: document.getElementById("snippetTitle").value.trim(),
    content: document.getElementById("snippetContent").value.trim()
});

event.target.reset();
saveData();

});

document.getElementById("bugForm").addEventListener("submit", event => {
event.preventDefault();

data.bugs.unshift({
    title: document.getElementById("bugTitle").value.trim(),
    content: document.getElementById("bugSolution").value.trim()
});

event.target.reset();
saveData();

});

document.addEventListener("click", event => {
const button = event.target.closest(".delete-btn");

if (!button) return;

const type = button.dataset.type;
const index = Number(button.dataset.index);

if (!Object.hasOwn(data, type) || !Array.isArray(data[type])) return;
if (!Number.isInteger(index) || index < 0 || index >= data[type].length) return;

if (confirm("Are you sure you want to delete this item?")) {
    data[type].splice(index, 1);
    saveData();
}

});

document.getElementById("themeToggle").addEventListener("click", () => {
document.body.classList.toggle("dark");

localStorage.setItem(
    "devVaultTheme",
    document.body.classList.contains("dark") ? "dark" : "light"
);

});

if (localStorage.getItem("devVaultTheme") === "dark") {
document.body.classList.add("dark");
}

renderAll();
