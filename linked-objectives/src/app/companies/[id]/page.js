'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRef } from 'react';

import SidebarLayout from '@/app/components/SidebarLayout';
import CompanyHeader from '@/app/components/CompanyHeader';
import DepartmentCard from '@/app/components/DepartmentCard';
import OkrTable from '@/app/components/OkrTable';

export default function CompanyPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleDepts, setVisibleDepts] = useState(3);
  const departmentSectionRef = useRef(null);

  const scrollToDepartments = () => {
    departmentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!id) return;

    async function fetchCompany() {
      try {
        const res = await fetch(`/api/companies/${id}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to load company data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCompany();
  }, [id]);

  if (loading) return <p className="p-6 text-lg">Loading company data...</p>;
  if (!data) return <p className="p-6 text-red-500">Error loading company data.</p>;

  return (
    <SidebarLayout title="Company Overview">
      <div className="flex justify-center py-6 bg-gray-100 min-h-screen">
        <div className="max-w-5xl w-full space-y-6 px-4">
          <CompanyHeader name={data.name} homepage={data.homepage} stats={data.stats} onDepartmentsClick={scrollToDepartments}/>

          <div className="bg-white rounded-xl shadow p-6" ref={departmentSectionRef}>
            <h2 className="text-xl font-semibold mb-4">Departments</h2>
            <div className="space-y-3">
              {data.departments?.slice(0, visibleDepts).map((dept, i) => (
                <DepartmentCard key={dept.id} department={dept} index={i} />
              ))}

              {visibleDepts < data.departments.length && (
                <div
                  className="text-blue-600 text-sm hover:underline cursor-pointer"
                  onClick={() => setVisibleDepts((prev) => prev + 3)}
                >
                  Show More ...
                </div>
              )}
            </div>
          </div>

          <OkrTable okrs={data.okrs} />
        </div>
      </div>
    </SidebarLayout>
  );
}
