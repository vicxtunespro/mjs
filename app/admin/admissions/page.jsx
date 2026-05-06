'use client';

import React from 'react'
import AdmissionSystem from '@/components/admissions'
import { usePageHeaderStore } from "@/store/usePageHeaderStore";
import { useEffect } from 'react';

export default function AdmissionPortal() {
  const setHeader = usePageHeaderStore((state) => state.setHeader);

  useEffect(() => {
    setHeader({
      title: "Admissions",
      subtitle: "Manage admissions of new learners",
    });
  }, [setHeader]);
  return (
    <div>
      <AdmissionSystem />
    </div>
  )
}
