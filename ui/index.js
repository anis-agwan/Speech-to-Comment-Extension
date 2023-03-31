var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

const socket = new WebSocket("ws://localhost:9001");
const recognition = new SpeechRecognition();
const outputEl = document.getElementById("output");

recognition.continuous = true;
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

recognition.addEventListener("result", (e) => {
  const result = e.results[e.resultIndex][0].transcript.trim();
  addPhrase(result);
});

socket.addEventListener("open", () => {
  recognition.start();

  document.getElementById("phraseForm").addEventListener("submit", (e) => {
    e.prevenDefault();
    addPhrase(document.getElementById("phrase").value);
    // console.log(phrase);
  });
});

const addPhrase = (phrase) => {
  socket.send(phrase);
  outputEl.innerHTML += `<li>${phrase}</li>`;
};
