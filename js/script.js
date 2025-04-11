// Global variables
let playlist = [];
let currentTrackIndex = -1;
const audioPlayer = document.getElementById('audioPlayer');
const nowPlaying = document.getElementById('nowPlaying');
const playlistElement = document.getElementById('playlist');
const audioStatus = document.getElementById('audioStatus');
const docStatus = document.getElementById('docStatus');
const textContent = document.getElementById('textContent');
const selectAllCheckbox = document.getElementById('selectAll');
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');

// Declare mammoth variable
const mammoth = window.mammoth;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set up tab navigation
    setupTabs();

    // Set up document handling
    setupDocumentHandling();

    // Set up audio handling
    setupAudioHandling();

    // Set up playlist controls
    setupPlaylistControls();

    // Initialize playlist with hardcoded songs
    initializePlaylist();

    // Initialize document with hardcoded path
    initializeDocument();
});

// Initialize document with hardcoded path
function initializeDocument() {
    // You can choose one of these methods to load your document

    // Example with a text file (relative path)
    // loadDocumentFromPath('./documents/sample.txt', 'txt');

    // Example with a docx file (relative path)
    loadDocumentFromPath('./text/CHICAGO.docx', 'CHICAGO');

    // Example with absolute paths (files on your computer)
    // Note: These will only work if running the app locally
    // loadDocumentFromPath('file:///C:/Users/YourName/Documents/sample.txt', 'txt');
    // loadDocumentFromPath('file:///C:/Users/YourName/Documents/sample.docx', 'docx');

    // Example with URLs (files hosted online)
    // loadDocumentFromPath('https://example.com/documents/sample.txt', 'txt');
    // loadDocumentFromPath('https://github.com/DefinitelyNotAngel/chicagoshiz/text/CHICAGO.docx', 'docx');

    // Example with hardcoded text content
    // loadHardcodedText('This is a sample text that is directly hardcoded in the JavaScript file. You can put any text content here.');
}

// Helper function to load document from a path
async function loadDocumentFromPath(path, type) {
    docStatus.textContent = 'Loading document...';
    docStatus.style.color = 'blue';

    try {
        // For file:/// URLs, we can't use fetch due to browser security restrictions
        if (path.startsWith('file:///')) {
            docStatus.textContent = 'Local file system URLs (file:///) can only be accessed when manually selected due to browser security restrictions. Please use the file selector or drag and drop instead.';
            docStatus.style.color = 'red';
            return;
        }

        const response = await fetch(path);
        if (!response.ok) throw new Error('Failed to fetch document');

        if (type === 'txt') {
            const text = await response.text();
            displayTextContent(text);
            docStatus.textContent = 'Document loaded successfully!';
            docStatus.style.color = 'green';
        } else if (type === 'docx') {
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            processDocxFile(arrayBuffer);
        }
    } catch (error) {
        docStatus.textContent = `Error loading document: ${error.message}`;
        docStatus.style.color = 'red';
        console.error('Error loading document:', error);
    }
}

// Helper function to load hardcoded text
function loadHardcodedText(text) {
    displayTextContent(text);
    docStatus.textContent = 'Document loaded successfully!';
    docStatus.style.color = 'green';
}

// Initialize playlist with hardcoded songs
function initializePlaylist() {
    // Clear any existing playlist
    playlist = [];

    // Add your hardcoded songs here
    // You can use relative paths (if files are in your project) or absolute URLs

    // Example with relative paths (files in your project)
    addSongToPlaylist('./muzica/1 + 2 overture.all that jazz.mp3', 'overture/all that jazz');
    addSongToPlaylist('./muzica/3 funny honey.mp3', 'funny honey');
    addSongToPlaylist('./muzica/4 cell block tango.mp3', 'cell block tango');
    addSongToPlaylist('./muzica/5 when you\'re good to mama.mp3', 'when you\'re good to mama');
    addSongToPlaylist('./muzica/7 all i care about is love.mp3', 'all i care about is love');
    addSongToPlaylist('./muzica/10 they both reached for the gun.mp3', 'they both reached for the gun');
    addSongToPlaylist('./muzica/11 roxie.mp3', 'roxie');
    addSongToPlaylist('./muzica/12 I cant do it alone.mp3', 'I cant do it alone');
    addSongToPlaylist('./muzica/13 mr cellophane.mp3', 'mr cellophane');
    addSongToPlaylist('./muzica/14 razzle dazzle.mp3', 'razzle dazzle');

    // Example with absolute paths (files on your computer)
    // Note: These will only work if running the app locally
    // addSongToPlaylist('file:///C:/Users/YourName/Music/song1.mp3', 'Song 1');
    // addSongToPlaylist('file:///C:/Users/YourName/Music/song2.mp3', 'Song 2');

    // Example with URLs (files hosted online)
    // addSongToPlaylist('https://example.com/music/song1.mp3', 'Online Song 1');
    // addSongToPlaylist('https://example.com/music/song2.mp3', 'Online Song 2');

    // Render the playlist
    renderPlaylist();

    // Start playing the first song if playlist is not empty
    if (playlist.length > 0) {
        currentTrackIndex = 0;
        playTrack(0);
    }
}

// Helper function to add a song to the playlist
function addSongToPlaylist(path, name) {
    playlist.push({
        name: name,
        url: path,
        source: 'path'
    });
}

// Tab navigation setup
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get the parent tab container
            const tabContainer = button.closest('.option-tabs').parentElement;

            // Remove active class from all buttons and content in this container
            tabContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            tabContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Show the corresponding content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Document handling setup
function setupDocumentHandling() {
    // File input handling
    const docFileInput = document.getElementById('docFile');
    docFileInput.addEventListener('change', handleDocumentFile);

    // Drag and drop for documents
    const docDropArea = document.getElementById('docDropArea');
    setupDragAndDrop(docDropArea, handleDocumentFile);

    // Connect the file input to the drop area
    docDropArea.addEventListener('click', () => docFileInput.click());

    // Paste text handling
    const pasteTextArea = document.getElementById('pasteTextArea');
    const loadPastedTextBtn = document.getElementById('loadPastedText');

    loadPastedTextBtn.addEventListener('click', () => {
        const text = pasteTextArea.value.trim();
        if (text) {
            displayTextContent(text);
            docStatus.textContent = 'Text loaded successfully!';
            docStatus.style.color = 'green';
        } else {
            docStatus.textContent = 'Please paste some text first.';
            docStatus.style.color = 'red';
        }
    });

    // URL document loading
    const docUrlInput = document.getElementById('docUrl');
    const loadDocUrlBtn = document.getElementById('loadDocUrl');

    loadDocUrlBtn.addEventListener('click', async () => {
        const url = docUrlInput.value.trim();
        if (!url) {
            docStatus.textContent = 'Please enter a URL.';
            docStatus.style.color = 'red';
            return;
        }

        try {
            docStatus.textContent = 'Loading document...';
            docStatus.style.color = 'blue';

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch document');

            const contentType = response.headers.get('content-type');

            if (url.endsWith('.docx') || (contentType && contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document'))) {
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                processDocxFile(arrayBuffer);
            } else {
                const text = await response.text();
                displayTextContent(text);
                docStatus.textContent = 'Document loaded successfully!';
                docStatus.style.color = 'green';
            }
        } catch (error) {
            docStatus.textContent = `Error loading document: ${error.message}`;
            docStatus.style.color = 'red';
        }
    });
}

// Audio handling setup
function setupAudioHandling() {
    // File input handling
    const audioFileInput = document.getElementById('audioFile');
    audioFileInput.addEventListener('change', handleAudioFiles);

    // Drag and drop for audio
    const audioDropArea = document.getElementById('audioDropArea');
    setupDragAndDrop(audioDropArea, handleAudioFiles);

    // Connect the file input to the drop area
    audioDropArea.addEventListener('click', () => audioFileInput.click());

    // URL audio loading
    const audioUrlInput = document.getElementById('audioUrl');
    const audioNameInput = document.getElementById('audioName');
    const loadAudioUrlBtn = document.getElementById('loadAudioUrl');

    loadAudioUrlBtn.addEventListener('click', () => {
        const url = audioUrlInput.value.trim();
        let name = audioNameInput.value.trim();

        if (!url) {
            audioStatus.textContent = 'Please enter a URL.';
            audioStatus.style.color = 'red';
            return;
        }

        if (!name) {
            // Extract filename from URL if no name provided
            const urlParts = url.split('/');
            name = urlParts[urlParts.length - 1].split('?')[0] || 'Unknown Track';
        }

        addTrackToPlaylist({
            name: name,
            url: url,
            source: 'url'
        });

        audioUrlInput.value = '';
        audioNameInput.value = '';
        audioStatus.textContent = 'Track added to playlist!';
        audioStatus.style.color = 'green';
    });

    // Audio player controls
    document.getElementById('prevButton').addEventListener('click', playPrevious);
    document.getElementById('nextButton').addEventListener('click', playNext);

    // Audio player events
    audioPlayer.addEventListener('ended', () => {
        playNext();
    });
}

// Playlist controls setup
function setupPlaylistControls() {
    // Select all functionality
    selectAllCheckbox.addEventListener('change', toggleSelectAll);

    // Delete selected functionality
    deleteSelectedBtn.addEventListener('click', deleteSelected);

    // Update delete button state when checkboxes change
    playlistElement.addEventListener('change', updateDeleteButtonState);
}

// Drag and drop setup
function setupDragAndDrop(dropArea, handleCallback) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('highlight');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('highlight');
        }, false);
    });

    dropArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            // Create a fake event object with files
            const fakeEvent = { target: { files: files } };
            handleCallback(fakeEvent);
        }
    }, false);
}

// Document file handling
function handleDocumentFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    docStatus.textContent = 'Loading document...';
    docStatus.style.color = 'blue';

    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    if (fileName.endsWith('.txt')) {
        reader.onload = function(e) {
            displayTextContent(e.target.result);
            docStatus.textContent = 'Document loaded successfully!';
            docStatus.style.color = 'green';
        };
        reader.readAsText(file);
    } else if (fileName.endsWith('.docx')) {
        reader.onload = function(e) {
            processDocxFile(e.target.result);
        };
        reader.readAsArrayBuffer(file);
    } else {
        docStatus.textContent = 'Unsupported file format. Please use .txt or .docx files.';
        docStatus.style.color = 'red';
    }
}

// Process DOCX file using mammoth.js
function processDocxFile(arrayBuffer) {
    mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
        .then(result => {
            displayTextContent(result.value);
            docStatus.textContent = 'Document loaded successfully!';
            docStatus.style.color = 'green';

            if (result.messages.length > 0) {
                console.warn('Warnings:', result.messages);
            }
        })
        .catch(error => {
            docStatus.textContent = `Error processing DOCX file: ${error.message}`;
            docStatus.style.color = 'red';
        });
}

// Display text content
function displayTextContent(content) {
    textContent.innerHTML = content;
}

// Audio files handling
function handleAudioFiles(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    audioStatus.textContent = 'Adding tracks to playlist...';
    audioStatus.style.color = 'blue';

    let addedCount = 0;

    Array.from(files).forEach(file => {
        if (file.type.startsWith('audio/')) {
            const objectURL = URL.createObjectURL(file);
            addTrackToPlaylist({
                name: file.name,
                url: objectURL,
                source: 'file',
                file: file
            });
            addedCount++;
        }
    });

    if (addedCount > 0) {
        audioStatus.textContent = `Added ${addedCount} track(s) to playlist.`;
        audioStatus.style.color = 'green';

        // If this is the first track and nothing is playing, start playing
        if (playlist.length === addedCount && currentTrackIndex === -1) {
            currentTrackIndex = 0;
            playTrack(0);
        }
    } else {
        audioStatus.textContent = 'No valid audio files were selected.';
        audioStatus.style.color = 'red';
    }

    // Reset the file input to allow selecting the same files again
    if (event.target.id === 'audioFile') {
        event.target.value = '';
    }
}

// Add track to playlist
function addTrackToPlaylist(track) {
    playlist.push(track);
    renderPlaylist();
}

// Render playlist
function renderPlaylist() {
    playlistElement.innerHTML = '';

    if (playlist.length === 0) {
        playlistElement.innerHTML = '<div class="playlist-empty">Playlist is empty</div>';
        return;
    }

    playlist.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (index === currentTrackIndex) {
            item.classList.add('active');
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'track-checkbox';
        checkbox.dataset.index = index;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = track.name;
        nameSpan.style.marginLeft = '10px';
        nameSpan.style.flexGrow = '1';

        item.appendChild(checkbox);
        item.appendChild(nameSpan);

        // Add click event to play the track
        nameSpan.addEventListener('click', () => {
            currentTrackIndex = index;
            playTrack(index);
        });

        playlistElement.appendChild(item);
    });

    updateDeleteButtonState();
}

// Play track
function playTrack(index) {
    if (index < 0 || index >= playlist.length) return;

    const track = playlist[index];
    audioPlayer.src = track.url;
    audioPlayer.play().catch(error => {
        console.error('Error playing track:', error);
        audioStatus.textContent = `Error playing track: ${error.message}`;
        audioStatus.style.color = 'red';
    });

    nowPlaying.textContent = `Now Playing: ${track.name}`;

    // Update active class in playlist
    const items = playlistElement.querySelectorAll('.playlist-item');
    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Play previous track
function playPrevious() {
    if (playlist.length === 0) return;

    currentTrackIndex--;
    if (currentTrackIndex < 0) {
        currentTrackIndex = playlist.length - 1;
    }

    playTrack(currentTrackIndex);
}

// Play next track
function playNext() {
    if (playlist.length === 0) return;

    currentTrackIndex++;
    if (currentTrackIndex >= playlist.length) {
        currentTrackIndex = 0;
    }

    playTrack(currentTrackIndex);
}

// Toggle select all tracks
function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.track-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });

    updateDeleteButtonState();
}

// Delete selected tracks
function deleteSelected() {
    const checkboxes = document.querySelectorAll('.track-checkbox:checked');
    if (checkboxes.length === 0) return;

    // Get indices to remove (in descending order to avoid index shifting issues)
    const indicesToRemove = Array.from(checkboxes)
        .map(checkbox => parseInt(checkbox.dataset.index))
        .sort((a, b) => b - a);

    // Check if currently playing track will be removed
    const willRemoveCurrentTrack = indicesToRemove.includes(currentTrackIndex);

    // Remove tracks from playlist
    indicesToRemove.forEach(index => {
        // Release object URL if it's a file source
        if (playlist[index].source === 'file') {
            URL.revokeObjectURL(playlist[index].url);
        }
        playlist.splice(index, 1);
    });

    // Update current track index
    if (willRemoveCurrentTrack) {
        if (playlist.length > 0) {
            currentTrackIndex = 0;
            playTrack(0);
        } else {
            currentTrackIndex = -1;
            audioPlayer.pause();
            audioPlayer.src = '';
            nowPlaying.textContent = 'No song selected';
        }
    } else if (currentTrackIndex !== -1) {
        // Adjust currentTrackIndex if tracks before it were removed
        let newIndex = currentTrackIndex;
        indicesToRemove.forEach(index => {
            if (index < currentTrackIndex) {
                newIndex--;
            }
        });
        currentTrackIndex = newIndex;
    }

    // Reset select all checkbox
    selectAllCheckbox.checked = false;

    // Render updated playlist
    renderPlaylist();

    audioStatus.textContent = `Removed ${indicesToRemove.length} track(s) from playlist.`;
    audioStatus.style.color = 'green';
}

// Update delete button state
function updateDeleteButtonState() {
    const hasCheckedItems = document.querySelectorAll('.track-checkbox:checked').length > 0;
    deleteSelectedBtn.disabled = !hasCheckedItems;
}
