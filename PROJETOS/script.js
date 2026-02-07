const inputTexto = document.querySelector(".input-texto");
const seletor = document.querySelector(".idioma");
const resultado = document.querySelector(".traducao");
const btnTraduzir = document.getElementById("btn-traduzir");
const btnMicro = document.getElementById("btn-micro");

btnTraduzir.addEventListener("click", traduzir);
inputTexto.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    traduzir();
  }
});

async function traduzir() {
  const texto = inputTexto.value.trim();
  if (!texto) {
    resultado.textContent = "Por favor, digite algo para traduzir...";
    return;
  }
  const target = seletor.value;
  resultado.textContent = "Traduzindo...";

  try {
    const resp = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: texto, source: "auto", target: target, format: "text" })
    });
    if (!resp.ok) throw new Error("LibreTranslate retornou erro");
    const data = await resp.json();
    if (data && data.translatedText) {
      resultado.textContent = data.translatedText;
      return;
    }
    throw new Error("Resposta inválida do LibreTranslate");
  } catch (err) {
    console.warn("LibreTranslate falhou, tentando fallback MyMemory:", err);
    try {
      const mmUrl = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(texto) + "&langpair=pt|" + target;
      const mmResp = await fetch(mmUrl);
      const mmData = await mmResp.json();
      if (mmData && mmData.responseData && mmData.responseData.translatedText) {
        resultado.textContent = mmData.responseData.translatedText;
        return;
      } else {
        resultado.textContent = "Erro ao obter tradução (fallback).";
      }
    } catch (err2) {
      console.error(err2);
      resultado.textContent = "Erro ao conectar com serviço de tradução.";
    }
  }
}


if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  btnMicro.addEventListener("click", () => {
    
    if (location.protocol !== "https:" && location.hostname !== "localhost") {
      alert("Reconhecimento de voz requer HTTPS ou localhost. Use um servidor local (veja instruções).");
      return;
    }
    recognition.start();
  });

  recognition.addEventListener("start", () => {
    btnMicro.classList.add("listening");
  });

  recognition.addEventListener("end", () => {
    btnMicro.classList.remove("listening");
  });

  recognition.addEventListener("result", (e) => {
    const textoFalado = Array.from(e.results).map(r => r[0].transcript).join("");
    inputTexto.value = textoFalado;
    traduzir();
  });

  recognition.addEventListener("error", (e) => {
    console.error("Recognition error:", e);
    alert("Erro no reconhecimento de voz: " + e.error);
  });
} else {
 
  if (btnMicro) btnMicro.style.display = "none";
}