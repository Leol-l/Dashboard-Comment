import SectionDashboardTemplate from '../../components/SectionDashboardTemplate';

export default async function SectionPage({ searchParams }) {
  const params = await searchParams;
  const sectionParam = params?.section;

  const section = sectionParam === 'ERP' || sectionParam === 'Admin' || sectionParam === 'Support'
    ? sectionParam
    : 'Support';

  return <SectionDashboardTemplate section={section} />;
}
