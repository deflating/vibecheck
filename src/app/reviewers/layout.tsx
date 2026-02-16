import { getCurrentUser } from "@/lib/auth";
import { Nav } from "@/components/nav";

export default async function ReviewersLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <>
      <Nav user={user} />
      {children}
    </>
  );
}
