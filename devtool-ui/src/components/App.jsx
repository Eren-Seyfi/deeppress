// src/components/App.jsx
import { useDevtool } from "../hooks/useDevtool";

function App() {
  const { registry, isReady } = useDevtool();

  if (!isReady) return <h2>🕓 DevTool yükleniyor...</h2>;

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>🚀 DevTool UI</h1>

      <h2>📁 Route Listesi</h2>
      {registry.groups.map((group, i) => (
        <div key={i}>
          <h3>{group.basePath}</h3>
          {group.routes.map((r, j) => (
            <div key={j}>
              🔹 <strong>{r.method}</strong> {r.fullPath}
            </div>
          ))}
        </div>
      ))}

      <h2>🧠 Controllers</h2>
      {Object.keys(registry.controllers).map((key) => (
        <div key={key}>• {key}</div>
      ))}

      <h2>🧱 Middlewares</h2>
      {Object.keys(registry.middlewares).map((key) => (
        <div key={key}>• {key}</div>
      ))}

      <h2>✅ Validations</h2>
      {Object.keys(registry.validations).map((key) => (
        <div key={key}>• {key}</div>
      ))}
    </div>
  );
}

export default App;
