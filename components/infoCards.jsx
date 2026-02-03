"use client"
import { HomeIcon, User, UserRoundCogIcon, Users2 } from 'lucide-react'
import Link from 'next/link';
import React from 'react'
import { useState } from 'react';

const SampleData = [
  {
    id: 1,
    title: "Learners",
    count: 1068,
    filters: [
      { id: 'all', title: 'All' },
      { id: 'nursery', title: 'Nursery' },
      { id: 'primary', title: 'Primary' },
      { id: 'secondary', title: 'Secondary' }
    ],
    icon: <Users2 className='text-primary dark:text-secondary w-6 h-6' />
  },
  {
    id: 2,
    title: "Staff",
    count: 87,
    filters: [
      { id: 'all', title: 'All' },
      { id: 'teaching', title: 'Teaching' },
      { id: 'non-teaching', title: 'Non-Teaching' }
    ],
    icon: <Users2 className='text-primary dark:text-secondary w-6 h-6' />
  },
  {
    id: 3,
    title: "Reports",
    count: 50,
    filters: [
      { id: 'all', title: 'All' },
      { id: 'academic', title: 'Academic' },
      { id: 'supervision', title: 'Supervision' },
    ],
    icon: <User className='text-primary dark:text-secondary w-6 h-6' />
  },
  {
    id: 4,
    title: "Classes",
    count: 36,
    filters: [
      { id: 'all', title: 'All' },
      { id: 'nursery', title: 'Nursery' },
      { id: 'primary', title: 'Primary' },
    ],
    icon: <HomeIcon className='text-primary dark:text-secondary w-6 h-6' />
  },
];

export default function InfoCardArea() {
  return (
    <div className='w-full p-8 bg-background-light dark:bg-background-dark h-fit py-16 text-secondary dark:text-primary'>

        <div className='w-full grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-4'>
            {
                SampleData.map(({id, count, title, filters, icon}) => (
                      <InfoCard key={id} id={id} count={count} title={title} filters={filters} icon={icon} />
                ))
            }
        </div>
    </div>
  )
}

const InfoCard = ({id, count, title, filters, icon}) => {
    const [activeFilter, setActiveFilter] = useState('all');
    return (
        <div className='
          col-span-4 md:col-span-3 lg:col-span-3
          bg-gradient-to-br from-primary to-primary-midtone
          dark:bg-gradient-to-br dark:from-background-dark dark:to-secondary
          border border-primary dark:border-secondary-minus
          p-4 rounded-lg shadow-md md:min-w-72'
        >
            <a href={`/admin/${title.toLowerCase().replace(/ /g, '-')}`}>
              <div className='flex items-center justify-between'>
                  <div className='leading-tight mb-4 flex flex-col items-start'>
                      <p className='text-4xl font-semibold text-secondary dark:text-primary'>{`${count}`}</p>
                      <p className='text-secondary dark:text-primary-plus'>{`${title?.toUpperCase()}`}</p>
                  </div>
                  <div className='leading-tight mb-4 flex flex-col items-center'>
                      <span className='bg-secondary dark:bg-primary-plus rounded-full p-4'>
                          {icon}
                      </span>
                  </div>
              </div>
            </a>
            <div className="flex gap-0.5 text-xs ">
                {filters && filters.map(({id, title}) => (
                  <FilterBtn key={id} id={id} title={title} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                ))}
            </div>
        </div>
    )
}

const FilterBtn = ({ id, title, activeFilter, setActiveFilter }) => {
    const isActive = activeFilter === id;
    const handleClick = () => {
        setActiveFilter(id);
        console.log(`Filter set to: ${id}`);
    };
    return (
        <div onClick={handleClick} className={`scale-90 bg-background-light dark:bg-secondary-minus cursor-pointer py-1 px-2 rounded-md ${isActive ? 'bg-cta text-primary' : ''}`}>
            {title}
        </div>
    );
};