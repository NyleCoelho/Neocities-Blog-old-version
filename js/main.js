// ========================================================
// EMOTE AND CHAT SYSTEM (Safe Version)
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
    const EMOTE_MAP = {
        ":aradia:": "assets/emotes/aradia.gif",
        ":dave:": "assets/emotes/dave.gif",
        ":eridan:": "assets/emotes/eridan.gif",
        ":feferi:": "assets/emotes/feferi.gif",
        ":gamzee:": "assets/emotes/gamzee.gif",
        ":jade:": "assets/emotes/jade.gif",
        ":kanaya:": "assets/emotes/kanaya.gif",
        ":sollux:": "assets/emotes/sollux.gif",
        ":vriska:": "assets/emotes/vriska.gif"
    };

    const form = document.getElementById('comment-form');
    const commentsContainer = document.getElementById('comments-container');
    const commentTextInput = document.getElementById('comment-text');
    const usernameInput = document.getElementById('username');
    const emoteButtons = document.querySelectorAll('#emote-bar .emote-button-img');

    // ========================================================
    // SECURITY SETTINGS
    // ========================================================
    const SPAM_DELAY = 4000; // minimum time (ms) between messages
    let lastMessageTime = 0;

// Função para detectar palavras ofensivas (case insensitive)
function containsBadWords(text) {
    const lowerText = text.toLowerCase();
    return BAD_WORDS.some(word => {
        // Busca por palavras inteiras para evitar falsos positivos
        const regex = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
        return regex.test(lowerText);
    });
}

    function hasBadWords(text) {
        const lowered = text.toLowerCase();
        return BAD_WORDS.some(word => lowered.includes(word));
    }

    function showPopup(message) {
        alert(message);
    }

    // ========================================================
    // COMMENT FUNCTIONS
    // ========================================================
    function loadComments() {
        const storedComments = localStorage.getItem('guestBookComments');
        return storedComments ? JSON.parse(storedComments) : [];
    }

    function saveComments(comments) {
        localStorage.setItem('guestBookComments', JSON.stringify(comments));
    }

    function convertTextToHtml(text) {
        const regex = new RegExp(
            Object.keys(EMOTE_MAP)
                .map(key => key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
                .join('|'),
            'g'
        );

        let html = text.replace(regex, match => 
            `<img src="${EMOTE_MAP[match]}" alt="${match}" class="emote-image">`
        );
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    function renderComment(comment) {
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');
        commentDiv.innerHTML = `
            <span class="comment-username">${comment.username}:</span>
            <span class="comment-text">${convertTextToHtml(comment.text)}</span>
        `;
        commentsContainer.appendChild(commentDiv);
        commentsContainer.scrollTop = commentsContainer.scrollHeight;
    }

    // Load existing comments
    loadComments().forEach(renderComment);

    // ========================================================
    // EMOTE INSERTION
    // ========================================================
    emoteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const emoteCode = button.getAttribute('data-emote-code');
            const start = commentTextInput.selectionStart;
            const end = commentTextInput.selectionEnd;
            const currentText = commentTextInput.value;
            const insertText = emoteCode + ' ';
            commentTextInput.value = currentText.substring(0, start) + insertText + currentText.substring(end);
            commentTextInput.focus();
            commentTextInput.selectionEnd = start + insertText.length;
        });
    });

    // ========================================================
    // COMMENT SUBMISSION WITH FILTERS
    // ========================================================

    const BAD_WORDS = window.BAD_WORDS || [];  
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const now = Date.now();
        const username = usernameInput.value.trim() || 'Anonymous';
        const text = commentTextInput.value.trim();

        // anti-spam protection
        if (now - lastMessageTime < SPAM_DELAY) {
            showPopup("You are sending messages too quickly! Please wait a few seconds before sending another one.");
            return;
        }

        // ⚠️ CORRIGIDO: usar hasBadWords (não containsBadWords)
        if (hasBadWords(text)) {
            showPopup("Your message contains offensive words and cannot be sent.");
            return;
        }

        // empty message check
        if (!text) return;

        const comments = loadComments();
        comments.push({ username, text });

        const MAX_COMMENTS = 25;
        if (comments.length > MAX_COMMENTS) comments.splice(0, comments.length - MAX_COMMENTS);

        saveComments(comments);
        renderComment({ username, text });
        commentTextInput.value = '';

        lastMessageTime = now;
    });

});


// ========================================================
// AUDIO PLAYER
// ========================================================
const tracks = [
    {title: "E.T.", artist: "by Toy Box", src: "assets/Songs/Toy-Box - E.T. (Official Audio) [We1uYIQhk2A].mp3", cover: "assets/album-cover.png"},
    {title: "Neon Nights", artist: "Nyle", src: "assets/music/song2.mp3", cover: "assets/album2.png"},
    {title: "Retro Vibes", artist: "Nyle", src: "assets/music/song3.mp3", cover: "assets/album3.png"}
];

let currentTrack = 0;
const audio = new Audio(tracks[currentTrack].src);

const albumCover = document.querySelector('.album-cover');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progress = document.getElementById('progress');

function loadTrack(index) {
    audio.src = tracks[index].src;
    albumCover.src = tracks[index].cover;
    trackTitle.textContent = tracks[index].title;
    trackArtist.textContent = tracks[index].artist;
    progress.value = 0;
}

playBtn.addEventListener('click', () => {
    if(audio.paused){
        audio.play();
        playBtn.textContent = "⏸";
    } else {
        audio.pause();
        playBtn.textContent = "▶";
    }
});

prevBtn.addEventListener('click', () => {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrack);
    audio.play();
    playBtn.textContent = "⏸";
});

nextBtn.addEventListener('click', () => {
    currentTrack = (currentTrack + 1) % tracks.length;
    loadTrack(currentTrack);
    audio.play();
    playBtn.textContent = "⏸";
});

audio.addEventListener('timeupdate', () => {
    const percent = (audio.currentTime / audio.duration) * 100 || 0;
    progress.value = percent;
    progress.style.background = `linear-gradient(to right, #ff71ff ${percent}%, #222 ${percent}%)`;
});

progress.addEventListener('input', () => {
    audio.currentTime = (progress.value / 100) * audio.duration;
    progress.style.background = `linear-gradient(to right, #ff71ff ${progress.value}%, #222 ${progress.value}%)`;
});

loadTrack(currentTrack);

// ========================================================
// SCROLLING TRACK BADGE
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".badge-track");
    if (!track) return;
    const clone = track.innerHTML;
    track.innerHTML += clone;
    const totalWidth = track.scrollWidth / 2;
    const speed = 50;
    const duration = totalWidth / speed;
    track.style.animationDuration = `${duration}s`;
});

// ========================================================
// PONY ANIMATION
// ========================================================
const ponei = document.getElementById("ponei");
let animacaoAtual = "idle";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const imgIdle = new Image();
imgIdle.src = "assets/ponytown/ponei_idle.gif";
imgIdle.crossOrigin = "anonymous";
imgIdle.onload = () => {
    canvas.width = imgIdle.width;
    canvas.height = imgIdle.height;
    ctx.drawImage(imgIdle, 0, 0);
};

function trocarAnimacao(nova) {
    if (animacaoAtual === nova) return;
    animacaoAtual = nova;
    ponei.src = nova === "pet" ? "assets/ponytown/pet.gif" : "assets/ponytown/ponei_idle.gif";
}

ponei.addEventListener("mousemove", (e) => {
    const rect = ponei.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = imgIdle.width / rect.width;
    const scaleY = imgIdle.height / rect.height;
    const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
    const alpha = pixel[3];
    if (alpha > 10) trocarAnimacao("pet");
    else trocarAnimacao("idle");
});

ponei.addEventListener("mouseleave", () => {
    trocarAnimacao("idle");
});




document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("guestbook-form");
  const entriesList = document.getElementById("guestbook-entries");
  const alreadySignedMessage = document.getElementById("already-signed-message");

  // Load existing guestbook entries
  function loadEntries() {
    return JSON.parse(localStorage.getItem("guestbook_entries")) || [];
  }

  // Save entries
  function saveEntries(entries) {
    localStorage.setItem("guestbook_entries", JSON.stringify(entries));
  }

  // Render all entries
  function renderEntries() {
    entriesList.innerHTML = "";
    const entries = loadEntries();
    entries.forEach((entry) => {
      const li = document.createElement("li");
      li.classList.add("guestbook-entry");

      const user = document.createElement("strong");
      user.textContent = entry.name;

      const message = document.createElement("p");
      message.textContent = entry.message;

      const website = document.createElement("a");
      if (entry.url) {
        website.href = entry.url;
        website.target = "_blank";
        website.textContent = entry.url;
      }

      li.appendChild(user);
      li.appendChild(message);
      if (entry.url) li.appendChild(website);

      entriesList.appendChild(li);
    });
  }

  // Check if user already signed
  function checkIfSigned() {
    const hasSigned = localStorage.getItem("guestbook_signed");
    if (hasSigned) {
      form.querySelector(".submit-button").disabled = true;
      alreadySignedMessage.textContent = "You’ve already signed the guest book!";
    }
  }

  // Handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Check again in case they bypassed it
    if (localStorage.getItem("guestbook_signed")) return;

    const name = document.getElementById("gb_name").value.trim();
    const message = document.getElementById("gb_message").value.trim();
    const url = document.getElementById("gb_url").value.trim();

    if (!name || !message) return;

    const entries = loadEntries();
    entries.push({ name, message, url });
    saveEntries(entries);
    renderEntries();

    // Mark user as signed
    localStorage.setItem("guestbook_signed", "true");
    form.querySelector(".submit-button").disabled = true;
    alreadySignedMessage.textContent = "You’ve already signed the guest book!";

    form.reset();
  });

  renderEntries();
  checkIfSigned();
});
