import React, { useRef } from 'react';
import { Download, Printer, X } from 'lucide-react';
import { StudentData } from '../types';
import { format } from 'date-fns';

interface SuccessReportProps {
  data: StudentData;
  guardian1Data?: any;
  guardian2Data?: any;
  onClose: () => void;
  onPrint: () => void;
}

export const SuccessReport: React.FC<SuccessReportProps> = ({
  data,
  guardian1Data,
  guardian2Data,
  onClose,
  onPrint
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (reportRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Admission Letter - ${data.name.first_name} ${data.name.last_name}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 2rem; }
                .header { text-align: center; margin-bottom: 2rem; }
                .section { margin-bottom: 1.5rem; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
              </style>
            </head>
            <body>
              ${reportRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Registration Successful 🎉</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={reportRef} className="p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">MJS ACADEMY</h1>
            <p className="text-gray-600">Student Admission Letter</p>
          </div>

          {/* Student Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Registration ID</p>
                <p className="font-medium">{data.registration_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium">
                  {data.name.first_name} {data.name.last_name} {data.name.other_names}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium">{format(new Date(data.date_of_birth), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium">{data.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Section/Class</p>
                <p className="font-medium">{data.section} - {data.class.name}</p>
              </div>
              {data.class.stream && (
                <div>
                  <p className="text-sm text-gray-600">Stream</p>
                  <p className="font-medium">{data.class.stream}</p>
                </div>
              )}
            </div>
          </div>

          {/* Guardian Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Guardian Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Primary Guardian</p>
                <p className="font-medium">{data.guardian1?.full_name}</p>
                <p className="text-sm text-gray-600">Relationship: {data.guardian1?.relationship}</p>
                <p className="text-sm">Contact: {data.guardian1?.contact}</p>
              </div>
              
              {data.guardian2?.full_name && (
                <div>
                  <p className="text-sm text-gray-600">Secondary Guardian</p>
                  <p className="font-medium">{data.guardian2.full_name}</p>
                  <p className="text-sm text-gray-600">Relationship: {data.guardian2.relationship}</p>
                  <p className="text-sm">Contact: {data.guardian2.contact}</p>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Next Steps</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
              <li>Please keep this admission letter for your records</li>
              <li>Report to the school administration with this letter</li>
              <li>Complete any remaining payment procedures</li>
              <li>Attend orientation session (date will be communicated)</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Letter
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};