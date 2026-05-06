'use client'

import { useEffect } from 'react';
import EnhancedStudentTable from "@/components/pages/advancedStudent";
import { usePageHeaderStore } from "@/store/usePageHeaderStore";


export default function NewStudent() {
    const setHeader = usePageHeaderStore((state) => state.setHeader);

    useEffect(() => {
            setHeader({
                title: "Students",
                subtitle: "Manage learner profiles, admissions, and academic records",
            });
        }, [setHeader]);

    return(

        <EnhancedStudentTable />
    )
}