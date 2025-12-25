import { createRoot } from "react-dom/client";
import "./index.css";

// Simple test to verify React is working
function TestApp() {
    return (
        <div style={{ padding: '50px', fontFamily: 'Arial' }}>
            <h1 style={{ color: 'red' }}>🔥 REACT IS WORKING! 🔥</h1>
            <p>If you see this, React is rendering correctly.</p>
            <p>The white page issue is in App.tsx imports.</p>
            <button onClick={() => alert('Button works!')}>Test Click</button>
        </div>
    );
}

createRoot(document.getElementById("root")!).render(
    <TestApp />
);
