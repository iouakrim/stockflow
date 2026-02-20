import { redirect } from "next/navigation";

export default function Home() {
  // For MVP, redirect to dashboard. Later this can be a landing page.
  redirect("/dashboard");
}
