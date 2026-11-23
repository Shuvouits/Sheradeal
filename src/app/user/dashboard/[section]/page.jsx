import UserSection from "@/components/user/dashboard/UserSection";

export default async function UserDashboardSectionPage({ params }) {
  const { section } = await params;

  return <UserSection section={section} />;
}