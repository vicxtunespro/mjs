import StudentAdmissionForm 
from "@/components/students/admission/StudentAdmissionForm";

export default function NewStudent() {
    return(
        <div className="mx-auto max-w-4xl px-4 py-8">
            <StudentAdmissionForm />
        </div>
    )
}