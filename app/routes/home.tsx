import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div>
      <Welcome />
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <a 
          href="/users" 
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#4caf50",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
            fontWeight: "bold"
          }}
        >
          Go to Users Management
        </a>
      </div>
    </div>
  );
}
