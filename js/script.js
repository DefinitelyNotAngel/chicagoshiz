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

// Drag-and-drop reordering variables
let dragSrcIndex = null; // Index of dragged item

// Declare mammoth variable
const mammoth = window.mammoth;

// ... rest of your code ...

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

        // Drag-and-drop reordering
        item.setAttribute('draggable', 'true');
        item.dataset.index = index;

        // Drag events
        item.addEventListener('dragstart', (e) => {
            dragSrcIndex = index;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        item.addEventListener('dragend', () => {
            dragSrcIndex = null;
            item.classList.remove('dragging');
        });
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            item.classList.add('drag-over');
        });
        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            if (dragSrcIndex !== null && dragSrcIndex !== index) {
                movePlaylistItem(dragSrcIndex, index);
            }
        });

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

// Move playlist item from oldIndex to newIndex and re-render
function movePlaylistItem(oldIndex, newIndex) {
    if (oldIndex < 0 || oldIndex >= playlist.length || newIndex < 0 || newIndex >= playlist.length) return;
    // Remove the item and insert it at newIndex
    const [movedItem] = playlist.splice(oldIndex, 1);
    playlist.splice(newIndex, 0, movedItem);

    // Update currentTrackIndex if needed
    if (currentTrackIndex === oldIndex) {
        currentTrackIndex = newIndex;
    } else if (currentTrackIndex > oldIndex && currentTrackIndex <= newIndex) {
        currentTrackIndex -= 1;
    } else if (currentTrackIndex < oldIndex && currentTrackIndex >= newIndex) {
        currentTrackIndex += 1;
    }

    renderPlaylist();
}

// ... rest of your code ...
