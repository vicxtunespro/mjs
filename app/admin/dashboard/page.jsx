import React from 'react'
import UnderConstruction from '@/components/UC';
import InfoCardArea from '@/components/infoCards';
import LearnersTable from '@/components/tables/clientsTable';
import StudentSummary from '@/components/charts/studentSummary';
import studentsData from '@/src/data/students.json';
import EventManagementSystem from '@/components/eventManagementSystem';
import AdmissionSystem from '@/components/admissions';

export default function Dashboard() {
  return (
    <div className='flex flex-col bg-gradient-to-br from-primary to-primary-midtone
          dark:bg-gradient-to-br dark:from-background-dark dark:to-secondary
          border border-primary dark:border-secondary-minus'>
      <InfoCardArea />
      <StudentSummary data={studentsData} />
      <LearnersTable />
      {/* <EventManagementSystem /> */}
      {/* <UnderConstruction /> */}
      {/* <AdmissionSystem /> */}
    </div>
  )
}
