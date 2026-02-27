import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { SmoothScrollProvider } from "./components/SmoothScrollProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <SmoothScrollProvider>
        <App />
    </SmoothScrollProvider>
);
