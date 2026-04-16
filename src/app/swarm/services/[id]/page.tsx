import { ServiceDetailScreen } from "@/modules/swarm/screens/ServiceDetailScreen";

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ServiceDetailScreen serviceId={id} />;
}
