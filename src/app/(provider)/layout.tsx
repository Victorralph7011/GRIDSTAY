import RoleGuard from "@/components/auth/RoleGuard";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allow={["provider"]}>
      <div className="provider-portal">{children}</div>
    </RoleGuard>
  );
}
