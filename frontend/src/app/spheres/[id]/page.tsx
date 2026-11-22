import { SpherePage } from "@/components/pages/SpherePage/SpherePage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SpherePage sphereId={id} />;
}
