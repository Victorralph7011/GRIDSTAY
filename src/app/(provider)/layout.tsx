export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="provider-portal">{children}</div>;
}
