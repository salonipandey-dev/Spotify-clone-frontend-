"use strict";
const $ = (selector) => document.querySelector(selector);
const catalog = [
  {
    id: "mahiye",
    title: "Mahiye Jinna Sohna",
    artist: "Darshan Raval",
    image: "picturs/card2img.jpeg",
    type: "songs",
  },
  {
    id: "mere",
    title: "Mere Paas Tum Ho",
    artist: "Rahat Fateh Ali Khan",
    image: "picturs/card3img.jpeg",
    type: "songs",
  },
  {
    id: "naa",
    title: "Naa Ready",
    artist: "Anirudh Ravichander · Vijay",
    image: "picturs/card4img.jpeg",
    type: "songs",
  },
  {
    id: "global",
    title: "Top 50 · Global",
    artist: "The world’s favourites, all together.",
    image: "picturs/card1img.jpeg",
    type: "charts",
  },
  {
    id: "top-global",
    title: "Top Songs · Global",
    artist: "A little inspiration from everywhere.",
    image: "picturs/card5img.jpeg",
    type: "charts",
  },
  {
    id: "top-india",
    title: "Top Songs · India",
    artist: "Big sounds. Closer to home.",
    image: "picturs/card6img.jpeg",
    type: "charts",
  },
];
const audio = $("#audio");
let tracks = [...catalog],
  view = "all",
  filter = "all",
  current = null,
  shuffled = false;
let toastTimer,
  playRequest = 0;
let likes = new Set();
try {
  const saved = JSON.parse(localStorage.getItem("spotify-clone-likes") || "[]");
  if (Array.isArray(saved))
    likes = new Set(saved.filter((id) => typeof id === "string"));
} catch {
  /* Storage can be unavailable; favourites still work for this session. */
}
audio.volume = Number($("#volume").value);
function notify(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 4200);
}
function saveLikes() {
  try {
    localStorage.setItem("spotify-clone-likes", JSON.stringify([...likes]));
  } catch {
    notify("Favourites are available for this session only.");
  }
}
function toggleLike(id) {
  likes.has(id) ? likes.delete(id) : likes.add(id);
  saveLikes();
  render();
  updatePlayer();
}
function render() {
  const query = $("#search").value.trim().toLocaleLowerCase();
  const visible = tracks.filter(
    (track) =>
      (view !== "liked" || likes.has(track.id)) &&
      (view !== "local" || track.type === "local") &&
      (filter === "all" || track.type === filter) &&
      `${track.title} ${track.artist}`.toLocaleLowerCase().includes(query),
  );
  $("#collection-title").textContent = query
    ? "Search results"
    : view === "liked"
      ? "Your liked tracks"
      : view === "local"
        ? "Your local collection"
        : "Made for your rotation";
  $("#result-count").textContent =
    `${visible.length} ${visible.length === 1 ? "item" : "items"}`;
  $("#liked-count").textContent = tracks.filter((track) =>
    likes.has(track.id),
  ).length;
  const localCount = tracks.filter((track) => track.type === "local").length;
  $("#local-count").textContent = localCount
    ? `${localCount} imported ${localCount === 1 ? "track" : "tracks"}`
    : "Your music, your space";
  $("#cards").replaceChildren();
  for (const track of visible) {
    const card = document.createElement("article");
    card.className = "card";
    // Only static markup is inserted as HTML. Track names, including filenames, use textContent.
    card.innerHTML =
      '<button class="cover-button"><img loading="lazy" alt=""><span class="cover-play" aria-hidden="true">▶</span></button><h3></h3><p></p><div class="card-bottom"><span class="card-tag"></span><button class="icon-button">♡</button></div>';
    card.querySelector("img").src = track.image;
    card.querySelector("h3").textContent = track.title;
    card.querySelector("h3").title = track.title;
    card.querySelector("p").textContent = track.artist;
    card.querySelector(".card-tag").textContent =
      track.type === "local"
        ? "LOCAL AUDIO"
        : track.type === "charts"
          ? "CHART PREVIEW"
          : "CATALOGUE PREVIEW";
    const select = card.querySelector(".cover-button");
    select.setAttribute(
      "aria-label",
      `${track.src ? "Play" : "Preview"} ${track.title}`,
    );
    select.addEventListener("click", () => selectTrack(track));
    const like = card.querySelector(".icon-button");
    like.textContent = likes.has(track.id) ? "♥" : "♡";
    like.setAttribute(
      "aria-label",
      `${likes.has(track.id) ? "Unlike" : "Like"} ${track.title}`,
    );
    like.setAttribute("aria-pressed", String(likes.has(track.id)));
    like.addEventListener("click", () => toggleLike(track.id));
    $("#cards").append(card);
  }
  $("#empty").hidden = visible.length > 0;
  const needsImport = !query && (view === "local" || filter === "local");
  $("#empty-title").textContent = query
    ? "No matches yet"
    : needsImport
      ? "Your collection starts here"
      : "A little quiet in here";
  $("#empty-description").textContent = query
    ? "Try another track or artist."
    : needsImport
      ? "Choose audio files from your device to start listening."
      : "Tap a heart on a card to save a favourite, or try another filter.";
  $("#empty-action").textContent = needsImport
    ? "Add your music"
    : "Show all music";
  $("#empty-action").onclick = () =>
    needsImport ? $("#audio-files").click() : setView("all");
}
function setView(nextView) {
  view = nextView;
  filter = "all";
  $("#search").value = "";
  document.querySelectorAll("[data-view]").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  updateFilters();
  render();
}
function updateFilters() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.filter === filter),
    );
  });
}
function updatePlayer() {
  $("#play").textContent = audio.paused ? "▶" : "Ⅱ";
  $("#play").setAttribute("aria-label", audio.paused ? "Play" : "Pause");
  $("#player-like").disabled = !current;
  $("#player-like").textContent = current && likes.has(current.id) ? "♥" : "♡";
  $("#player-like").setAttribute(
    "aria-pressed",
    String(!!current && likes.has(current.id)),
  );
  if (current) {
    $("#player-title").textContent = current.title;
    $("#player-artist").textContent = current.src
      ? current.artist
      : "Preview only · no audio included";
    $("#player-art").src = current.image;
  }
}
function time(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}
function updateTime() {
  const ready = Number.isFinite(audio.duration) && audio.duration > 0;
  $("#elapsed").textContent = time(audio.currentTime);
  $("#duration").textContent = ready ? time(audio.duration) : "0:00";
  $("#seek").disabled = !ready;
  $("#seek").max = ready ? audio.duration : 100;
  $("#seek").value = ready ? audio.currentTime : 0;
  $("#seek").setAttribute(
    "aria-valuetext",
    `${time(audio.currentTime)} of ${ready ? time(audio.duration) : "0:00"}`,
  );
}
async function startPlayback() {
  const request = ++playRequest;
  try {
    await audio.play();
  } catch (error) {
    if (request === playRequest && error.name !== "AbortError")
      notify("This file could not play. Try an MP3, WAV or OGG file.");
  }
  updatePlayer();
}
function selectTrack(track) {
  playRequest++;
  audio.pause();
  current = track;
  audio.removeAttribute("src");
  audio.load();
  if (track.src) {
    audio.src = track.src;
    startPlayback();
  } else notify("Catalogue preview only. Add your own audio files to listen.");
  updatePlayer();
  updateTime();
  renderQueue();
}
function togglePlayback() {
  if (!current?.src) {
    const first = tracks.find((track) => track.src);
    if (first) selectTrack(first);
    else {
      notify("Choose an audio file to start listening.");
      $("#audio-files").click();
    }
  } else if (audio.paused) startPlayback();
  else {
    playRequest++;
    audio.pause();
  }
}
function advance(direction) {
  const queue = tracks.filter((track) => track.src);
  if (!queue.length) {
    notify("Add local audio to build your playback queue.");
    return;
  }
  const index = queue.findIndex((track) => track.id === current?.id);
  let next = index < 0 ? 0 : (index + direction + queue.length) % queue.length;
  if (shuffled && queue.length > 1 && index >= 0)
    next =
      (index + 1 + Math.floor(Math.random() * (queue.length - 1))) %
      queue.length;
  selectTrack(queue[next]);
}
function renderQueue() {
  $("#queue-list").replaceChildren();
  const queue = tracks.filter((track) => track.src);
  if (!queue.length) {
    const p = document.createElement("p");
    p.textContent =
      "No audio yet. Add music from your device to build your queue.";
    $("#queue-list").append(p);
  }
  queue.forEach((track, index) => {
    const button = document.createElement("button");
    button.className = `queue-track${track.id === current?.id ? " active" : ""}`;
    button.textContent = `${index + 1}. ${track.title}`;
    button.addEventListener("click", () => selectTrack(track));
    $("#queue-list").append(button);
  });
}
document
  .querySelectorAll("[data-view]")
  .forEach((button) =>
    button.addEventListener("click", () => setView(button.dataset.view)),
  );
document.querySelectorAll("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    filter = button.dataset.filter;
    updateFilters();
    render();
  }),
);
$("#search").addEventListener("input", render);
$("#search-nav").addEventListener("click", () => {
  setView("all");
  $("#search").focus();
});
$("#explore").addEventListener("click", () => {
  setView("all");
  $("#collection").scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
});
document
  .querySelectorAll("[data-import]")
  .forEach((button) =>
    button.addEventListener("click", () => $("#audio-files").click()),
  );
$("#audio-files").addEventListener("change", (event) => {
  let added = 0;
  for (const file of event.target.files) {
    if (
      !file.type.startsWith("audio/") &&
      !/\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name)
    )
      continue;
    const id = `local:${file.name}:${file.size}:${file.lastModified}`;
    if (tracks.some((track) => track.id === id)) continue;
    tracks.push({
      id,
      title: file.name.replace(/\.[^.]+$/, ""),
      artist: "Local audio · on your device",
      image: "picturs/card1img.jpeg",
      type: "local",
      src: URL.createObjectURL(file),
    });
    added++;
  }
  event.target.value = "";
  setView("local");
  renderQueue();
  notify(
    added
      ? `${added} ${added === 1 ? "track" : "tracks"} added. Select a track to play.`
      : "No new audio added. Choose supported files not already in your collection.",
  );
});
$("#play").addEventListener("click", togglePlayback);
$("#previous").addEventListener("click", () => advance(-1));
$("#next").addEventListener("click", () => advance(1));
$("#player-like").addEventListener("click", () => {
  if (current) toggleLike(current.id);
});
$("#shuffle").addEventListener("click", () => {
  shuffled = !shuffled;
  $("#shuffle").setAttribute("aria-pressed", String(shuffled));
});
$("#repeat").addEventListener("click", () => {
  audio.loop = !audio.loop;
  $("#repeat").setAttribute("aria-pressed", String(audio.loop));
});
$("#seek").addEventListener("input", () => {
  if (Number.isFinite(audio.duration))
    audio.currentTime = Number($("#seek").value);
});
$("#volume").addEventListener("input", () => {
  audio.volume = Number($("#volume").value);
  audio.muted = false;
});
$("#mute").addEventListener("click", () => {
  if (audio.volume === 0) {
    audio.volume = 0.7;
    $("#volume").value = "0.7";
    audio.muted = false;
  } else audio.muted = !audio.muted;
});
audio.addEventListener("volumechange", () => {
  const muted = audio.muted || audio.volume === 0;
  $("#mute").setAttribute("aria-pressed", String(muted));
  $("#mute").setAttribute("aria-label", muted ? "Unmute" : "Mute");
});
["play", "pause", "ended"].forEach((name) =>
  audio.addEventListener(name, updatePlayer),
);
["timeupdate", "loadedmetadata", "emptied", "durationchange"].forEach((name) =>
  audio.addEventListener(name, updateTime),
);
audio.addEventListener("ended", () => {
  if (!audio.loop) advance(1);
});
audio.addEventListener("error", () =>
  notify("Your browser cannot play this file. Try an MP3, WAV or OGG file."),
);
$("#queue-button").addEventListener("click", () => {
  renderQueue();
  $("#queue-dialog").showModal();
});
$("#close-queue").addEventListener("click", () => $("#queue-dialog").close());
document.addEventListener("keydown", (event) => {
  if (
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.target.closest("input, textarea, button, a, [contenteditable]") ||
    $("#queue-dialog").open
  )
    return;
  if (event.key === "/") {
    event.preventDefault();
    $("#search").focus();
  }
  if (event.code === "Space") {
    event.preventDefault();
    togglePlayback();
  }
});
render();
updatePlayer();
