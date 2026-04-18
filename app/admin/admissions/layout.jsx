'use client'
import SectionHeader from "@/components/ui/sectionHeader";
import { BookAlert, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentAdmissionLayout({ children }) {
    const router = useRouter();
    const handleNewInterview = () =>{
        router.push('/admin/admissions/interview')
    }
    const handleNewStudent = () =>{
        router.push('/admin/admissions/new')
    }

    return (
        <div className="bg-primary dark:bg-secondary overflow-hidden py-2">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:items-center md:flex-row justify-between mb-6">
                    <div className='px-4 pt-4'>
                        <SectionHeader Icon={UserPlus} title="Admission Management" subtitle="Manage student admissions efficiently" />
                    </div>
                    <div className='flex gap-2 justify-center  md:justify-end mx-4 md:w-[20rem]'>
                        <button
                            onClick={() => handleNewInterview()}
                            className="w-full align-right flex items-center justify-center bg-secondary text-primary dark:text-secondary px-4 py-2 rounded-lg hover:bg-secondary transition"
                        >
                            <BookAlert size={16} className="mr-2" />
                            <p className='text-xs md:text-md'>Issue Interview</p>
                        </button>
                        <button
                            onClick={() => handleNewStudent()}
                            className="w-full md:w-max-72 align-right flex items-center justify-center bg-secondary text-primary dark:text-secondary px-4 py-2 rounded-sm hover:bg-secondary transition"
                        >
                            <UserPlus size={16} className="mr-2" />
                            <p className='text-xs md:text-md'>New Candidate</p>
                        </button>
                    </div>
                </div>
                { children }
            </div>
        </div>
    )
}