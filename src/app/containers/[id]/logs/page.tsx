import { ContainerLogsScreen } from "@/modules/containers/screens/ContainerLogsScreen";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ContainerLogsPage({ params }: Props) {
  const { id } = await params;
  return <ContainerLogsScreen containerId={id} />;
}
