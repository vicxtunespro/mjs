"use client"
import clsx from "clsx";
import { Content } from "next/font/google";

const { default: useModalStore } = require("@/store/modalStore");
const { X } = require("lucide-react");


const Modal = () => {
  const { isOpen, modalContent, closeModal, isLoading } = useModalStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 h-[80vh] top-20">
      {/* Background Overlay */}
      <div className="absolute bg-secondary opacity-50 z-10 w-full h-full" onClick={closeModal}></div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#b91c1c]"></div>
        </div>
      ) : (
        <>
          <div className="inset-1 bottom-0 flex items-center justify-center p-4 h-fit w-full relative z-20">
            <div className="bg-primary dark:bg-secondary rounded-lg opacity-100 shadow-xl w-full h-full max-w-2xl max-h-screen overflow-y-auto">
              <div className='flex justify-between items-center bg-grey-200 p-2'>
                <h2 className="text-sm font-semibold text-[#374151]">Interview Form</h2>
                <span>
                  <X size={16} className="text-[#374151] hover:text-[#b91c1c] cursor-pointer" onClick={closeModal} />
                </span>
              </div>
              {modalContent}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Modal;

