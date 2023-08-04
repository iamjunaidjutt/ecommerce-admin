import prismadb from "@/lib/prismadb"


interface DashboardProps {
  params: { storeId: string }
}


const Dashboard: React.FC<DashboardProps> = async ({ params }) => {
  const { storeId } = params

  const store = await prismadb.store.findUnique({
    where: { id: storeId }
  });

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Store Name: {store?.name}</p>
    </div>
  )
}

export default Dashboard;
