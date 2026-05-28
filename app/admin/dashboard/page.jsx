'use client'
import React, { useEffect, useState } from 'react'
import UnderConstruction from '@/components/UC';
import InfoCardArea from '@/components/infoCards';
import LearnersTable from '@/components/tables/clientsTable';
import StudentSummary from '@/components/charts/studentSummary';
import studentsData from '@/src/data/students.json';
import { getStudents } from '@/src/modules/students/students.services.ts'
import AuthGuard from '@/components/auth/AuthGuard';


export default function Dashboard() {
  const [studentsData, setStudentsData] = useState([]);

  const fetchStudentsData = async () => {
      try {
        const results = await getStudents();

        if(results){
          setStudentsData(results)
        }
      } catch (error) {
        throw new Error("Could not fetch students data")
      }
  
    }
  

  useEffect(()=>{
    fetchStudentsData();
  })
  return (
    <AuthGuard
      allowedRoles={['school_admin']}
    >
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
    </AuthGuard>
  )
}
