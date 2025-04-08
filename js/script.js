// Global variables for the playlist
let playlist = [];
let currentTrackIndex = 0;
const audioPlayer = document.getElementById('audioPlayer');
const playlistElement = document.getElementById('playlist');
const nowPlayingElement = document.getElementById('nowPlaying');
const textContent = document.getElementById('textContent');
const statusElement = document.getElementById('docStatus');
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');

// Auto-load document when selected
document.getElementById('docFile').addEventListener('change', function(e) {
    if (this.files.length === 0) {
        statusElement.textContent = 'No file selected.';
        return;
    }
    
    const file = this.files[0];
    statusElement.innerHTML = '<span class="loading">Loading document...</span>';
    
    if (file.name.toLowerCase().endsWith('.txt')) {
        // Handle text files
        readTextFile(file);
    } else if (file.name.toLowerCase().endsWith('.docx')) {
        // Handle DOCX files
        readDocxFile(file);
    } else {
        statusElement.textContent = 'Unsupported file format. Please select a .txt or .docx file.';
    }
});

// Function to read text file
function readTextFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // For text files, we need to preserve line breaks
        textContent.innerHTML = '';
        const pre = document.createElement('pre');
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.fontFamily = 'inherit';
        pre.textContent = e.target.result;
        textContent.appendChild(pre);
        statusElement.textContent = 'Text file imported successfully!';
    };
    
    reader.onerror = function() {
        statusElement.textContent = 'Error reading file!';
    };
    
    reader.readAsText(file);
}

// Function to read DOCX file
function readDocxFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // Use mammoth.js to convert DOCX to HTML
        mammoth.convertToHtml({ arrayBuffer: e.target.result })
            .then(function(result) {
                textContent.innerHTML = result.value;
                
                // Log any warnings
                if (result.messages.length > 0) {
                    console.log("Warnings:", result.messages);
                }
                
                statusElement.textContent = 'DOCX file imported successfully!';
            })
            .catch(function(error) {
                console.error(error);
                statusElement.textContent = 'Error parsing DOCX file: ' + error.message;
            });
    };
    
    reader.onerror = function() {
        statusElement.textContent = 'Error reading file!';
    };
    
    reader.readAsArrayBuffer(file);
}

// Auto-load audio files when selected
document.getElementById('audioFile').addEventListener('change', function(e) {
    const files = e.target.files;
    const audioStatusElement = document.getElementById('audioStatus');
    
    if (files.length === 0) {
        audioStatusElement.textContent = 'No files selected.';
        return;
    }
    
    // Clear previous playlist
    playlist = [];
    playlistElement.innerHTML = '';
    
    // Add each file to the playlist
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Only add audio files
        if (file.type.startsWith('audio/')) {
            const audioURL = URL.createObjectURL(file);
            playlist.push({
                name: file.name,
                url: audioURL
            });
            
            // Create playlist item
            addSongToPlaylistUI(playlist.length - 1);
        }
    }
    
    audioStatusElement.textContent = `Loaded ${playlist.length} audio files.`;
    
    // Play the first song if there are any
    if (playlist.length > 0) {
        currentTrackIndex = 0;
        playSong(currentTrackIndex);
    }
    
    // Reset select all checkbox
    document.getElementById('selectAll').checked = false;
    updateDeleteSelectedButton();
});

// Function to add a song to the playlist UI
function addSongToPlaylistUI(index) {
    const playlistItem = document.createElement('div');
    playlistItem.className = 'playlist-item';
    playlistItem.dataset.index = index;
    
    // Create checkbox for selection
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'song-checkbox';
    checkbox.onchange = updateDeleteSelectedButton;
    
    // Create song title element
    const songTitle = document.createElement('span');
    songTitle.className = 'song-title';
    songTitle.textContent = playlist[index].name;
    songTitle.onclick = function() {
        currentTrackIndex = parseInt(playlistItem.dataset.index);
        playSong(currentTrackIndex);
    };
    
    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = function(e) {
        e.stopPropagation();
        deleteSong(parseInt(playlistItem.dataset.index));
    };
    
    // Add elements to playlist item
    playlistItem.appendChild(checkbox);
    playlistItem.appendChild(songTitle);
    playlistItem.appendChild(deleteBtn);
    
    playlistElement.appendChild(playlistItem);
}

// Function to play a song by index
function playSong(index) {
    if (index >= 0 && index < playlist.length) {
        // Update the audio source
        audioPlayer.src = playlist[index].url;
        audioPlayer.play();
        
        // Update now playing text
        nowPlayingElement.textContent = `Now Playing: ${playlist[index].name}`;
        
        // Update active class in playlist
        const playlistItems = document.querySelectorAll('.playlist-item');
        playlistItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Find the item with the matching index
        const activeItem = document.querySelector(`.playlist-item[data-index="${index}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            // Scroll to the active item
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

// Play next song
function playNext() {
    if (playlist.length === 0) return;
    
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    playSong(currentTrackIndex);
}

// Play previous song
function playPrevious() {
    if (playlist.length === 0) return;
    
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    playSong(currentTrackIndex);
}

// Delete a song from the playlist
function deleteSong(index) {
    // Check if the song to delete is currently playing
    const isCurrentSong = index === currentTrackIndex;
    
    // Remove the song from the playlist array
    playlist.splice(index, 1);
    
    // Rebuild the playlist UI to update indices
    rebuildPlaylistUI();
    
    // Update the audio status
    document.getElementById('audioStatus').textContent = `Playlist updated. ${playlist.length} songs remaining.`;
    
    // Handle the currently playing song
    if (playlist.length === 0) {
        // No songs left
        audioPlayer.pause();
        audioPlayer.src = '';
        nowPlayingElement.textContent = 'No song selected';
        currentTrackIndex = 0;
    } else if (isCurrentSong) {
        // If we deleted the current song, play the next one
        // (which now has the same index since we removed the current one)
        if (currentTrackIndex >= playlist.length) {
            currentTrackIndex = 0;
        }
        playSong(currentTrackIndex);
    } else if (index < currentTrackIndex) {
        // If we deleted a song before the current one, adjust the current index
        currentTrackIndex--;
    }
    
    // Reset select all checkbox
    document.getElementById('selectAll').checked = false;
    updateDeleteSelectedButton();
}

// Delete selected songs
function deleteSelected() {
    const checkboxes = document.querySelectorAll('.song-checkbox:checked');
    if (checkboxes.length === 0) return;
    
    // Get indices of songs to delete (in descending order to avoid index shifting)
    const indicesToDelete = Array.from(checkboxes)
        .map(checkbox => parseInt(checkbox.closest('.playlist-item').dataset.index))
        .sort((a, b) => b - a); // Sort in descending order
    
    // Track if current song will be deleted
    const willDeleteCurrentSong = indicesToDelete.includes(currentTrackIndex);
    
    // Delete songs from playlist array
    for (const index of indicesToDelete) {
        playlist.splice(index, 1);
        
        // Adjust currentTrackIndex if needed
        if (index < currentTrackIndex) {
            currentTrackIndex--;
        }
    }
    
    // Rebuild the playlist UI
    rebuildPlaylistUI();
    
    // Update the audio status
    document.getElementById('audioStatus').textContent = `Deleted ${indicesToDelete.length} songs. ${playlist.length} songs remaining.`;
    
    // Handle playback if current song was deleted
    if (playlist.length === 0) {
        // No songs left
        audioPlayer.pause();
        audioPlayer.src = '';
        nowPlayingElement.textContent = 'No song selected';
        currentTrackIndex = 0;
    } else if (willDeleteCurrentSong) {
        // If we deleted the current song, play the first one
        currentTrackIndex = 0;
        playSong(currentTrackIndex);
    } else if (currentTrackIndex >= playlist.length) {
        // If current index is now out of bounds
        currentTrackIndex = 0;
        playSong(currentTrackIndex);
    }
    
    // Reset select all checkbox
    document.getElementById('selectAll').checked = false;
    updateDeleteSelectedButton();
}

// Rebuild the playlist UI
function rebuildPlaylistUI() {
    playlistElement.innerHTML = '';
    
    for (let i = 0; i < playlist.length; i++) {
        addSongToPlaylistUI(i);
    }
    
    // Re-highlight the current song
    if (playlist.length > 0 && currentTrackIndex < playlist.length) {
        const activeItem = document.querySelector(`.playlist-item[data-index="${currentTrackIndex}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
}

// Toggle select all checkbox
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll').checked;
    const checkboxes = document.querySelectorAll('.song-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll;
    });
    
    updateDeleteSelectedButton();
}

// Update delete selected button state
function updateDeleteSelectedButton() {
    const checkboxes = document.querySelectorAll('.song-checkbox:checked');
    deleteSelectedBtn.disabled = checkboxes.length === 0;
    
    if (checkboxes.length > 0) {
        deleteSelectedBtn.textContent = `Delete Selected (${checkboxes.length})`;
    } else {
        deleteSelectedBtn.textContent = 'Delete Selected';
    }
}

// Auto-play next song when current one ends
audioPlayer.addEventListener('ended', playNext);