import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/health")
      .then((response) => response.json())
      .then((data) => {
        setStatus(data.message);
      })
      .catch(() => {
        setStatus("Backend connection failed");
      });
  }, []);

  return (
    <div>
      <h1>Dayflow</h1>
      <p>Human Resource Management System</p>

      <hr />

      <h2>System Status</h2>
      <p>{status}</p>
    </div>
  );
}

export default App;