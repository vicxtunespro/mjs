import React from 'react'
import Sidebar from '@/components/sidebar'
import Modal from '@/components/Data Models/modal'

export default function AdministrationPortal({ children}) {
  return (
    <div className='text-primary dark:text-secondary'>
      <div className='flex relative'>
        <Modal />
        <Sidebar />
        <div className='fixed top-0 z-40 h-16 w-full shadow-xl bg-primary dark:bg-secondary'>

        </div>
        <main className="relative z-30 w-full mt-16 bg-">
          {children}
        </main>
      
      </div>
      <footer className="fixed text-center bg-grey-200 bottom-0 w-full p-4 ">
        <p className='text-right text-secondary  dark:text-primary text-xs'>&copy; {new Date().getFullYear()} Dementa Solutions</p>
      </footer>
    </div>
  )
}
