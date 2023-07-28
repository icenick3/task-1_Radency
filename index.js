import {notes} from './notes.js';
import {extractDatesFromNoteContent} from './utilis.js';


function createNoteDiv(note) {
    const noteDiv = document.createElement("div");
    noteDiv.classList.add("note");


    noteDiv.innerHTML = `
        <div class="note-name">${note.name}</div>
        <div class="note-dates">${note.dates}</div>
         <div class="note-category">${note.category}</div>
        <div class="note-content">${note.content}</div>
        <div class="note-all-dates">${note.allDates}</div>
        <div class="note-actions">
            ${!note.archived ? `<button class="editBtn" data-id="${note.id}">
                <img src="img/pencil%20(1).png" alt="">
            </button>` : ''}
            ${!note.archived ? `<button class="archiveBtn" data-id="${note.id}">
                <img src="img/folder%20(1).png" alt="">
            </button>` : ''}
            ${note.archived ? `<button class="unarchiveBtn" data-id="${note.id}">
                    <img src="img/archive%20(1).png" alt="">
            </button>` : ''}
            <button class="deleteBtn" data-id="${note.id}">
                 <img src="img/dustbin%20(1).png" alt="">
            </button>
        </div>
    `;

    return noteDiv;
}

function renderNotes() {
    const notesTable = document.getElementById("notesTable");
    const archivedNotesTable = document.getElementById("archivedNotesTable");


    notesTable.innerHTML = "";
    archivedNotesTable.innerHTML = "";

    notes.forEach((note) => {
        const noteDiv = createNoteDiv(note);

        if (note.archived) {
            archivedNotesTable.appendChild(noteDiv);
        } else {
            notesTable.appendChild(noteDiv);
        }
    });


}

function renderArchivedNotes() {
    const archivedNotesTable = document.getElementById("archivedNotesTable");
    archivedNotesTable.innerHTML = "";

    const archivedNotes = notes.filter((note) => note.archived);

    archivedNotes.forEach((note) => {
        const noteDiv = createNoteDiv(note);
        archivedNotesTable.appendChild(noteDiv);
    });

}

function unarchiveNote(noteId) {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    note.archived = false;
    renderNotes();
    renderSummary();
}

function computeSummaryData() {
    const activeNotesByCategory = {
        Task: 0,
        'Random Thought': 0,
        Idea: 0,
    };

    const archivedNotesByCategory = {
        Task: 0,
        'Random Thought': 0,
        Idea: 0,
    };

    notes.forEach((note) => {
        const category = note.category;
        if (note.archived) {
            archivedNotesByCategory[category]++;
        } else {
            activeNotesByCategory[category]++;
        }
    });

    return {activeNotesByCategory, archivedNotesByCategory};
}

function renderSummary() {
    const summaryTable = document.getElementById("summaryTable");
    summaryTable.innerHTML = "";

    const {activeNotesByCategory, archivedNotesByCategory} = computeSummaryData();

    const headerRow = document.createElement("div");
    headerRow.id = "summary-header"
    headerRow.innerHTML = "<div>Category</div><div>Active Notes</div><div>Archived Notes</div>";
    summaryTable.appendChild(headerRow);
    Object.keys(activeNotesByCategory).forEach((category) => {
        const activeNotes = activeNotesByCategory[category];
        const archivedNotes = archivedNotesByCategory[category];

        const row = document.createElement("div");
        row.innerHTML = `<div>${category}</div><div>${activeNotes}</div><div>${archivedNotes}</div>`;
        summaryTable.appendChild(row);
    });
}

function addNote() {
    const content = document.getElementById("noteContent").value;
    const date = document.getElementById("noteDate").value;
    const noteName = document.getElementById("noteName").value.trim();
    const category = document.getElementById("noteCategory").value;
    const noteContent = document.getElementById("noteContent").value.trim();
    const allDates = extractDatesFromNoteContent(noteContent).join(", ");

    if (noteName === "" || noteContent === "") return;

    const newNote = {
        id: Date.now(),
        name: noteName,
        content,
        category,
        allDates: allDates,
        dates: date ? [date] : [],
        archived: false,
    };

    notes.push(newNote);
    renderNotes();
    renderSummary();
}

function editNotePopup(noteId) {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const popup = document.createElement("div");
    popup.classList.add("popup-container");

    popup.innerHTML = `
    <div class="popup">
        <input type="text" id="editName" value="${note.name}">
        <textarea id="editContent">${note.content}</textarea>
        <select id="editCategory">
            <option value="Task" ${note.category === "Task" ? "selected" : ""}>Task</option>
            <option value="Random Thought" ${note.category === "Random Thought" ? "selected" : ""}>Random Thought</option>
            <option value="Idea" ${note.category === "Idea" ? "selected" : ""}>Idea</option>
        </select>
        <input type="date" id="editDates" value="${note.dates}">
        <button id="saveEditBtn">Save</button>
    </div>
    `;

    document.body.appendChild(popup);

    const saveEditBtn = document.getElementById("saveEditBtn");
    saveEditBtn.addEventListener("click", () => {
        const editedNote = {
            ...note,
            name: document.getElementById("editName").value,
            content: document.getElementById("editContent").value,
            category: document.getElementById("editCategory").value,
            dates: document.getElementById("editDates").value,
            allDates: extractDatesFromNoteContent(document.getElementById("editContent").value).join(", ")
        };
        notes.splice(notes.indexOf(note), 1, editedNote);
        renderNotes();
        renderSummary();
        document.body.removeChild(popup);
    });
}


function deleteNote(noteId) {
    const index = notes.findIndex((note) => note.id === noteId);
    if (index !== -1) {
        notes.splice(index, 1);
        renderNotes();
        renderSummary();
    }
}

function archiveNote(noteId) {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    note.archived = !note.archived;
    renderNotes();
    renderSummary();
}

document.getElementById("addNoteBtn").addEventListener("click", addNote);

document.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("editBtn")) {
        const noteId = parseInt(target.getAttribute("data-id"), 10);
        editNotePopup(noteId);
    } else if (target.classList.contains("archiveBtn")) {
        const noteId = parseInt(target.getAttribute("data-id"), 10);
        archiveNote(noteId);
    } else if (target.classList.contains("deleteBtn")) {
        const noteId = parseInt(target.getAttribute("data-id"), 10);
        deleteNote(noteId);
    } else if (target.classList.contains("unarchiveBtn")) {
        const noteId = parseInt(target.getAttribute("data-id"), 10);
        unarchiveNote(noteId);
    }
});

renderNotes();
renderArchivedNotes();
renderSummary();


function handleArchiveHeaderVisibility() {
    const hasArchivedNote = notes.some((note) => note.archived);
    const archiveHeader = document.querySelector(".table-header_archive");
    const h1 = document.querySelector(".archive-h1");
    if (archiveHeader) {
        if (hasArchivedNote) {
            archiveHeader.classList.remove("none");
            h1.classList.remove("none");
        } else {
            archiveHeader.classList.add("none");
            h1.classList.add("none");
        }
    }

}

document.addEventListener("DOMContentLoaded", () => {
    handleArchiveHeaderVisibility();

    const body = document.querySelector('body');
    const observer = new MutationObserver(handleArchiveHeaderVisibility);
    observer.observe(body, {childList: true, subtree: true});
});

let show = true;
const showAddNote = document.querySelector(".create-note");
const noteForm = document.querySelector(".add-note");
const addbtn = document.querySelector("#addNoteBtn");
const noteName = document.querySelector("#noteName");
const noteContent = document.querySelector("#noteContent");

showAddNote.addEventListener("click", () => {
    if (show) {
        document.querySelector(".note-form").style.display = "block";
        show = false;
        showAddNote.src = "https://i.pinimg.com/originals/db/70/78/db7078a8e1b1feaa210bc1c8421ee79b.png";
        noteForm.classList.remove("back");

    } else {
        document.querySelector(".note-form").style.display = "none";
        show = true;
        showAddNote.src = "https://i.pinimg.com/originals/cc/ff/ab/ccffabdda4506215191818cc8b8ce629.png";
        noteForm.classList.add("back");
    }
})


addbtn.addEventListener("click", () => {
    if (noteName.value && noteContent.value) {
        show = true;
        document.querySelector(".note-form").style.display = "none";
        showAddNote.src = "https://i.pinimg.com/originals/cc/ff/ab/ccffabdda4506215191818cc8b8ce629.png";
        noteForm.classList.add("back");
        noteContent.style.border = "none";
        noteName.style.border = "none";
    } else if (noteName.value) {
        noteContent.style.border = "solid 1px red";
        noteName.style.border = "none";
    } else if (noteContent.value) {
        noteName.style.border = "solid 1px red";
        noteContent.style.border = "none";
    } else {
        noteContent.style.border = "solid 1px red";
        noteName.style.border = "solid 1px red";
    }
})


const body = document.querySelector('body');
const observer = new MutationObserver(()=>{
    const popup = document.querySelector(".popup-container");
    const pop = document.querySelector(".popup");
    popup.addEventListener("click", () => {
        document.body.removeChild(popup);
        popup.classList.add("back");
    })
    pop.addEventListener("click", (e)=>{
        e.stopImmediatePropagation();
    })
});
observer.observe(body, {childList: true, subtree: true});

