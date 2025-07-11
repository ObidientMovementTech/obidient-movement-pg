import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";

interface MyModalProps {
  selectedOptgroup?: any[];
  selectedOptions?: any[];
  setSelectedOptions?: (options: any) => void;
  setSelectedOptgroup?: (optgroup: any) => void;
}

export default function MyModal({}: MyModalProps) {
  let [isOpen, setIsOpen] = useState(true)

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }

  return (
    <>
     <section className='grid grid-cols-[1fr,_auto] items-center gap-4 w-full text-sm focus:outline-none data-[hover]:bg-black/30  border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-200 dark:bg-secondary-light text-gray-400 dark:text-gray-200 p-2'>
    <div>
      {
        false ? (<></>):(
          <p>
          e.g., Email, Phone Call, Text Message
          </p>
        )
      }
    </div>
    <Button
        onClick={open}
        className="border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-200 dark:bg-secondary-light text-gray-600 dark:text-gray-200 p-2 hover:scale-95 duration-300"
      >
        <ArrowsPointingOutIcon className=' size-6'/>
      </Button>
     </section>

      <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={close} __demoMode>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0 border border-gray-300 dark:border-gray-600"
            >
              <DialogTitle as="h3" className="text-base/7 font-medium text-gray-900 dark:text-gray-100">
                Payment successful
              </DialogTitle>
              <p className="mt-2 text-sm/6 text-gray-700 dark:text-gray-300">
                
              </p>
              <div className="mt-4">
                <Button
                  className=" bg-black dark:bg-gray-800 text-white dark:text-gray-100 py-1 px-4 rounded-lg"
                  onClick={close}
                >
                  Save
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}
