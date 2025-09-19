import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Registrar o service worker para PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registrado com sucesso:", registration);
      })
      .catch((error) => {
        console.log("Falha ao registrar o Service Worker:", error);
      });
  });
}

// Lógica para exibir botão de instalação do PWA
let deferredPrompt: any = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById("pwa-install-btn");
  const info = document.getElementById("pwa-install-info");
  if (btn) {
    btn.style.display = "inline-block";
    btn.onclick = () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          if (info) info.textContent = "App instalado com sucesso!";
        } else {
          if (info) info.textContent = "Instalação do app cancelada.";
        }
        btn.style.display = "none";
        deferredPrompt = null;
      });
    };
    if (info)
      info.textContent =
        "Clique em Instalar App para adicionar o ZoePlanner à sua tela inicial.";
  }
});
