import { HostDispatcher } from "./host-dispatcher";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function HostPage({ params }: PageProps) {
  const { code } = await params;
  return <HostDispatcher code={code} />;
}
