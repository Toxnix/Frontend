const sentences = [];

function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const fileContent = document.getElementById('fileContent');

    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            const content = event.target.result;
            fileContent.textContent = content;

            try {
                // Hier können Sie den Inhalt der Datei in Sätze aufteilen
                const data = JSON.parse(content);

                // Filtern Sie doppelte Sätze heraus
                const uniqueSentences = [];
                if (data.sentences && Array.isArray(data.sentences)) {
                    data.sentences.forEach((sentence) => {
                        if (!uniqueSentences.some((s) => s.sentence === sentence.sentence)) {
                            uniqueSentences.push(sentence);
                        }
                    });
                }

                sentences.length = 0; // Leert das Array
                sentences.push(...uniqueSentences);

                updateSentenceList();
                updateEditOptions();
            } catch (error) {
                console.error('Fehler beim Parsen der JSON-Daten:', error);
            }
        };

        reader.readAsText(file);
    } else {
        fileContent.textContent = 'Bitte eine Datei auswählen.';
    }
}

function handleNewSentenceKeyPress(event) {
    if (event.key === 'Enter') {
        addIndividualSentence();
    }
}


function updateSentenceList() {
    const sentenceList = document.getElementById('sentenceList');
    sentenceList.innerHTML = '';

    sentences.forEach((sentence, index) => {
        // Erstellen Sie eine Zeile für den Satz
        const row = sentenceList.insertRow();

        // Fügen Sie eine Zelle für "Satz" hinzu
        const cellSentence = row.insertCell(0);
        cellSentence.textContent = sentence.sentence;

        // Fügen Sie eine Zelle für "Toxic" hinzu
        const cellToxic = row.insertCell(1);
        cellToxic.textContent = sentence.toxic;

        // Fügen Sie eine Zelle für "Begründung" hinzu
        const cellReason = row.insertCell(2);
        cellReason.textContent = sentence.toxicReason || 'Keine Begründung';

        // Fügen Sie eine Zelle für die Bearbeiten- und Löschen-Buttons hinzu
        const cellActions = row.insertCell(3);

        // Erstellen Sie den Bearbeiten-Button
        const editButton = document.createElement('button');
        editButton.textContent = 'Bearbeiten';
        editButton.onclick = () => openEditRow(index);
        cellActions.appendChild(editButton);

        // Erstellen Sie den Löschen-Button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Löschen';
        deleteButton.onclick = () => deleteRow(index);
        cellActions.appendChild(deleteButton);

        // Fügen Sie eine Zeile für die Bearbeitung unter der aktuellen Zeile hinzu
        const editRow = sentenceList.insertRow();
        editRow.id = `editRow_${index}`;
        editRow.style.display = 'none'; // Standardmäßig ausgeblendet

        // Fügen Sie Zellen für die Bearbeitungselemente hinzu (Checkbox, Text und Speichern-Button)
        const editCell1 = editRow.insertCell(0);
        const editCell2 = editRow.insertCell(1);
        const editCell3 = editRow.insertCell(2);
        const editCell4 = editRow.insertCell(3);

        const editCheckbox = document.createElement('input');
        editCheckbox.type = 'checkbox';
        editCheckbox.checked = sentence.toxic;
        editCell1.appendChild(editCheckbox);

        const editSentenceInput = document.createElement('input');
        editSentenceInput.type = 'text';
        editSentenceInput.value = sentence.sentence;
        editCell2.appendChild(editSentenceInput);

        const editReasonInput = document.createElement('input');
        editReasonInput.type = 'text';
        editReasonInput.value = sentence.toxicReason || '';
        editCell3.appendChild(editReasonInput);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Speichern';
        saveButton.onclick = () => saveEditedSentence(index, editSentenceInput.value, editCheckbox.checked, editReasonInput.value);
        editCell4.appendChild(saveButton);
    });
}


// Funktion zum Löschen einer Zeile
function deleteRow(index) {
    sentences.splice(index, 1);
    updateSentenceList();
}


// Funktion zum Öffnen der Bearbeitungszeile
function openEditRow(index) {
    const editRow = document.getElementById(`editRow_${index}`);
    if (editRow.style.display === 'none') {
        // Vor dem Anzeigen der Bearbeitungszeile die Zellen für "Satz" und "Toxic" leeren
        const currentSentence = sentences[index].sentence;
        const currentToxic = sentences[index].toxic;

        // Zellen für die Bearbeitungszeile finden
        const editSentenceInput = document.querySelector(`#editRow_${index} input[type="text"]`);
        const editCheckbox = document.querySelector(`#editRow_${index} input[type="checkbox"]`);

        // Setzen Sie den Text für "Satz" und "Toxic" in den entsprechenden Zellen
        editSentenceInput.value = currentSentence;
        editCheckbox.checked = currentToxic;

        editRow.style.display = 'table-row';
    } else {
        editRow.style.display = 'none';
    }
}



// Funktion zum Speichern der bearbeiteten Daten
function saveEditedSentence(index, newSentence, toxic, toxicReason) {
    sentences[index].sentence = newSentence;
    sentences[index].toxic = toxic;
    sentences[index].toxicReason = toxicReason;
    updateSentenceList();
}
function updateEditOptions() {
    const editSentenceIndex = document.getElementById('editSentenceIndex');

    editSentenceIndex.innerHTML = '';
    sentences.forEach((sentence, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${index + 1}. Satz: "${sentence.sentence}"`;
        editSentenceIndex.appendChild(option);
    });
}

function editToxicValue() {
    const editSentenceIndex = document.getElementById('editSentenceIndex');
    const toxicCheckbox = document.getElementById('toxicCheckbox');
    const toxicReason = document.getElementById('toxicReason');
    const selectedIndex = editSentenceIndex.value;
    const selectedSentence = sentences[selectedIndex];

    if (selectedIndex !== '' && selectedSentence !== undefined) {
        selectedSentence.toxic = toxicCheckbox.checked;
        selectedSentence.toxicReason = toxicReason.value; // Hinzufügen der Begründung
        updateSentenceList();
    }
}


function exportData() {
    try {
        const dataToExport = { sentences };
        const jsonData = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'exported_data.json';
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Fehler beim Exportieren der Daten:', error);
    }
}

// Funktion zum Hinzufügen eines individuellen Satzes
function addIndividualSentence() {
    const newSentenceInput = document.getElementById('newSentence');
    const newSentence = newSentenceInput.value.trim();

    if (newSentence !== '') {
        if (!isSentenceDuplicate(newSentence)) {
            const newSentenceObject = { sentence: newSentence, toxic: false };
            sentences.push(newSentenceObject);
            newSentenceInput.value = '';
            updateSentenceList();
            updateEditOptions();
            updateRemoveIndividualOptions();
        } else {
            alert('Dieser Satz existiert bereits.');
        }
    }
}

function updateRemoveIndividualOptions() {
    const removeIndividualSentenceIndex = document.getElementById('removeIndividualSentenceIndex');

    removeIndividualSentenceIndex.innerHTML = '';
    sentences.forEach((sentence, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${index + 1}. Satz: "${sentence.sentence}"`;
        removeIndividualSentenceIndex.appendChild(option);
    });
}

function removeIndividualSentence() {
    const removeIndividualSentenceIndex = document.getElementById('removeIndividualSentenceIndex');
    const selectedIndex = removeIndividualSentenceIndex.value;

    if (selectedIndex !== '') {
        sentences.splice(selectedIndex, 1);
        updateSentenceList();
        updateEditOptions();
        updateRemoveIndividualOptions();
    }
}

function isSentenceDuplicate(newSentence) {
    return sentences.some(sentence => sentence.sentence === newSentence);
}