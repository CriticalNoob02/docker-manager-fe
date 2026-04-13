import { ContainerStatsScreen } from "@/modules/containers/screens/ContainerStatsScreen";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ContainerStatsPage({ params }: Props) {
  const { id } = await params;
  return <ContainerStatsScreen containerId={id} />;
}
